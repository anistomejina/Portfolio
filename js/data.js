// ─────────────────────────────────────────────────────────────
//  Edit this file to update your portfolio.
//  Every section of the page is generated from the values below.
//  Leave a list empty ([]) to hide that section,
//  or a link empty ("") to hide that button.
// ─────────────────────────────────────────────────────────────

window.PORTFOLIO = {
  name: "Your Name",
  role: "Software Developer",
  tagline: "I design and build clean, fast and accessible experiences for the web.",
  location: "City, Country",
  available: true, // shows an "Open to opportunities" badge

  // Optional photo, e.g. "assets/me.jpg". Leave empty to show your initials.
  photo: "",

  about: [
    "Write two or three sentences about who you are and what you do. Mention what you are focused on right now and the kind of problems you enjoy solving.",
    "Add a second paragraph about your background: how you got into tech, what you studied, or what you do outside of work.",
  ],

  links: {
    github: "https://github.com/anistomejina",
    linkedin: "", // e.g. "https://www.linkedin.com/in/your-handle"
    email: "", // e.g. "you@example.com"
    resume: "", // e.g. "assets/resume.pdf"
  },

  skills: [
    { group: "Languages", items: ["JavaScript", "TypeScript", "Python", "HTML", "CSS"] },
    { group: "Frameworks", items: ["React", "Node.js", "Express", "Tailwind CSS"] },
    { group: "Tools", items: ["Git", "GitHub", "Docker", "VS Code", "Figma"] },
  ],

  projects: [
    {
      title: "Project One",
      description:
        "A short description of what this project does, the problem it solves and your role in it.",
      tags: ["React", "Node.js", "MongoDB"],
      github: "https://github.com/anistomejina",
      demo: "",
    },
    {
      title: "Project Two",
      description:
        "Describe a second project. Mention a result if you have one, like users, speed or a feature you are proud of.",
      tags: ["Python", "FastAPI", "PostgreSQL"],
      github: "",
      demo: "",
    },
    {
      title: "Portfolio",
      description:
        "This website. A responsive, dependency-free personal site with light and dark themes, deployable on GitHub Pages.",
      tags: ["HTML", "CSS", "JavaScript"],
      github: "https://github.com/anistomejina/Portfolio",
      demo: "",
    },
  ],

  experience: [
    {
      role: "Job Title",
      org: "Company Name",
      period: "2025 to Present",
      description: "One or two lines on what you worked on and the impact you had.",
    },
    {
      role: "Degree or Course",
      org: "University or School",
      period: "2021 to 2025",
      description: "Your field of study, key coursework or achievements.",
    },
  ],
};
