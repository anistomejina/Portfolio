/**
 * Fallbacks for chip labels that have no real logo in TECH_ICONS:
 * - TEXT_BADGES: a small coloured tile with short letters, for named tools, frameworks and
 *   certifications. These are our own simple badges, not the vendors' logos.
 * - ICON_BADGES: a line icon (Phosphor) in the accent colour, for general skills and achievements.
 * Keys are lower-cased chip labels in every language.
 */

export type TextBadge = { text: string; bg: string; fg: string }

export const TEXT_BADGES: Record<string, TextBadge> = {
  powershell: { text: '>_', bg: '#012456', fg: '#ffffff' },
  nmap: { text: 'NM', bg: '#1d4f91', fg: '#ffffff' },
  acunetix: { text: 'Ax', bg: '#f0532b', fg: '#ffffff' },
  nessus: { text: 'N', bg: '#00a3e0', fg: '#ffffff' },
  wazuh: { text: 'W', bg: '#3595f9', fg: '#ffffff' },
  splunk: { text: '>', bg: '#65a637', fg: '#ffffff' },
  'iso 27001': { text: 'ISO', bg: '#0057a8', fg: '#ffffff' },
  'iso 27017': { text: 'ISO', bg: '#0057a8', fg: '#ffffff' },
  gdpr: { text: 'EU', bg: '#003399', fg: '#ffcc00' },
  nist: { text: 'NIST', bg: '#1a3a6b', fg: '#ffffff' },
  rhcsa: { text: 'RH', bg: '#ee0000', fg: '#ffffff' },
  cnsp: { text: 'CN', bg: '#5b21b6', fg: '#ffffff' },
  'junior penetration tester': { text: 'THM', bg: '#212c42', fg: '#88cc14' },
  'ccna & ccnp': { text: 'CC', bg: '#049fd9', fg: '#ffffff' },
  'mcsa & mcse': { text: 'MS', bg: '#00a4ef', fg: '#ffffff' },
  'cloud computing with azure': { text: 'Az', bg: '#0078d4', fg: '#ffffff' },
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
  'top 4% on tryhackme': 'trophy',
  'top 4 % auf tryhackme': 'trophy',
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
