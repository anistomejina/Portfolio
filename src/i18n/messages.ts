/**
 * All visible text of the site, in English (en) and German (de).
 *
 * - UI labels (buttons, eyebrows, status words, accessibility labels) are ready to use.
 * - Everything marked "YOUR CONTENT" is placeholder text: replace it with your own.
 * - Both locales must keep the same shape and the SAME slugs, so switching language on a
 *   detail page keeps working.
 * - Personal links (GitHub, LinkedIn, email, resume) and your name live in src/config/site.ts.
 * - Images and files go in public/ and are referenced through asset('path/inside/public').
 */
import { site } from '@/config/site'
import type {
  ExperienceEntry,
  Post,
  ProfileStat,
  Project,
  SocialLink,
  ToolboxColumn,
} from '@/types/content'
import { asset } from '@/utils/assets'
import { EMAIL_LINK, hasEmail } from '@/utils/email'

// ---------------------------------------------------------------------------------------------
// Locales
// ---------------------------------------------------------------------------------------------

export type Locale = 'en' | 'de'

/** Supported locales, in the order the DE / EN buttons appear in the nav. */
export const availableLocales: readonly Locale[] = ['de', 'en']

/** Used when there is no saved choice and the browser language is not supported. */
export const defaultLocale: Locale = 'en'

/** Native names: aria-label and title of the language buttons. */
export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
}

/** BCP 47 codes: <html lang> and Intl date formatting. */
export const localeCodes: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en-US',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (availableLocales as readonly string[]).includes(value)
}

// ---------------------------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------------------------

export type NavigationKey = 'home' | 'experience' | 'projects' | 'blog' | 'support'

export type NavigationItem = {
  key: NavigationKey
  path: string
}

/** Nav pill items, in display order. Labels come from `messages[locale].navigation[key]`. */
export const navigationItems: readonly NavigationItem[] = [
  { key: 'home', path: '/' },
  { key: 'experience', path: '/experience' },
  { key: 'projects', path: '/projects' },
  { key: 'blog', path: '/blog' },
  { key: 'support', path: '/support' },
]

/** In-page anchors on the home view (deep-linkable as /#projects and /#blog). */
export const homeSectionIds = {
  projects: 'projects',
  blog: 'blog',
} as const

// ---------------------------------------------------------------------------------------------
// Shared, non-translated content
// ---------------------------------------------------------------------------------------------

/** YOUR CONTENT: technology pills on the home hero (same in every language). */
export const techStack: readonly string[] = [
  'AWS',
  'Azure',
  'GCP',
  'OCI',
  'Terraform',
  'Docker',
  'Jenkins',
  'Burp Suite',
  'Splunk',
  'Python',
]

// ---------------------------------------------------------------------------------------------
// Message tree shape
// ---------------------------------------------------------------------------------------------

export type Messages = {
  navigation: Record<NavigationKey, string>
  accessibility: {
    mainNavigation: string
    languageSelector: string
    switchToLightTheme: string
    switchToDarkTheme: string
    /** aria-label of the hero tech pill list. */
    techStack: string
    /** aria-label of the hero stats strip. */
    activityIndicators: string
    /** Alt text of the profile photo. */
    profilePhoto: string
    /** Optional visually hidden suffix for links that open in a new tab. */
    opensInNewTab: string
  }
  profile: {
    /** Small mono "profile" label (available for the profile card). */
    cardLabel: string
    /** Role sentence: roleStart + <strong>focusPrimary</strong> + roleConnector + <strong>focusSecondary</strong> + "." */
    roleStart: string
    focusPrimary: string
    roleConnector: string
    focusSecondary: string
    /** Status line next to the green dot. */
    availability: string
    stats: ProfileStat[]
    /** Hero buttons, in order. Links with an empty href are hidden. */
    socialLinks: SocialLink[]
  }
  posts: {
    eyebrow: string
    sectionTitle: string
    featuredLabel: string
    readArticle: string
    viewAllPosts: string
    archiveTitle: string
    inProgressLabel: string
    placeholderLabel: string
    comingSoon: string
    backToBlog: string
    notFoundTitle: string
    notFoundText: string
    items: Post[]
  }
  experience: {
    eyebrow: string
    pageTitle: string
    toolboxLabel: string
    /** aria-label of each entry's skill list. */
    skillsLabel: string
    entries: ExperienceEntry[]
    toolbox: ToolboxColumn[]
  }
  projects: {
    eyebrow: string
    sectionTitle: string
    pageEyebrow: string
    pageTitle: string
    newLabel: string
    liveLabel: string
    inProgressLabel: string
    problemLabel: string
    resultLabel: string
    sourceCode: string
    viewDemo: string
    viewProject: string
    backToProjects: string
    notFoundTitle: string
    notFoundText: string
    comingSoon: string
    viewAllProjects: string
    items: Project[]
  }
  analytics: {
    viewProfile: string
  }
  support: {
    eyebrow: string
    pageTitle: string
    intro: string
    waysTitle: string
    starTitle: string
    starText: string
    starAction: string
    sponsorTitle: string
    sponsorText: string
    sponsorAction: string
    coffeeTitle: string
    coffeeText: string
    coffeeAction: string
    shareTitle: string
    shareText: string
    shareAction: string
    shareCopied: string
    shareFailed: string
    hireTitle: string
    hireText: string
    hireAction: string
    contactTitle: string
    contactNote: string
    contactEmail: string
    contactLinkedIn: string
    contactGitHub: string
  }
}

