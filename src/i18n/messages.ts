/**
 * All visible text of the site, in English (en) and Portuguese (pt).
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

// ---------------------------------------------------------------------------------------------
// Locales
// ---------------------------------------------------------------------------------------------

export type Locale = 'en' | 'pt'

/** Supported locales, in the order the PT / EN buttons appear in the nav. */
export const availableLocales: readonly Locale[] = ['pt', 'en']

/** Used when there is no saved choice and the browser language is not supported. */
export const defaultLocale: Locale = 'en'

/** Native names: aria-label and title of the language buttons. */
export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
}

/** BCP 47 codes: <html lang> and Intl date formatting. */
export const localeCodes: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (availableLocales as readonly string[]).includes(value)
}

// ---------------------------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------------------------

export type NavigationKey = 'home' | 'experience' | 'projects' | 'blog'

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
}

// ---------------------------------------------------------------------------------------------
// Shared link and media values (edit them in src/config/site.ts or here)
// ---------------------------------------------------------------------------------------------

const links = {
  github: site.githubUrl,
  linkedin: site.linkedinUrl,
  email: site.email ? `mailto:${site.email}` : '',
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
}

// ---------------------------------------------------------------------------------------------
// Português
// ---------------------------------------------------------------------------------------------

const pt: Messages = {
  navigation: {
    home: 'home',
    experience: 'experiência',
    projects: 'projetos',
    blog: 'blog',
  },

  accessibility: {
    mainNavigation: 'Navegação principal',
    languageSelector: 'Selecionar idioma',
    switchToLightTheme: 'Mudar para o tema claro',
    switchToDarkTheme: 'Mudar para o tema escuro',
    techStack: 'Principais tecnologias',
    activityIndicators: 'Indicadores de atividade',
    profilePhoto: `Foto de ${site.ownerName}`,
    opensInNewTab: '(abre em uma nova aba)',
  },

  profile: {
    cardLabel: 'perfil',
    // SEU CONTEÚDO
    roleStart: 'Escreva aqui sua função, com foco em',
    focusPrimary: 'área de foco 1',
    roleConnector: 'e',
    focusSecondary: 'área de foco 2',
    availability: 'disponível para projetos e oportunidades',
    // SEU CONTEÚDO
    stats: [
      { value: '0', label: 'projetos criados' },
      { value: '0', label: 'publicações escritas' },
      { value: '0', label: 'anos de experiência' },
    ],
    socialLinks: [
      {
        label: 'baixar currículo',
        href: links.resume,
        glyph: '↓',
        primary: true,
        download: site.resumeDownloadName,
      },
      { label: 'LinkedIn', href: links.linkedin, brand: 'linkedin' },
      { label: 'GitHub', href: links.github, brand: 'github' },
      { label: 'e-mail', href: links.email, brand: 'email' },
    ],
  },

  posts: {
    eyebrow: '~/blog',
    sectionTitle: 'Publicações recentes',
    featuredLabel: 'write-up em destaque',
    readArticle: 'ler artigo',
    viewAllPosts: 'ver todas as publicações',
    archiveTitle: 'Minhas publicações',
    inProgressLabel: 'em andamento',
    placeholderLabel: 'em breve',
    comingSoon: 'Em breve',
    backToBlog: 'voltar ao blog',
    notFoundTitle: 'Publicação não encontrada',
    notFoundText: 'Esta publicação não existe ou ainda não possui uma página publicada.',
    // SEU CONTEÚDO (mesmos slugs do inglês)
    items: [
      {
        slug: 'first-post',
        title: 'Título da sua primeira publicação',
        excerpt:
          'Escreva uma breve descrição da publicação. Ela aparece no card e como introdução na página da publicação.',
        category: 'writeup',
        publishedAt: '2026-01-15',
        readingTimeMinutes: 5,
        featured: true,
        hasDetails: true,
      },
      {
        slug: 'work-in-progress',
        title: 'Publicação em andamento',
        excerpt: 'Escreva uma breve descrição de uma publicação que você ainda está escrevendo.',
        category: 'learning',
        hasDetails: true,
        locked: true,
      },
      {
        slug: 'next-post',
        title: 'Próxima publicação',
        excerpt: 'Em breve, um novo conteúdo aparecerá aqui.',
        category: 'notes',
        placeholder: true,
      },
    ],
  },

  experience: {
    eyebrow: '~/experiência',
    pageTitle: 'Experiência',
    toolboxLabel: 'tecnologias & ferramentas',
    skillsLabel: 'Habilidades',
    // SEU CONTEÚDO (mesmos slugs do inglês)
    entries: [
      {
        slug: 'role-one',
        role: 'Seu cargo atual',
        period: 'jan 2025 — atual · 10 meses',
        company: 'Nome da empresa',
        location: 'Cidade, País',
        description:
          'Escreva uma breve descrição das suas responsabilidades e do impacto que você teve nesta função.',
        skills: ['Habilidade 1', 'Habilidade 2', 'Habilidade 3', 'Habilidade 4', 'Habilidade 5'],
      },
      {
        slug: 'role-two',
        role: 'Cargo anterior',
        period: 'mar 2023 — dez 2024 · 1 ano e 10 meses',
        company: 'Outra empresa',
        description:
          'Descreva no que você trabalhou, de qual equipe fez parte e o que entregou.',
        skills: ['Habilidade 1', 'Habilidade 2', 'Habilidade 3', 'Habilidade 4'],
      },
      {
        slug: 'role-three',
        role: 'Primeiro cargo',
        period: 'jun 2022 — fev 2023 · 9 meses',
        company: 'Primeira empresa',
        description: 'Descreva o que você aprendeu e as principais coisas que construiu aqui.',
        skills: ['Habilidade 1', 'Habilidade 2', 'Habilidade 3'],
      },
    ],
    // SEU CONTEÚDO
    toolbox: [
      {
        label: '~/Linguagens',
        items: ['Linguagem 1', 'Linguagem 2', 'Linguagem 3', 'Linguagem 4', 'Linguagem 5'],
      },
      {
        label: '~/Frameworks e bibliotecas',
        items: [
          'Framework 1',
          'Framework 2',
          'Framework 3',
          'Biblioteca 1',
          'Biblioteca 2',
          'Biblioteca 3',
        ],
      },
      {
        label: '~/Ferramentas e plataformas',
        items: ['Ferramenta 1', 'Ferramenta 2', 'Ferramenta 3', 'Ferramenta 4', 'Ferramenta 5'],
      },
    ],
  },

  projects: {
    eyebrow: '~/projetos',
    sectionTitle: 'Meus projetos',
    pageEyebrow: '~/projetos',
    pageTitle: 'Minhas construções',
    newLabel: 'Novo!',
    liveLabel: 'disponível',
    inProgressLabel: 'em andamento',
    problemLabel: 'Problema',
    resultLabel: 'Resultado',
    sourceCode: 'código-fonte',
    viewDemo: 'ver demo',
    viewProject: 'ver projeto',
    backToProjects: 'voltar aos projetos',
    notFoundTitle: 'Projeto não encontrado',
    notFoundText: 'Este projeto não existe ou ainda não possui uma página publicada.',
    comingSoon: 'Em breve',
    viewAllProjects: 'ver todos os projetos',
    // SEU CONTEÚDO (mesmos slugs do inglês)
    items: [
      {
        slug: 'project-one',
        index: '01',
        tag: 'categoria',
        title: 'Projeto um',
        topics: ['Tópico um', 'Tópico dois', 'Tópico três'],
        status: 'in-progress',
        locked: true,
      },
      {
        slug: 'project-two',
        index: '02',
        tag: 'categoria',
        title: 'Projeto dois',
        impact: {
          problem: 'Descreva o problema que este projeto resolve.',
          result: 'Escreva uma breve descrição do que você construiu e do resultado.',
        },
        publishedAt: '2026-03-10',
        repoUrl: projectMedia.two.repoUrl,
        status: 'live',
        coverImage: projectMedia.two.coverImage,
        coverAlt: 'Ilustração provisória do projeto dois',
        hasDetails: true,
      },
      {
        slug: 'project-three',
        index: '03',
        tag: 'categoria',
        title: 'Projeto três',
        impact: {
          problem: 'Descreva o problema que este projeto resolve.',
          result: 'Escreva uma breve descrição do que você construiu e do resultado.',
        },
        publishedAt: '2026-05-22',
        repoUrl: projectMedia.three.repoUrl,
        demoUrl: projectMedia.three.demoUrl,
        status: 'live',
        coverImage: projectMedia.three.coverImage,
        coverAlt: 'Ilustração provisória do projeto três',
        coverZoom: true,
        detailImage: projectMedia.three.detailImage,
        detailImageAlt: 'Captura de tela provisória do projeto três',
        hasDetails: true,
      },
    ],
  },
}

export const messages: Record<Locale, Messages> = { en, pt }
