(function () {
  "use strict";

  const data = window.PORTFOLIO;
  document.documentElement.classList.add("js");

  // ───────────── Helpers ─────────────

  const ICONS = {
    github:
      '<svg class="icon icon--fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin:
      '<svg class="icon icon--fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    email:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/></svg>',
    resume:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h7"/></svg>',
    external:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    folder:
      '<svg class="icon project__folder" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    location:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    briefcase:
      '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 12.5h18"/></svg>',
  };

  const LABELS = { github: "GitHub", linkedin: "LinkedIn", email: "Email", resume: "Resume" };

  /** Create an element. Text is always set with textContent, never parsed as HTML. */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value; // only used for the static ICONS above
      else node.setAttribute(key, value);
    }
    for (const child of [].concat(children || [])) {
      if (child) node.append(child);
    }
    return node;
  }

  const $ = (id) => document.getElementById(id);

  function hideSection(id) {
    const section = $(id);
    if (section) section.remove();
    const navLink = document.querySelector(`.nav__links a[href="#${id}"]`);
    if (navLink) navLink.remove();
  }

  function linkHref(type, value) {
    return type === "email" ? `mailto:${value}` : value;
  }

  function isExternal(type) {
    return type === "github" || type === "linkedin";
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  // ───────────── Render ─────────────

  function renderHero() {
    document.title = `${data.name} · ${data.role}`;
    $("hero-name").textContent = data.name;
    $("hero-role").textContent = data.role;
    $("hero-tagline").textContent = data.tagline;
    $("hero-badge").hidden = !data.available;

    const first = data.name.split(/\s+/)[0] || data.name;
    $("nav-logo").replaceChildren(first, el("span", { text: "." }));

    const avatar = $("hero-avatar");
    if (data.photo) {
      avatar.append(el("img", { src: data.photo, alt: data.name }));
    } else {
      avatar.textContent = initials(data.name);
    }

    const socials = $("hero-socials");
    for (const [type, value] of Object.entries(data.links)) {
      if (!value) continue;
      const attrs = { class: "icon-btn", href: linkHref(type, value), "aria-label": LABELS[type], title: LABELS[type], html: ICONS[type] };
      if (isExternal(type)) Object.assign(attrs, { target: "_blank", rel: "noopener noreferrer" });
      socials.append(el("a", attrs));
    }
  }

  function renderAbout() {
    if (!data.about || !data.about.length) return hideSection("about");
    $("about-text").replaceChildren(...data.about.map((text) => el("p", { text })));

    const facts = [];
    if (data.location) facts.push(["location", data.location]);
    if (data.role) facts.push(["briefcase", data.role]);
    if (data.links.email) facts.push(["email", data.links.email]);

    const list = $("about-facts");
    if (!facts.length) return list.remove();
    list.classList.add("card");
    for (const [icon, text] of facts) {
      list.append(el("li", { html: ICONS[icon] }, el("span", { text })));
    }
  }

  function renderSkills() {
    if (!data.skills || !data.skills.length) return hideSection("skills");
    $("skills-list").replaceChildren(
      ...data.skills.map((group) =>
        el("div", { class: "card skills__group" }, [
          el("h3", { text: group.group }),
          el("ul", { class: "chips" }, group.items.map((item) => el("li", { class: "chip", text: item }))),
        ])
      )
    );
  }

  function renderProjects() {
    if (!data.projects || !data.projects.length) return hideSection("projects");
    $("projects-list").replaceChildren(
      ...data.projects.map((project) => {
        const links = el("div", { class: "project__links" });
        if (project.github) {
          links.append(
            el("a", { href: project.github, target: "_blank", rel: "noopener noreferrer", "aria-label": `${project.title} source code`, title: "Source code", html: ICONS.github })
          );
        }
        if (project.demo) {
          links.append(
            el("a", { href: project.demo, target: "_blank", rel: "noopener noreferrer", "aria-label": `${project.title} live demo`, title: "Live demo", html: ICONS.external })
          );
        }
        return el("article", { class: "card project" }, [
          el("div", { class: "project__head", html: ICONS.folder }, links),
          el("h3", { text: project.title }),
          el("p", { text: project.description }),
          el("ul", { class: "chips" }, (project.tags || []).map((tag) => el("li", { class: "chip", text: tag }))),
        ]);
      })
    );
  }

  function renderExperience() {
    if (!data.experience || !data.experience.length) return hideSection("experience");
    $("experience-list").replaceChildren(
      ...data.experience.map((item) =>
        el("li", { class: "timeline__item" }, [
          el("span", { class: "timeline__period", text: item.period }),
          el("h3", {}, [`${item.role} `, el("span", { class: "timeline__org", text: `· ${item.org}` })]),
          item.description && el("p", { text: item.description }),
        ])
      )
    );
  }

  function renderContact() {
    const actions = $("contact-actions");
    const order = ["email", "linkedin", "github", "resume"];
    let primaryUsed = false;
    for (const type of order) {
      const value = data.links[type];
      if (!value) continue;
      const label = type === "email" ? "Say hello" : LABELS[type];
      const attrs = { class: `btn ${primaryUsed ? "btn--ghost" : "btn--primary"}`, href: linkHref(type, value) };
      if (isExternal(type)) Object.assign(attrs, { target: "_blank", rel: "noopener noreferrer" });
      actions.append(el("a", attrs, [el("span", { html: ICONS[type], style: "display:contents" }), label]));
      primaryUsed = true;
    }
  }

  function renderFooter() {
    $("year").textContent = new Date().getFullYear();
    $("footer-name").textContent = data.name;
  }

  // ───────────── Behaviour ─────────────

  function setupTheme() {
    const root = document.documentElement;
    $("theme-toggle").addEventListener("click", () => {
      const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  function setupMenu() {
    const button = $("menu-toggle");
    const links = $("nav-links");
    const setOpen = (open) => {
      links.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    button.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  function setupScrollEffects() {
    const nav = document.querySelector(".nav");
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const revealer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((node) => revealer.observe(node));

    const navLinks = new Map(
      [...document.querySelectorAll(".nav__links a")].map((link) => [link.getAttribute("href").slice(1), link])
    );
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const link = navLinks.get(entry.target.id);
          if (!link) continue;
          if (entry.isIntersecting) {
            navLinks.forEach((other) => other.classList.remove("is-active"));
            link.classList.add("is-active");
          } else {
            link.classList.remove("is-active");
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((section) => spy.observe(section));
  }

  renderHero();
  renderAbout();
  renderSkills();
  renderProjects();
  renderExperience();
  renderContact();
  renderFooter();
  setupTheme();
  setupMenu();
  setupScrollEffects();
})();