// ---------------------------------------------------------------------------------------------
// Shared link and media values (edit them in src/config/site.ts or here)
// ---------------------------------------------------------------------------------------------

const links = {
  github: site.githubUrl,
  linkedin: site.linkedinUrl,
  email: hasEmail ? EMAIL_LINK : '',
  resume: site.resumeFile ? asset(site.resumeFile) : '',
}

// ---------------------------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------------------------

const en: Messages = {
  navigation: {
    home: 'home',
    experience: 'experience',
    projects: 'projects',
    blog: 'blog',
    support: 'support',
  },

  accessibility: {
    mainNavigation: 'Main navigation',
    languageSelector: 'Select language',
    switchToLightTheme: 'Switch to light theme',
    switchToDarkTheme: 'Switch to dark theme',
    techStack: 'Main technologies',
    activityIndicators: 'Activity indicators',
    profilePhoto: `Photo of ${site.ownerName}`,
    opensInNewTab: '(opens in a new tab)',
  },

  profile: {
    cardLabel: 'profile',
    // YOUR CONTENT: the role sentence under your name.
    roleStart: 'DevSecOps Engineer and',
    focusPrimary: 'Security Researcher',
    roleConnector: 'focused on',
    focusSecondary: 'offensive security',
    availability: 'available for projects and opportunities',
    // YOUR CONTENT
    stats: [
      { value: '200+', label: 'VDP reports submitted' },
      { value: 'Top 4%', label: 'on TryHackMe' },
      { value: '8+', label: 'certifications' },
    ],
    socialLinks: [
      {
        label: 'download resume',
        href: links.resume,
        glyph: '↓',
        primary: true,
        download: site.resumeDownloadName,
      },
      { label: 'LinkedIn', href: links.linkedin, brand: 'linkedin' },
      { label: 'GitHub', href: links.github, brand: 'github' },
      { label: 'Gmail', href: links.email, brand: 'email' },
    ],
  },

  posts: {
    eyebrow: '~/blog',
    sectionTitle: 'Recent posts',
    featuredLabel: 'featured write-up',
    readArticle: 'read article',
    viewAllPosts: 'view all posts',
    archiveTitle: 'All posts',
    inProgressLabel: 'in progress',
    placeholderLabel: 'coming soon',
    comingSoon: 'Coming soon',
    backToBlog: 'back to blog',
    notFoundTitle: 'Post not found',
    notFoundText: 'This post does not exist or does not have a published page yet.',
    // YOUR CONTENT: the home page shows the first two.
    items: [
      {
        slug: 'first-post',
        title: 'Your first post title',
        excerpt:
          'Write a short description of the post. It appears on the card and as the lead paragraph of the post page.',
        category: 'writeup',
        publishedAt: '2026-01-15',
        readingTimeMinutes: 5,
        featured: true,
        hasDetails: true,
      },
      {
        slug: 'work-in-progress',
        title: 'Post in progress',
        excerpt: 'Write a short description of a post you are still working on.',
        category: 'learning',
        hasDetails: true,
        locked: true,
      },
      {
        slug: 'next-post',
        title: 'Next post',
        excerpt: 'This space will be filled with new content soon.',
        category: 'notes',
        placeholder: true,
      },
    ],
  },

  experience: {
    eyebrow: '~/experience',
    pageTitle: 'Experience',
    toolboxLabel: 'technologies & tools',
    skillsLabel: 'Skills',
    // YOUR CONTENT: newest first.
    entries: [
      {
        slug: 'entelegen',
        role: 'DevSecOps Engineer',
        period: 'Dec 2025 — present',
        company: 'Entelegen Analytics LLP',
        location: 'Coimbatore, India',
        // YOUR CONTENT: generic summary, replace with your actual work.
        description:
          'Building security into CI/CD pipelines and cloud infrastructure: automating deployments with infrastructure as code, hardening AWS environments and adding security checks and monitoring to the delivery process.',
        skills: ['DevSecOps', 'AWS', 'Terraform', 'Jenkins', 'Docker', 'CI/CD security'],
      },
      {
        slug: 'career-ladder',
        role: 'Security Analyst',
        period: 'Dec 2024 — Nov 2025',
        company: 'Career Ladder',
        location: 'Coimbatore, India',
        description:
          'Cloud security and threat detection across 15 AWS services (EC2, S3, Lambda and more). Built secure S3 automation pipelines with Terraform and Jenkins for compliance, and automated vulnerability scans and incident response on EC2 and Lambda with Docker, Prometheus and Grafana for continuous monitoring.',
        skills: ['AWS', 'Terraform', 'Jenkins', 'Docker', 'Prometheus', 'Grafana', 'Threat detection'],
      },
      {
        slug: 'systech',
        role: 'Cyber Security Intern',
        period: 'May 2024 — Dec 2024',
        company: 'Systech Network Academy',
        location: 'Coimbatore, India',
        description:
          'Configured a Fortinet 40F firewall, optimised routing and analysed network traffic. Gained hands-on experience with switches, routers and Windows Server, and used Azure security tooling and ethical hacking to assess cloud vulnerabilities.',
        skills: ['Fortinet 40F', 'Routing', 'Windows Server', 'Azure', 'Ethical hacking'],
      },
      {
        slug: 'paavai',
        role: 'B.E. in Cyber Security',
        period: 'Nov 2020 — May 2024',
        company: 'Paavai Engineering College',
        location: 'Namakkal, India',
        description:
          'Bachelor of Engineering in Cyber Security, CGPA 8.3. Led the GDSC Cybersecurity Chapter at PEC College, organising training and workshops.',
        skills: ['Cyber security', 'Networking', 'GDSC lead'],
      },
    ],
    // YOUR CONTENT: one row per category ("~/" is stripped for display).
    toolbox: [
      {
        label: '~/Languages',
        items: ['Python', 'SQL', 'Bash', 'PowerShell'],
      },
      {
        label: '~/Security tools',
        items: ['Burp Suite', 'Nmap', 'Acunetix', 'Nessus', 'Splunk', 'Wazuh', 'Fortinet 40F'],
      },
      {
        label: '~/Cloud platforms',
        items: ['AWS', 'Microsoft Azure', 'Google Cloud (GCP)', 'Oracle Cloud (OCI)'],
      },
      {
        label: '~/AWS services',
        items: ['S3', 'EC2', 'RDS', 'VPC', 'ELB', 'Lambda', 'DynamoDB', 'CloudWatch', 'Elastic Beanstalk', 'Redshift'],
      },
      {
        label: '~/AI tools',
        items: ['Claude Code', 'Codex'],
      },
      {
        label: '~/CI/CD & IaC',
        items: ['Docker', 'Ansible', 'Terraform', 'Jenkins', 'Git', 'GitHub'],
      },
      {
        label: '~/GRC',
        items: ['ISO 27001', 'ISO 27017', 'GDPR', 'NIST', 'HIPAA'],
      },
      {
        label: '~/Certifications',
        items: ['RHCSA', 'CNSP', 'Junior Penetration Tester', 'CCNA & CCNP', 'MCSA & MCSE', 'Cloud Computing with Azure', 'Ethical Hacking', 'AWS Cloud Practitioner (in progress)'],
      },
      {
        label: '~/Achievements',
        items: ['200+ reports to Vulnerability Disclosure Programs', 'Top 4% on TryHackMe', 'GDSC Cybersecurity Chapter lead, PEC', '4 security awareness workshops', 'Letter of Appreciation, Vulnerability Disclosure Program'],
      },
    ],
  },

  projects: {
    eyebrow: '~/projects',
    sectionTitle: 'My projects',
    pageEyebrow: '~/projects',
    pageTitle: 'My Builds',
    newLabel: 'New!',
    liveLabel: 'available',
    inProgressLabel: 'in progress',
    problemLabel: 'Problem',
    resultLabel: 'Result',
    sourceCode: 'source code',
    viewDemo: 'view demo',
    viewProject: 'view project',
    backToProjects: 'back to projects',
    notFoundTitle: 'Project not found',
    notFoundText: 'This project does not exist or does not have a published page yet.',
    comingSoon: 'Coming soon',
    viewAllProjects: 'view all projects',
    // The home page shows the first three (first = featured); /projects shows all.
    items: [
      {
        slug: 'ssh-honeypot-aws',
        index: '01',
        tag: 'cloud security',
        title: 'SSH Honeypot in AWS',
        topics: ['Cowrie', 'AWS EC2', 'Docker', 'VPC Flow Logs', 'CloudWatch'],
        status: 'live',
        hasDetails: true,
      },
      {
        slug: 'malware-analysis-pywhat',
        index: '02',
        tag: 'threat intel',
        title: 'Malware Analysis with PyWhat',
        impact: {
          problem: 'Spotting malicious files and indicators by hand is slow.',
          result: 'Used PyWhat to identify malware signatures and behaviours and turned the findings into detection insights.',
        },
        status: 'live',
        hasDetails: true,
      },
      {
        slug: 'three-tier-jenkins',
        index: '03',
        tag: 'devops',
        title: '3-Tier Architecture with Jenkins',
        impact: {
          problem: 'Data on AWS was hard to analyse and the ETL steps ran unreliably.',
          result: 'A Jenkins-built 3-tier AWS stack with Redshift for analysis and Airflow for reliable, timely ETL.',
        },
        status: 'live',
        hasDetails: true,
      },
      {
        slug: 'ecommerce-aws',
        index: '04',
        tag: 'cloud',
        title: 'E-Commerce Site on AWS',
        impact: {
          problem: 'A team of three needed a robust, secure home for a web shop.',
          result: 'I designed the cloud architecture on S3, Route 53, CloudFront and ACM to host it.',
        },
        status: 'live',
        hasDetails: true,
      },
    ],
  },

  analytics: {
    viewProfile: 'view my GitHub profile',
  },

  support: {
    eyebrow: '~/support',
    pageTitle: 'Support',
    // YOUR CONTENT
    intro: 'If my projects or posts helped you, here are a few ways to support my work. Every bit helps me keep building and writing.',
    waysTitle: 'Ways to support',
    starTitle: 'Star a repository',
    starText: 'Free and takes a second. Stars help other people find the projects.',
    starAction: 'open GitHub',
    sponsorTitle: 'Sponsor on GitHub',
    sponsorText: 'Monthly or one-time sponsorship that goes straight into open-source work.',
    sponsorAction: 'become a sponsor',
    coffeeTitle: 'Buy me a coffee',
    coffeeText: 'A small one-time thank-you that keeps the late-night coding going.',
    coffeeAction: 'buy a coffee',
    shareTitle: 'Share this site',
    shareText: 'Know someone who would find this useful? Send them the link.',
    shareAction: 'copy link',
    shareCopied: 'link copied',
    shareFailed: 'copy failed, use the address bar',
    hireTitle: 'Work with me',
    hireText: 'Open to freelance projects, collaborations and full-time roles.',
    hireAction: 'get in touch',
    contactTitle: 'Get in touch',
    // YOUR CONTENT
    contactNote: 'I usually reply within two working days.',
    contactEmail: 'Gmail',
    contactLinkedIn: 'LinkedIn',
    contactGitHub: 'GitHub issues',
  },
}

