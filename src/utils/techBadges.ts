/**
 * Fallbacks for chip labels that have no real logo in TECH_ICONS:
 * - TEXT_BADGES: a small coloured tile with short letters, for named tools, frameworks and
 *   certifications. These are our own simple badges, not the vendors' logos.
 * - ICON_BADGES: a line icon (Phosphor) in the accent colour, for general skills and achievements.
 * Keys are lower-cased chip labels in every language.
 */

export type TextBadge = { text: string; bg: string; fg: string }

export const TEXT_BADGES: Record<string, TextBadge> = {
  'ethical hacking': { text: 'EH', bg: '#b91c1c', fg: '#ffffff' },
}

export type IconBadgeName =
  | 'shield-check'
  | 'shield-checkered'
  | 'crosshair'
  | 'path'
  | 'hard-drives'
  | 'bug'
  | 'lock-key'
  | 'network'
  | 'users'
  | 'trophy'
  | 'presentation'
  | 'medal'
  | 'database'
  | 'heartbeat'

export const ICON_BADGES: Record<string, IconBadgeName> = {
  sql: 'database',
  hipaa: 'heartbeat',
  devsecops: 'shield-check',
  'ci/cd security': 'shield-checkered',
  'ci/cd-security': 'shield-checkered',
  'threat detection': 'crosshair',
  routing: 'path',
  'windows server': 'hard-drives',
  'cyber security': 'lock-key',
  networking: 'network',
  netzwerke: 'network',
  'gdsc lead': 'users',
  'gdsc-leitung': 'users',
  '200+ reports to vulnerability disclosure programs': 'bug',
  '200+ reports an vulnerability disclosure programs': 'bug',
  'gdsc cybersecurity chapter lead, pec': 'users',
  'leitung gdsc cybersecurity chapter, pec': 'users',
  '4 security awareness workshops': 'presentation',
  '4 security-awareness-workshops': 'presentation',
  'letter of appreciation, vulnerability disclosure program': 'medal',
  'dankesschreiben, vulnerability disclosure program': 'medal',
}

/** "Ethical hacking" on a job entry is a skill (bug icon); "Ethical Hacking" the certification gets a tile. */
export const ICON_BADGES_CASE_SENSITIVE: Record<string, IconBadgeName> = {
  'Ethical hacking': 'bug',
}
