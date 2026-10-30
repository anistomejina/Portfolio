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

/**
 * Vendors whose logo is in no open icon set: their own small icons, saved in public/images/logos/
 * (Nmap's eye, Wazuh, Acunetix, Splunk).
 */
const IMAGE_LOGOS: Record<string, string> = {
  nmap: 'images/logos/nmap.png',
  wazuh: 'images/logos/wazuh.png',
  acunetix: 'images/logos/acunetix.png',
  splunk: 'images/logos/splunk.png',
}

/** URL of a vendor logo image for this label, or null. */
export function techImageFor(label: string): string | null {
  const path = IMAGE_LOGOS[label.trim().toLowerCase()]
  return path ? asset(path) : null
}

export function techIconFor(label: string): TechIcon | null {
  const key = TECH_ALIASES[label.trim().toLowerCase()]
  return key ? (TECH_ICONS[key] ?? null) : null
}
