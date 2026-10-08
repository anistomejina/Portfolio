# Portfolio

A personal portfolio built with Vue 3, Vite and TypeScript. It has a home page, an experience page, a project archive with case-study pages, a blog and a support page with live GitHub analytics. Every page is available in English and German, with light and dark themes.

Live site: `https://anistomejina.github.io/Portfolio/` (after the first deploy).

## Run locally

You need Node.js 20.19 or newer (22 recommended).

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run build     # type-check and build into dist/
npm run preview   # serve the production build locally
```

## Edit your content

Everything you see on the site comes from a few places.

### 1. Your name and links: `src/config/site.ts`

| Setting | What it does |
| --- | --- |
| `ownerName` | Your name: the home heading, the browser tab title and the photo alt text. |
| `githubUrl`, `linkedinUrl` | Profile URLs. Leave one empty (`''`) to hide its button. |
| `emailEncoded` | Your email address, encoded so spam bots can't read it. Run `npm run encode-email -- you@example.com` and paste the output here. Leave it empty to hide every email link. |
| `resumeFile` | A PDF inside `public/`, for example `resume.pdf`. Leave it empty to hide the download button. |
| `profilePhoto` | Your photo inside `public/`. Any square image works. |
| `sponsorUrl` | Your GitHub Sponsors page. Leave it empty to hide the sponsor card on the support page. |
| `coffeeUrl` | Your Buy Me a Coffee or Ko-fi page. Leave it empty to hide the coffee card. |

The analytics section at the bottom of the support page reads your GitHub username from `githubUrl` and loads your public stats (repositories, stars, languages, activity) live from the GitHub API in the visitor's browser. No key is needed; results are cached for 15 minutes per visitor.

Also update the `<title>` and `<meta name="description">` in `index.html`, and the letter in `public/favicon.svg`.

### 2. Text, projects, posts and experience: `src/i18n/messages.ts`

The file has one block per language: `en` (English) and `de` (Deutsch). Both blocks have the same structure.

- **Role sentence, stats and tech pills:** `profile` and `techStack` near the top of the file.
- **Projects:** `projects.items`. The first project is the featured one. Useful flags:
  - `hasDetails: true` gives the project its own page (it needs a markdown file, see below).
  - `locked: true` shows a padlock and a "coming soon" state.
  - `status` is `'live'` or `'in-progress'`.
  - `topics` shows topic pills instead of the problem/result text.
- **Blog posts:** `posts.items`. The home page shows the first two. Flags: `hasDetails`, `featured`, `locked`, `placeholder`.
- **Experience:** `experience.entries` (newest first) and `experience.toolbox` (the skills grid).
- **Support page and its analytics section:** `support` and `analytics`. The support intro and reply-time note are marked "YOUR CONTENT".

Keep the same `slug` for an item in both languages so that switching language on a detail page keeps working. Lines marked "YOUR CONTENT" hold placeholder text you should replace.

### 3. Project pages and blog posts: markdown files

Each page with `hasDetails: true` needs a markdown file per language:

```
src/content/projects/<slug>/en.md
src/content/projects/<slug>/de.md
src/content/posts/<slug>/en.md
src/content/posts/<slug>/de.md
```

- If a language file is missing, the English file is used, then the German one.
- Do not start the file with a `# Title`: the page already shows the title.
- Every `## Heading` becomes an entry in the side outline. Its first paragraph is the preview text, so keep it to one sentence.
- Give both languages the same `## Heading`s in the same order. Section links (`#overview`, `#uberblick`) are matched by position, so a link keeps pointing at the same section after a language switch or when it is opened in the other language.
- You can use lists, `inline code`, fenced code blocks, tables, quotes, links and images.

### 4. Images and files: `public/`

Put images, your photo and your resume in `public/`.

- In `messages.ts`, reference them with `asset('images/my-cover.png')` for `public/images/my-cover.png`.
- In markdown, use a path that starts with `/`, for example `![Diagram](/images/posts/diagram.png)`.

Both forms work locally and on GitHub Pages. The placeholder images in `public/images/` can be deleted once you have your own.

## Deploy on GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. In the repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`, or run the workflow from the **Actions** tab.

The build uses `BASE_PATH=/Portfolio/` because the site is served from `https://anistomejina.github.io/Portfolio/`. If you rename the repository, change `BASE_PATH` in the workflow to match. The workflow also copies `index.html` to `404.html`, so links such as `/Portfolio/projects/project-two` work when opened directly.

## Project structure

```
index.html                 Page shell, title and description
public/                    Favicon, images and files served as-is
src/config/site.ts         Your name and links
src/i18n/messages.ts       All text and content, in English and German
src/content/               Markdown for project pages and blog posts
src/views/                 One component per page
src/components/            Navigation, cards, hero and other building blocks
src/composables/           Theme, language, page title and text effects
src/utils/                 Markdown rendering, dates, content loading, asset URLs
src/assets/main.css        Colours, fonts and global styles
```
