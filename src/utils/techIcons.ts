import { asset } from '@/utils/assets'
import { TECH_ICONS, type TechIcon } from '@/utils/techIconData'

/** Chip labels (lower-cased) -> icon key in TECH_ICONS. Labels without a match show no logo. */
const TECH_ALIASES: Record<string, string> = {
  python: 'python',
  bash: 'bash',
  'burp suite': 'burpsuite',
  'fortinet 40f': 'fortinet',
  fortinet: 'fortinet',
  aws: 'aws',
  azure: 'azure',
  'microsoft azure': 'azure',
  gcp: 'gcp',
  'google cloud (gcp)': 'gcp',
  oci: 'oracle',
  'oracle cloud (oci)': 'oracle',
  s3: 's3',
  ec2: 'ec2',
  rds: 'rds',
  vpc: 'vpc',
  elb: 'elb',
  lambda: 'lambda',
  dynamodb: 'dynamodb',
  cloudwatch: 'cloudwatch',
  'elastic beanstalk': 'beanstalk',
  redshift: 'redshift',
  'aws cloud practitioner (in progress)': 'aws',
  'aws cloud practitioner (in arbeit)': 'aws',
  powershell: 'powershell',
  rhcsa: 'redhat',
  'red hat': 'redhat',
  'junior penetration tester': 'tryhackme',
  'top 4% on tryhackme': 'tryhackme',
  'top 4 % auf tryhackme': 'tryhackme',
  'ccna & ccnp': 'cisco',
  'mcsa & mcse': 'microsoft',
  'cloud computing with azure': 'azure',
  gdpr: 'eu',
  'claude code': 'claude',
  codex: 'codex',
  docker: 'docker',
  ansible: 'ansible',
  terraform: 'terraform',
  jenkins: 'jenkins',
  git: 'git',
  github: 'github',
  prometheus: 'prometheus',
  grafana: 'grafana',
}

/** A vendor logo image; `dark` is an optional light-coloured version for dark mode. */
export type TechImage = { src: string; dark?: string }

/**
 * Vendors whose logo is in no open icon set: their own small icons, taken from their websites
 * (ISO from Wikimedia Commons) and saved in public/images/logos/.
 */
const IMAGE_LOGOS: Record<string, { src: string; dark?: string }> = {
  nmap: { src: 'images/logos/nmap.png' },
  wazuh: { src: 'images/logos/wazuh.png' },
  acunetix: { src: 'images/logos/acunetix.png' },
  splunk: { src: 'images/logos/splunk.png' },
  nessus: { src: 'images/logos/nessus.png' },
  cnsp: { src: 'images/logos/cnsp.png' },
  'iso 27001': { src: 'images/logos/iso.png' },
  'iso 27017': { src: 'images/logos/iso.png' },
  nist: { src: 'images/logos/nist.png', dark: 'images/logos/nist-dark.png' },
}

/** Vendor logo image(s) for this label, or null. */
export function techImageFor(label: string): TechImage | null {
  const entry = IMAGE_LOGOS[label.trim().toLowerCase()]
  if (!entry) return null
  return { src: asset(entry.src), dark: entry.dark ? asset(entry.dark) : undefined }
}

export function techIconFor(label: string): TechIcon | null {
  const key = TECH_ALIASES[label.trim().toLowerCase()]
  return key ? (TECH_ICONS[key] ?? null) : null
}
