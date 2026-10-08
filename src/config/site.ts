/**
 * Site-wide personal settings. Edit these first.
 *
 * Empty strings hide the matching button/link in the UI.
 * File paths are relative to the public/ folder (e.g. 'resume.pdf' -> public/resume.pdf).
 */
export const site = {
  /** Shown in the home heading, the browser tab title and image alt text. */
  ownerName: 'Your Name',
  /** Full profile URL, or '' to hide the GitHub button. */
  githubUrl: 'https://github.com/anistomejina',
  /** Full profile URL (e.g. 'https://www.linkedin.com/in/your-handle'), or '' to hide the button. */
  linkedinUrl: 'https://www.linkedin.com/in/anisto-mejin7/',
  /**
   * Your email address, encoded so spam bots scanning the site cannot read it, or '' to hide every
   * email link. To change it, run:  npm run encode-email -- you@example.com  and paste the output.
   */
  emailEncoded: 'bW9jLmxpYW1nQG5pamVtb3RzaW5hLmE=',
  /** Resume file inside public/ (e.g. 'resume.pdf'), or '' to hide the download button. */
  resumeFile: '',
  /** Suggested file name when the resume is downloaded. */
  resumeDownloadName: 'resume.pdf',
  /** Profile picture inside public/. */
  profilePhoto: 'images/profile-placeholder.svg',
  /** GitHub Sponsors page (e.g. 'https://github.com/sponsors/your-handle'), or '' to hide the card. */
  sponsorUrl: '',
  /** Buy Me a Coffee / Ko-fi page, or '' to hide the card. */
  coffeeUrl: '',
} as const


/** Browser-tab title for a detail page: "<title> — <owner name>". */
export function pageTitle(title: string): string {
  return `${title} — ${site.ownerName}`
}