// ---------------------------------------------------------------------------------------------
// Deutsch
// ---------------------------------------------------------------------------------------------

const de: Messages = {
  navigation: {
    home: 'start',
    experience: 'erfahrung',
    projects: 'projekte',
    blog: 'blog',
    support: 'support',
  },

  accessibility: {
    mainNavigation: 'Hauptnavigation',
    languageSelector: 'Sprache auswählen',
    switchToLightTheme: 'Zum hellen Design wechseln',
    switchToDarkTheme: 'Zum dunklen Design wechseln',
    techStack: 'Wichtigste Technologien',
    activityIndicators: 'Kennzahlen',
    profilePhoto: `Foto von ${site.ownerName}`,
    opensInNewTab: '(öffnet in neuem Tab)',
  },

  profile: {
    cardLabel: 'profil',
    // YOUR CONTENT: the role sentence under your name.
    roleStart: 'DevSecOps Engineer und',
    focusPrimary: 'Security Researcher',
    roleConnector: 'mit Fokus auf',
    focusSecondary: 'Offensive Security',
    availability: 'offen für Projekte und neue Herausforderungen',
    // YOUR CONTENT
    stats: [
      { value: '200+', label: 'VDP-Reports eingereicht' },
      { value: 'Top 4 %', label: 'auf TryHackMe' },
      { value: '8+', label: 'Zertifikate' },
    ],
    socialLinks: [
      {
        label: 'CV herunterladen',
        href: links.resume,
        glyph: '↓',
        primary: true,
        download: site.resumeDownloadName,
      },
      { label: 'LinkedIn', href: links.linkedin, brand: 'linkedin' },
      { label: 'GitHub', href: links.github, brand: 'github' },
      { label: 'Gmail', href: links.email, brand: 'email' },
    ],
  },

  posts: {
    eyebrow: '~/blog',
    sectionTitle: 'Neueste Beiträge',
    featuredLabel: 'ausgewähltes Writeup',
    readArticle: 'Artikel lesen',
    viewAllPosts: 'alle Beiträge ansehen',
    archiveTitle: 'Alle Beiträge',
    inProgressLabel: 'in Arbeit',
    placeholderLabel: 'demnächst',
    comingSoon: 'Demnächst',
    backToBlog: 'zurück zum Blog',
    notFoundTitle: 'Beitrag nicht gefunden',
    notFoundText: 'Dieser Beitrag existiert nicht oder ist noch nicht veröffentlicht.',
    // YOUR CONTENT (same slugs as English): the home page shows the first two.
    items: [
      {
        slug: 'first-post',
        title: 'Titel deines ersten Beitrags',
        excerpt:
          'Fasse den Beitrag hier kurz zusammen. Der Text erscheint auf der Karte und als Einleitung der Beitragsseite.',
        category: 'writeup',
        publishedAt: '2026-01-15',
        readingTimeMinutes: 5,
        featured: true,
        hasDetails: true,
      },
      {
        slug: 'work-in-progress',
        title: 'Beitrag in Arbeit',
        excerpt: 'Beschreibe kurz einen Beitrag, an dem du noch arbeitest.',
        category: 'learning',
        hasDetails: true,
        locked: true,
      },
      {
        slug: 'next-post',
        title: 'Nächster Beitrag',
        excerpt: 'Hier erscheinen bald neue Inhalte.',
        category: 'notes',
        placeholder: true,
      },
    ],
  },

  experience: {
    eyebrow: '~/erfahrung',
    pageTitle: 'Erfahrung',
    toolboxLabel: 'Technologien & Tools',
    skillsLabel: 'Skills',
    // YOUR CONTENT (same slugs as English): newest first.
    entries: [
      {
        slug: 'entelegen',
        role: 'DevSecOps Engineer',
        period: 'Dez. 2025 — heute',
        company: 'Entelegen Analytics LLP',
        location: 'Coimbatore, Indien',
        // YOUR CONTENT: allgemeine Zusammenfassung, durch deine tatsächliche Arbeit ersetzen.
        description:
          'Sicherheit in CI/CD-Pipelines und Cloud-Infrastruktur verankern: Deployments mit Infrastructure as Code automatisieren, AWS-Umgebungen härten und Security-Checks sowie Monitoring in den Delivery-Prozess integrieren.',
        skills: ['DevSecOps', 'AWS', 'Terraform', 'Jenkins', 'Docker', 'CI/CD-Security'],
      },
      {
        slug: 'career-ladder',
        role: 'Security Analyst',
        period: 'Dez. 2024 — Nov. 2025',
        company: 'Career Ladder',
        location: 'Coimbatore, Indien',
        description:
          'Cloud-Security und Threat Detection über 15 AWS-Services (EC2, S3, Lambda u. a.). Sichere S3-Automatisierungspipelines mit Terraform und Jenkins für Compliance aufgebaut sowie Schwachstellenscans und Incident Response auf EC2 und Lambda mit Docker, Prometheus und Grafana für kontinuierliches Monitoring automatisiert.',
        skills: ['AWS', 'Terraform', 'Jenkins', 'Docker', 'Prometheus', 'Grafana', 'Threat Detection'],
      },
      {
        slug: 'systech',
        role: 'Cyber Security Intern',
        period: 'Mai 2024 — Dez. 2024',
        company: 'Systech Network Academy',
        location: 'Coimbatore, Indien',
        description:
          'Eine Fortinet-40F-Firewall konfiguriert, Routing optimiert und Netzwerkverkehr analysiert. Praxiserfahrung mit Switches, Routern und Windows Server gesammelt und Cloud-Schwachstellen mit Azure-Security-Tools und Ethical Hacking bewertet.',
        skills: ['Fortinet 40F', 'Routing', 'Windows Server', 'Azure', 'Ethical Hacking'],
      },
      {
        slug: 'paavai',
        role: 'B.E. in Cyber Security',
        period: 'Nov. 2020 — Mai 2024',
        company: 'Paavai Engineering College',
        location: 'Namakkal, Indien',
        description:
          'Bachelor of Engineering in Cyber Security, CGPA 8,3. Leitung des GDSC Cybersecurity Chapters am PEC College mit Trainings und Workshops.',
        skills: ['Cyber Security', 'Netzwerke', 'GDSC-Leitung'],
      },
    ],
    // YOUR CONTENT: one row per category ("~/" is stripped for display).
    toolbox: [
      {
        label: '~/Sprachen',
        items: ['Python', 'SQL', 'Bash', 'PowerShell'],
      },
      {
        label: '~/Security-Tools',
        items: ['Burp Suite', 'Nmap', 'Acunetix', 'Nessus', 'Splunk', 'Wazuh', 'Fortinet 40F'],
      },
      {
        label: '~/Cloud-Plattformen',
        items: ['AWS', 'Microsoft Azure', 'Google Cloud (GCP)', 'Oracle Cloud (OCI)'],
      },
      {
        label: '~/AWS-Services',
        items: ['S3', 'EC2', 'RDS', 'VPC', 'ELB', 'Lambda', 'DynamoDB', 'CloudWatch', 'Elastic Beanstalk', 'Redshift'],
      },
      {
        label: '~/KI-Tools',
        items: ['Claude Code', 'Codex'],
      },
      {
        label: '~/CI/CD & IaC',
        items: ['Docker', 'Ansible', 'Terraform', 'Jenkins', 'Git', 'GitHub'],
      },
      {
        label: '~/GRC',
        items: ['ISO 27001', 'ISO 27017', 'GDPR', 'NIST', 'HIPAA'],
      },
      {
        label: '~/Zertifikate',
        items: ['RHCSA', 'CNSP', 'Junior Penetration Tester', 'CCNA & CCNP', 'MCSA & MCSE', 'Cloud Computing with Azure', 'Ethical Hacking', 'AWS Cloud Practitioner (in Arbeit)'],
      },
      {
        label: '~/Erfolge',
        items: ['200+ Reports an Vulnerability Disclosure Programs', 'Top 4 % auf TryHackMe', 'Leitung GDSC Cybersecurity Chapter, PEC', '4 Security-Awareness-Workshops', 'Dankesschreiben, Vulnerability Disclosure Program'],
      },
    ],
  },

  projects: {
    eyebrow: '~/projekte',
    sectionTitle: 'Meine Projekte',
    pageEyebrow: '~/projekte',
    pageTitle: 'Selbst gebaut',
    newLabel: 'Neu!',
    liveLabel: 'verfügbar',
    inProgressLabel: 'in Arbeit',
    problemLabel: 'Problem',
    resultLabel: 'Ergebnis',
    sourceCode: 'Quellcode',
    viewDemo: 'Demo ansehen',
    viewProject: 'Projekt ansehen',
    backToProjects: 'zurück zu den Projekten',
    notFoundTitle: 'Projekt nicht gefunden',
    notFoundText: 'Dieses Projekt existiert nicht oder hat noch keine eigene Seite.',
    comingSoon: 'Demnächst',
    viewAllProjects: 'alle Projekte ansehen',
    // YOUR CONTENT (same slugs as English): the home showcase is designed for three (first = featured).
    items: [
      {
        slug: 'ssh-honeypot-aws',
        index: '01',
        tag: 'cloud security',
        title: 'SSH-Honeypot in AWS',
        topics: ['Cowrie', 'AWS EC2', 'Docker', 'VPC Flow Logs', 'CloudWatch'],
        status: 'live',
        hasDetails: true,
      },
      {
        slug: 'malware-analysis-pywhat',
        index: '02',
        tag: 'threat intel',
        title: 'Malware-Analyse mit PyWhat',
        impact: {
          problem: 'Schädliche Dateien und Indikatoren von Hand zu finden ist langsam.',
          result: 'Mit PyWhat Malware-Signaturen und -Verhalten erkannt und daraus Erkenntnisse für die Erkennung gewonnen.',
        },
        status: 'live',
        hasDetails: true,
      },
      {
        slug: 'three-tier-jenkins',
        index: '03',
        tag: 'devops',
        title: '3-Tier-Architektur mit Jenkins',
        impact: {
          problem: 'Daten auf AWS waren schwer auszuwerten und die ETL-Schritte liefen unzuverlässig.',
          result: 'Ein per Jenkins gebauter 3-Tier-Stack auf AWS mit Redshift für Analysen und Airflow für zuverlässiges ETL.',
        },
        status: 'live',
        hasDetails: true,
      },
      {
        slug: 'ecommerce-aws',
        index: '04',
        tag: 'cloud',
        title: 'E-Commerce-Website auf AWS',
        impact: {
          problem: 'Ein Dreierteam brauchte ein robustes, sicheres Zuhause für einen Webshop.',
          result: 'Ich habe die Cloud-Architektur mit S3, Route 53, CloudFront und ACM für das Hosting entworfen.',
        },
        status: 'live',
        hasDetails: true,
      },
    ],
  },

  analytics: {
    viewProfile: 'mein GitHub-Profil ansehen',
  },

  support: {
    eyebrow: '~/support',
    pageTitle: 'Support',
    // YOUR CONTENT
    intro: 'Wenn dir meine Projekte oder Beiträge geholfen haben, kannst du meine Arbeit auf diese Weise unterstützen. Jede Unterstützung hilft mir, weiter zu entwickeln und zu schreiben.',
    waysTitle: 'So kannst du helfen',
    starTitle: 'Ein Repository mit Stern markieren',
    starText: 'Kostenlos und in einer Sekunde erledigt. Sterne helfen anderen, die Projekte zu finden.',
    starAction: 'GitHub öffnen',
    sponsorTitle: 'Auf GitHub sponsern',
    sponsorText: 'Monatlich oder einmalig – das Geld fließt direkt in Open-Source-Arbeit.',
    sponsorAction: 'Sponsor werden',
    coffeeTitle: 'Spendier mir einen Kaffee',
    coffeeText: 'Ein kleines einmaliges Dankeschön, das die Coding-Nächte am Laufen hält.',
    coffeeAction: 'Kaffee spendieren',
    shareTitle: 'Seite teilen',
    shareText: 'Kennst du jemanden, dem das hier helfen könnte? Schick den Link weiter.',
    shareAction: 'Link kopieren',
    shareCopied: 'Link kopiert',
    shareFailed: 'Kopieren fehlgeschlagen, nutze die Adresszeile',
    hireTitle: 'Zusammenarbeiten',
    hireText: 'Offen für Freelance-Projekte, Kooperationen und Festanstellungen.',
    hireAction: 'Kontakt aufnehmen',
    contactTitle: 'Kontakt',
    // YOUR CONTENT
    contactNote: 'Ich antworte meistens innerhalb von zwei Werktagen.',
    contactEmail: 'Gmail',
    contactLinkedIn: 'LinkedIn',
    contactGitHub: 'GitHub-Issues',
  },
}

export const messages: Record<Locale, Messages> = { en, de }
