# Portfolio

A fast, responsive personal portfolio built with plain HTML, CSS and JavaScript. No build step and no dependencies.

**Features:** light and dark themes (follows the system setting, with a toggle), mobile menu, scroll animations, and sections that hide themselves when empty.

## Edit your content

All content lives in one file: [`js/data.js`](js/data.js). Update your name, role, bio, links, skills, projects and experience there.

- Leave a list empty (`[]`) to hide that section.
- Leave a link empty (`""`) to hide that button.
- To show a photo instead of your initials, add it to `assets/` and set `photo: "assets/your-photo.jpg"`.
- To add a resume, put the PDF in `assets/` and set `links.resume: "assets/resume.pdf"`.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy on GitHub Pages

1. Push to the `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. The site will be live at `https://anistomejina.github.io/Portfolio/`.

## Structure

```
index.html      Page layout
css/style.css   Styles and theme colors
js/data.js      Your content
js/main.js      Renders the content and handles theme, menu and animations
assets/         Photos, resume and other files
```
