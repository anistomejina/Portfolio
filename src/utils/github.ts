/**
 * Public GitHub statistics for the analytics page.
 *
 * Fetched in the visitor's browser from the unauthenticated REST API (no key, no server). That API
 * allows 60 requests per hour per visitor IP, and one page load uses three, so results are cached in
 * sessionStorage for CACHE_TTL_MS.
 */

const API = 'https://api.github.com'
const CACHE_TTL_MS = 15 * 60 * 1000
const CACHE_VERSION = 1

/** Days covered by the activity heatmap (12 full weeks). */
export const ACTIVITY_DAYS = 84

/** Languages shown before the rest fold into "other". */
const TOP_LANGUAGES = 5

export type RepoSummary = {
  name: string
  url: string
  description: string
  language: string
  stars: number
  forks: number
  pushedAt: string
}

export type ActivityItem = {
  type: string
  repo: string
  url: string
  createdAt: string
  /** Commits in a push, otherwise 1. */
  count: number
}

export type LanguageShare = {
  /** '' marks the folded "other" bucket. */
  name: string
  repos: number
  share: number
}

export type ActivityDay = {
  /** Local calendar date, YYYY-MM-DD. */
  date: string
  count: number
}

export type GitHubStats = {
  username: string
  profileUrl: string
  createdAt: string
  publicRepos: number
  followers: number
  following: number
  totalStars: number
  totalForks: number
  languages: LanguageShare[]
  recentRepos: RepoSummary[]
  recentActivity: ActivityItem[]
  /** Oldest first, ACTIVITY_DAYS entries ending today. */
  activity: ActivityDay[]
  fetchedAt: number
}

export class GitHubRateLimitError extends Error {
  constructor(public readonly resetAt: number | null) {
    super('GitHub API rate limit reached')
  }
}

type ApiUser = {
  login: string
  html_url: string
  created_at: string
  public_repos: number
  followers: number
  following: number
}

type ApiRepo = {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
  fork: boolean
}

type ApiEvent = {
  type: string
  repo: { name: string }
  created_at: string
  payload?: { size?: number; commits?: unknown[] }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (response.status === 403 || response.status === 429) {
    const reset = Number(response.headers.get('x-ratelimit-reset'))
    throw new GitHubRateLimitError(Number.isFinite(reset) && reset > 0 ? reset * 1000 : null)
  }
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}`)
  return (await response.json()) as T
}

/** YYYY-MM-DD of a date in the visitor's time zone. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function summarizeLanguages(repos: ApiRepo[]): LanguageShare[] {
  const counts = new Map<string, number>()
  for (const repo of repos) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0)
  if (total === 0) return []

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const top = sorted.slice(0, TOP_LANGUAGES)
  const rest = sorted.slice(TOP_LANGUAGES).reduce((sum, [, n]) => sum + n, 0)
  const rows = top.map(([name, n]) => ({ name, repos: n, share: n / total }))
  if (rest > 0) rows.push({ name: '', repos: rest, share: rest / total })
  return rows
}

function eventCount(event: ApiEvent): number {
  if (event.type !== 'PushEvent') return 1
  return Math.max(1, event.payload?.size ?? event.payload?.commits?.length ?? 1)
}

function buildActivity(events: ApiEvent[], today = new Date()): ActivityDay[] {
  const perDay = new Map<string, number>()
  for (const event of events) {
    const key = localDateKey(new Date(event.created_at))
    perDay.set(key, (perDay.get(key) ?? 0) + eventCount(event))
  }
  const days: ActivityDay[] = []
  for (let offset = ACTIVITY_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const date = localDateKey(day)
    days.push({ date, count: perDay.get(date) ?? 0 })
  }
  return days
}

function cacheKey(username: string): string {
  return `github-stats:v${CACHE_VERSION}:${username.toLowerCase()}`
}

function readCache(username: string): GitHubStats | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(username))
    if (!raw) return null
    const stats = JSON.parse(raw) as GitHubStats
    return Date.now() - stats.fetchedAt < CACHE_TTL_MS ? stats : null
  } catch {
    return null
  }
}

function writeCache(stats: GitHubStats): void {
  try {
    sessionStorage.setItem(cacheKey(stats.username), JSON.stringify(stats))
  } catch {
    // Storage full or blocked (private mode): the page still works, it just refetches next time.
  }
}

export async function fetchGitHubStats(username: string, signal?: AbortSignal): Promise<GitHubStats> {
  const cached = readCache(username)
  if (cached) return cached

  const user = encodeURIComponent(username)
  const [profile, repos, events] = await Promise.all([
    getJson<ApiUser>(`/users/${user}`, signal),
    getJson<ApiRepo[]>(`/users/${user}/repos?per_page=100&sort=pushed`, signal),
    getJson<ApiEvent[]>(`/users/${user}/events/public?per_page=100`, signal),
  ])

  const own = repos.filter((repo) => !repo.fork)
  const stats: GitHubStats = {
    username: profile.login,
    profileUrl: profile.html_url,
    createdAt: profile.created_at,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    totalStars: own.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: own.reduce((sum, repo) => sum + repo.forks_count, 0),
    languages: summarizeLanguages(own),
    recentRepos: own.slice(0, 6).map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description ?? '',
      language: repo.language ?? '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      pushedAt: repo.pushed_at,
    })),
    recentActivity: events.slice(0, 6).map((event) => ({
      type: event.type,
      repo: event.repo.name,
      url: `https://github.com/${event.repo.name}`,
      createdAt: event.created_at,
      count: eventCount(event),
    })),
    activity: buildActivity(events),
    fetchedAt: Date.now(),
  }

  writeCache(stats)
  return stats
}
