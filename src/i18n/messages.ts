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
  'Tech 1',
  'Tech 2',
  'Tech 3',
  'Tech 4',
  'Tech 5',
  'Tech 6',
  'Tech 7',
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

/** YOUR CONTENT: project URLs and images, shared by both languages. */
const projectMedia = {
  two: {
    repoUrl: site.githubUrl,
    coverImage: asset('images/projects/project-two-cover.svg'),
  },
  three: {
    repoUrl: site.githubUrl,
    demoUrl: 'https://example.com',
    coverImage: asset('images/projects/project-three-cover.svg'),
    detailImage: asset('images/projects/project-three-detail.svg'),
  },
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
    roleStart: 'Write your role here, focused on',
    focusPrimary: 'focus area 1',
    roleConnector: 'and',
    focusSecondary: 'focus area 2',
    availability: 'available for projects and opportunities',
    // YOUR CONTENT
    stats: [
      { value: '0', label: 'projects built' },
      { value: '0', label: 'posts written' },
      { value: '0', label: 'years of experience' },
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
      { label: 'email', href: links.email, brand: 'email' },
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
        slug: 'role-one',
        role: 'Your current role',
        period: 'Jan 2025 — present · 10 months',
        company: 'Company name',
        location: 'City, Country',
        description:
          'Write a short description of your responsibilities and the impact you had in this role.',
        skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'],
      },
      {
        slug: 'role-two',
        role: 'Previous role',
        period: 'Mar 2023 — Dec 2024 · 1 year 10 months',
        company: 'Another company',
        description:
          'Describe what you worked on, the team you were part of and what you delivered.',
        skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
      },
      {
        slug: 'role-three',
        role: 'First role',
        period: 'Jun 2022 — Feb 2023 · 9 months',
        company: 'First company',
        description: 'Describe what you learned and the main things you built here.',
        skills: ['Skill 1', 'Skill 2', 'Skill 3'],
      },
    ],
    // YOUR CONTENT: one row per category ("~/" is stripped for display).
    toolbox: [
      {
        label: '~/Languages',
        items: ['Language 1', 'Language 2', 'Language 3', 'Language 4', 'Language 5'],
      },
      {
        label: '~/Frameworks & libraries',
        items: ['Framework 1', 'Framework 2', 'Framework 3', 'Library 1', 'Library 2', 'Library 3'],
      },
      {
        label: '~/Tools & platforms',
        items: ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Tool 5'],
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
    // YOUR CONTENT: the home showcase is designed for three (first = featured).
    items: [
      {
        slug: 'project-one',
        index: '01',
        tag: 'category',
        title: 'Project one',
        topics: ['Topic one', 'Topic two', 'Topic three'],
        status: 'in-progress',
        locked: true,
      },
      {
        slug: 'project-two',
        index: '02',
        tag: 'category',
        title: 'Project two',
        impact: {
          problem: 'Describe the problem this project solves.',
          result: 'Write a short description of what you built and the result.',
        },
        publishedAt: '2026-03-10',
        repoUrl: projectMedia.two.repoUrl,
        status: 'live',
        coverImage: projectMedia.two.coverImage,
        coverAlt: 'Placeholder illustration for project two',
        hasDetails: true,
      },
      {
        slug: 'project-three',
        index: '03',
        tag: 'category',
        title: 'Project three',
        impact: {
          problem: 'Describe the problem this project solves.',
          result: 'Write a short description of what you built and the result.',
        },
        publishedAt: '2026-05-22',
        repoUrl: projectMedia.three.repoUrl,
        demoUrl: projectMedia.three.demoUrl,
        status: 'live',
        coverImage: projectMedia.three.coverImage,
        coverAlt: 'Placeholder illustration for project three',
        coverZoom: true,
        detailImage: projectMedia.three.detailImage,
        detailImageAlt: 'Placeholder screenshot of project three',
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
    contactEmail: 'Email',
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
    roleStart: 'Beschreibe hier deine Rolle, mit Fokus auf',
    focusPrimary: 'Schwerpunkt 1',
    roleConnector: 'und',
    focusSecondary: 'Schwerpunkt 2',
    availability: 'offen für Projekte und neue Herausforderungen',
    // YOUR CONTENT
    stats: [
      { value: '0', label: 'Projekte' },
      { value: '0', label: 'Beiträge' },
      { value: '0', label: 'Jahre Erfahrung' },
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
      { label: 'E-Mail', href: links.email, brand: 'email' },
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
        slug: 'role-one',
        role: 'Deine aktuelle Position',
        period: 'Jan. 2025 – heute · 10 Monate',
        company: 'Name des Unternehmens',
        location: 'Stadt, Land',
        description:
          'Beschreibe kurz deine Aufgaben und was du in dieser Position bewirkt hast.',
        skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'],
      },
      {
        slug: 'role-two',
        role: 'Vorherige Position',
        period: 'März 2023 – Dez. 2024 · 1 Jahr, 10 Monate',
        company: 'Weiteres Unternehmen',
        description:
          'Beschreibe, woran du gearbeitet hast, in welchem Team du warst und was du umgesetzt hast.',
        skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
      },
      {
        slug: 'role-three',
        role: 'Erste Position',
        period: 'Juni 2022 – Feb. 2023 · 9 Monate',
        company: 'Erstes Unternehmen',
        description: 'Beschreibe, was du hier gelernt und was du hauptsächlich entwickelt hast.',
        skills: ['Skill 1', 'Skill 2', 'Skill 3'],
      },
    ],
    // YOUR CONTENT: one row per category ("~/" is stripped for display).
    toolbox: [
      {
        label: '~/Sprachen',
        items: ['Sprache 1', 'Sprache 2', 'Sprache 3', 'Sprache 4', 'Sprache 5'],
      },
      {
        label: '~/Frameworks & Bibliotheken',
        items: [
          'Framework 1',
          'Framework 2',
          'Framework 3',
          'Bibliothek 1',
          'Bibliothek 2',
          'Bibliothek 3',
        ],
      },
      {
        label: '~/Tools & Plattformen',
        items: ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Tool 5'],
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
        slug: 'project-one',
        index: '01',
        tag: 'kategorie',
        title: 'Projekt eins',
        topics: ['Thema eins', 'Thema zwei', 'Thema drei'],
        status: 'in-progress',
        locked: true,
      },
      {
        slug: 'project-two',
        index: '02',
        tag: 'kategorie',
        title: 'Projekt zwei',
        impact: {
          problem: 'Beschreibe das Problem, das dieses Projekt löst.',
          result: 'Beschreibe kurz, was du gebaut hast und was dabei herausgekommen ist.',
        },
        publishedAt: '2026-03-10',
        repoUrl: projectMedia.two.repoUrl,
        status: 'live',
        coverImage: projectMedia.two.coverImage,
        coverAlt: 'Platzhalterillustration für Projekt zwei',
        hasDetails: true,
      },
      {
        slug: 'project-three',
        index: '03',
        tag: 'kategorie',
        title: 'Projekt drei',
        impact: {
          problem: 'Beschreibe das Problem, das dieses Projekt löst.',
          result: 'Beschreibe kurz, was du gebaut hast und was dabei herausgekommen ist.',
        },
        publishedAt: '2026-05-22',
        repoUrl: projectMedia.three.repoUrl,
        demoUrl: projectMedia.three.demoUrl,
        status: 'live',
        coverImage: projectMedia.three.coverImage,
        coverAlt: 'Platzhalterillustration für Projekt drei',
        coverZoom: true,
        detailImage: projectMedia.three.detailImage,
        detailImageAlt: 'Platzhalter-Screenshot von Projekt drei',
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
    contactEmail: 'E-Mail',
    contactLinkedIn: 'LinkedIn',
    contactGitHub: 'GitHub-Issues',
  },
}

export const messages: Record<Locale, Messages> = { en, de }
