/**
 * Site-wide personal settings. Edit these first.
 *
 * Empty strings hide the matching button/link in the UI.
 * File paths are relative to the public/ folder (e.g. 'resume.pdf' -> public/resume.pdf).
 */
export const site = {
  /** Shown in the home heading, the browser tab title and image alt text. */
  ownerName: 'Your Name',
  /** Full profile URL, or '' to hide the GitHub button. */
  githubUrl: 'https://github.com/anistomejina',
  /** Full profile URL (e.g. 'https://www.linkedin.com/in/your-handle'), or '' to hide the button. */
  linkedinUrl: '',
  /** Plain address (e.g. 'you@example.com'), or '' to hide the email button. */
  email: '',
  /** Resume file inside public/ (e.g. 'resume.pdf'), or '' to hide the download button. */
  resumeFile: '',
  /** Suggested file name when the resume is downloaded. */
  resumeDownloadName: 'resume.pdf',
  /** Profile picture inside public/. */
  profilePhoto: 'images/profile-placeholder.svg',
  /** GitHub Sponsors page (e.g. 'https://github.com/sponsors/your-handle'), or '' to hide the card. */
  sponsorUrl: '',
  /** Buy Me a Coffee / Ko-fi page, or '' to hide the card. */
  coffeeUrl: '',
} as const

/** GitHub username taken from githubUrl ('' when no GitHub URL is set). Feeds the analytics page. */
export const githubUsername: string =
  site.githubUrl.match(/github\.com\/([^/?#]+)/i)?.[1] ?? ''

/** Browser-tab title for a detail page: "<title> — <owner name>". */
export function pageTitle(title: string): string {
  return `${title} — ${site.ownerName}`
}
