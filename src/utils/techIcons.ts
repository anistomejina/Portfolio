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

export function techIconFor(label: string): TechIcon | null {
  const key = TECH_ALIASES[label.trim().toLowerCase()]
  return key ? (TECH_ICONS[key] ?? null) : null
}
