/* =========================================================
   Razan Almubarak – Portfolio script (Assignment 3)

   Contents
   1. Settings and storage keys
   2. Storage helpers (localStorage / sessionStorage)
   3. Small utilities
   4. Theme (light / dark mode)
   5. Visitor name and greeting
   6. Show / hide sections
   7. Projects: filter, level and sort
   8. GitHub repositories (external API)
   9. Contact form validation
   10. Time-on-site timer
   11. Start the app
   ========================================================= */

"use strict";

/* =========================================================
   1. SETTINGS AND STORAGE KEYS
   ========================================================= */
const GITHUB_USERNAME = "Razan8vi";
const GITHUB_CACHE_MINUTES = 10;

// One place for every key the site saves, so names never get mixed up
const STORAGE_KEYS = {
    theme: "portfolio.theme",
    visitorName: "portfolio.visitorName",
    visitCount: "portfolio.visitCount",
    hiddenSections: "portfolio.hiddenSections",
    projectFilters: "portfolio.projectFilters",
    githubCache: "portfolio.githubCache",
    sessionStart: "portfolio.sessionStart"
};

/* =========================================================
   2. STORAGE HELPERS
   Storage can be blocked (private mode, strict privacy
   settings), so every read and write is wrapped in try/catch.
   The site keeps working; it just does not remember things.
   ========================================================= */
function readStorage(storage, key, fallback) {
    try {
        const raw = storage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

function writeStorage(storage, key, value) {
    try {
        storage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Storage is full or blocked: ignore, the value just won't be remembered
    }
}

function removeStorage(storage, key) {
    try {
        storage.removeItem(key);
    } catch (error) {
        // Nothing to do if storage is blocked
    }
}

/* =========================================================
   3. SMALL UTILITIES
   ========================================================= */

// Escape text before putting it inside innerHTML (protects against
// HTML injection, e.g. from text that comes back from the API)
function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Wait until the user stops typing before running a function
function debounce(callback, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
}

/* =========================================================
   4. THEME (LIGHT / DARK MODE)
   A small script in <head> applies the saved theme before the
   page is drawn. This part keeps the button in sync and saves
   every change.
   ========================================================= */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    // The button shows the theme you will switch TO
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? "☀ Light mode" : "☾ Dark mode";
    themeToggle.setAttribute("aria-pressed", String(!isDark));
}

function initTheme() {
    applyTheme(document.documentElement.dataset.theme || "dark");

    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme;
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        writeStorage(localStorage, STORAGE_KEYS.theme, next);
    });
}

/* =========================================================
   5. VISITOR NAME AND GREETING
   The greeting combines three things: the time of day
   (from Assignment 1), the saved visitor name, and how many
   times this browser has visited the site.
   ========================================================= */
const greetingElement = document.getElementById("greeting");
const visitorForm = document.getElementById("visitor-form");
const visitorInput = document.getElementById("visitor-name");
const visitorError = document.getElementById("visitor-error");
const changeNameButton = document.getElementById("change-name");

// Letters from any language (so Arabic names work), spaces, - and '
const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;

// Holds the current visitor state while the page is open
const visitorState = {
    name: readStorage(localStorage, STORAGE_KEYS.visitorName, ""),
    visits: 0
};

function getTimeOfDay() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    } else if (hour < 18) {
        return "Good afternoon";
    }
    return "Good evening";
}

// Returns an error message, or an empty string when the name is fine
function validateVisitorName(name) {
    if (name === "") {
        return "Please type a name first.";
    }
    if (name.length < 2 || name.length > 30) {
        return "Your name should be 2 to 30 characters.";
    }
    if (!NAME_PATTERN.test(name)) {
        return "Please use letters only.";
    }
    return "";
}

// Count one visit per browser session (reloading does not add a visit)
function countVisit() {
    const savedCount = readStorage(localStorage, STORAGE_KEYS.visitCount, 0);
    const alreadyCounted = readStorage(sessionStorage, STORAGE_KEYS.visitCount, false);

    if (alreadyCounted) {
        return savedCount;
    }

    const newCount = savedCount + 1;
    writeStorage(localStorage, STORAGE_KEYS.visitCount, newCount);
    writeStorage(sessionStorage, STORAGE_KEYS.visitCount, true);
    return newCount;
}

function renderGreeting() {
    const { visits } = visitorState;
    const timeOfDay = getTimeOfDay();

    // Isolate the name so Arabic (right-to-left) names display correctly in English text
    const name = visitorState.name ? `\u2068${visitorState.name}\u2069` : "";

    if (name && visits > 1) {
        greetingElement.textContent = `${timeOfDay}, ${name}! Welcome back. This is visit number ${visits}.`;
    } else if (name) {
        greetingElement.textContent = `${timeOfDay}, ${name}! Thanks for visiting my portfolio.`;
    } else {
        greetingElement.textContent = `${timeOfDay}! Thanks for visiting my portfolio.`;
    }

    // Show the form only when no name is saved
    visitorForm.hidden = Boolean(name);
    changeNameButton.hidden = !name;
}

function initVisitor() {
    visitorState.visits = countVisit();
    renderGreeting();

    visitorForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = visitorInput.value.trim();
        const errorText = validateVisitorName(name);

        if (errorText) {
            visitorError.textContent = errorText;
            visitorInput.classList.add("input-error");
            return;
        }

        visitorError.textContent = "";
        visitorInput.classList.remove("input-error");
        visitorState.name = name;
        writeStorage(localStorage, STORAGE_KEYS.visitorName, name);
        renderGreeting();
        document.dispatchEvent(new CustomEvent("visitor:changed", { detail: { name } }));
    });

    changeNameButton.addEventListener("click", () => {
        visitorState.name = "";
        removeStorage(localStorage, STORAGE_KEYS.visitorName);
        visitorInput.value = "";
        renderGreeting();
        visitorInput.focus();
    });
}

/* =========================================================
   6. SHOW / HIDE SECTIONS
   Every button with data-toggle-section="<id>" hides or shows
   the body of that section. The list of hidden sections is
   saved, so the page looks the same on the next visit.
   ========================================================= */
const sectionToggleButtons = document.querySelectorAll("[data-toggle-section]");

function setSectionVisibility(button, isVisible) {
    const body = document.getElementById(button.getAttribute("aria-controls"));
    const sectionName = button.dataset.label;

    body.hidden = !isVisible;
    button.setAttribute("aria-expanded", String(isVisible));
    button.textContent = isVisible ? "Hide" : "Show";
    button.setAttribute("aria-label", `${isVisible ? "Hide" : "Show"} ${sectionName}`);
}

function initSectionToggles() {
    const hiddenSections = new Set(readStorage(localStorage, STORAGE_KEYS.hiddenSections, []));

    sectionToggleButtons.forEach((button) => {
        const sectionId = button.dataset.toggleSection;
        setSectionVisibility(button, !hiddenSections.has(sectionId));

        button.addEventListener("click", () => {
            const willShow = button.getAttribute("aria-expanded") === "false";
            setSectionVisibility(button, willShow);

            if (willShow) {
                hiddenSections.delete(sectionId);
            } else {
                hiddenSections.add(sectionId);
            }
            writeStorage(localStorage, STORAGE_KEYS.hiddenSections, [...hiddenSections]);
        });
    });
}

/* =========================================================
   7. PROJECTS: FILTER, LEVEL AND SORT
   The projects are stored as data and drawn by JavaScript.
   Every change runs the same pipeline:
   category filter -> level filter -> search -> sort -> render
   ========================================================= */
const PROJECTS = [
    {
        title: "BYTO – Book Your Truck Online",
        description: "A front-end project from my training at Tuwaiq Academy: a truck-booking app that supports Arabic and English. It gave me more experience in building structured screens and applying core development concepts to a practical use case.",
        category: "mobile",
        level: "intermediate",
        date: "2025-08",
        tags: ["Front-end", "Arabic / English", "Tuwaiq Academy"],
        image: { src: "assets/images/byto-app.webp", small: "assets/images/byto-app-400.webp", alt: "BYTO app language selection screen", width: 640, height: 480 }
    },
    {
        title: "Personal Portfolio Website",
        description: "My first portfolio website (Assignment 1), built with HTML, CSS, and JavaScript. It includes an About Me section, project cards, a contact form, and a time-of-day greeting.",
        category: "web",
        level: "beginner",
        date: "2026-09",
        tags: ["HTML", "CSS", "JavaScript"],
        image: { src: "assets/images/portfolio-a1.webp", small: "assets/images/portfolio-a1-400.webp", alt: "Screenshot of my Assignment 1 portfolio website", width: 800, height: 450 },
        link: "https://github.com/Razan8vi/202354910-razan-almubarak-assignment1"
    },
    {
        title: "Interactive Portfolio",
        description: "Assignment 2 made the portfolio interactive: a live project search, contact form validation with clear error messages, and animated feedback.",
        category: "web",
        level: "intermediate",
        date: "2026-10",
        tags: ["DOM events", "Form validation", "CSS animation"],
        link: "https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment2"
    },
    {
        title: "Advanced Portfolio (this site)",
        description: "Assignment 3 connects the portfolio to the GitHub REST API and adds project filtering and sorting, a saved light/dark theme, a remembered visitor name, and a time-on-site timer.",
        category: "web",
        level: "advanced",
        date: "2026-11",
        tags: ["REST API", "async / await", "localStorage"],
        link: "https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment3"
    },
    {
        title: "KFUPM PeerLearn",
        description: "A team software engineering project for a peer-tutoring platform for KFUPM students. We gathered and analyzed the requirements, then modeled them with UML use case diagrams and low-fidelity GUI mockups.",
        category: "software-engineering",
        level: "advanced",
        date: "2026-04",
        tags: ["Requirements", "UML", "Team project"]
    }
];

const CATEGORY_LABELS = {
    all: "All",
    web: "Web",
    mobile: "Mobile",
    "software-engineering": "Software Engineering"
};

const LEVEL_LABELS = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced"
};

// A different message for each level the visitor chooses
const LEVEL_MESSAGES = {
    all: "Pick a level to see projects that match what you are looking for.",
    beginner: "Beginner projects: my first steps with HTML, CSS, and JavaScript.",
    intermediate: "Intermediate projects: interactive features, validation, and real use cases.",
    advanced: "Advanced projects: APIs, saved state, and team-based software engineering."
};

const DEFAULT_FILTERS = { category: "all", level: "all", sort: "newest" };

const projectsList = document.getElementById("projects-list");
const projectSearch = document.getElementById("project-search");
const categoryButtons = document.querySelectorAll("[data-category]");
const levelSelect = document.getElementById("level-select");
const sortSelect = document.getElementById("sort-select");
const resetFiltersButton = document.getElementById("reset-filters");
const levelMessage = document.getElementById("level-message");
const resultsCount = document.getElementById("results-count");
const noProjectsMessage = document.getElementById("no-projects");

// Saved choices + the search text (the search is not saved on purpose)
const projectState = {
    ...DEFAULT_FILTERS,
    ...readStorage(localStorage, STORAGE_KEYS.projectFilters, {}),
    search: ""
};

// "2026-10" -> "Oct 2026"
function formatMonth(yearMonth) {
    const [year, month] = yearMonth.split("-").map(Number);
    return new Date(year, month - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Step 1–3: keep only the projects that pass every rule
function filterProjects(projects, { category, level, search }) {
    const searchText = search.toLowerCase();

    return projects.filter((project) => {
        const matchesCategory = category === "all" || project.category === category;
        const matchesLevel = level === "all" || project.level === level;
        const searchableText = [project.title, project.description, ...project.tags].join(" ").toLowerCase();
        const matchesSearch = searchText === "" || searchableText.includes(searchText);

        return matchesCategory && matchesLevel && matchesSearch;
    });
}

// Step 4: sort a copy (never change the original array)
function sortProjects(projects, sortBy) {
    const sorted = [...projects];

    if (sortBy === "newest") {
        sorted.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortBy === "oldest") {
        sorted.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === "title") {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
}

function createProjectCard(project) {
    // srcset lets the browser pick the small (400 px) or large image for the card size
    const image = project.image
        ? `<img src="${project.image.src}"
                srcset="${project.image.small} 400w, ${project.image.src} ${project.image.width}w"
                sizes="(max-width: 600px) 90vw, 280px"
                alt="${escapeHTML(project.image.alt)}" class="project-img"
                width="${project.image.width}" height="${project.image.height}" loading="lazy">`
        : `<div class="project-img project-img-placeholder" aria-hidden="true">${escapeHTML(project.title.charAt(0))}</div>`;

    const tags = project.tags.map((tag) => `<li>${escapeHTML(tag)}</li>`).join("");

    const link = project.link
        ? `<a class="project-link" href="${project.link}" target="_blank" rel="noopener">View code on GitHub<span class="visually-hidden"> (opens in a new tab)</span></a>`
        : "";

    return `
        <li class="project-card">
            ${image}
            <div class="project-meta">
                <span class="badge badge-${project.level}">${LEVEL_LABELS[project.level]}</span>
                <span>${CATEGORY_LABELS[project.category]}</span>
                <span aria-hidden="true">•</span>
                <time datetime="${project.date}">${formatMonth(project.date)}</time>
            </div>
            <h3>${escapeHTML(project.title)}</h3>
            <p>${escapeHTML(project.description)}</p>
            <ul class="tag-list" aria-label="Technologies">${tags}</ul>
            ${link}
        </li>`;
}

// Builds a specific hint, e.g. "No beginner Mobile projects yet."
function getEmptyMessage({ category, level, search }) {
    const levelText = level === "all" ? "" : `${LEVEL_LABELS[level].toLowerCase()} `;
    const categoryText = category === "all" ? "" : `${CATEGORY_LABELS[category]} `;
    const ending = search ? ` match "${search}"` : " yet";

    return `No ${levelText}${categoryText}projects${ending}. Try another level or category, or reset the filters.`;
}

function renderProjects() {
    const visibleProjects = sortProjects(filterProjects(PROJECTS, projectState), projectState.sort);

    projectsList.innerHTML = visibleProjects.map(createProjectCard).join("");
    resultsCount.textContent = `Showing ${visibleProjects.length} of ${PROJECTS.length} projects`;
    levelMessage.textContent = LEVEL_MESSAGES[projectState.level];

    noProjectsMessage.hidden = visibleProjects.length > 0;
    noProjectsMessage.textContent = getEmptyMessage(projectState);

    // Keep the controls in sync with the state
    categoryButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.category === projectState.category));
    });
    levelSelect.value = projectState.level;
    sortSelect.value = projectState.sort;

    // The reset button only appears when something is different from the default
    const isDefault = projectState.category === DEFAULT_FILTERS.category
        && projectState.level === DEFAULT_FILTERS.level
        && projectState.sort === DEFAULT_FILTERS.sort
        && projectState.search === "";
    resetFiltersButton.hidden = isDefault;
}

// Change part of the state, save the filters, and draw again
function updateProjects(changes) {
    Object.assign(projectState, changes);

    const { category, level, sort } = projectState;
    writeStorage(localStorage, STORAGE_KEYS.projectFilters, { category, level, sort });
    renderProjects();
}

function initProjects() {
    // Ignore saved values that are no longer valid (e.g. an old category)
    if (!(projectState.category in CATEGORY_LABELS)) {
        projectState.category = DEFAULT_FILTERS.category;
    }
    if (!(projectState.level in LEVEL_MESSAGES)) {
        projectState.level = DEFAULT_FILTERS.level;
    }
    if (!["newest", "oldest", "title"].includes(projectState.sort)) {
        projectState.sort = DEFAULT_FILTERS.sort;
    }

    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => updateProjects({ category: button.dataset.category }));
    });

    levelSelect.addEventListener("change", () => updateProjects({ level: levelSelect.value }));
    sortSelect.addEventListener("change", () => updateProjects({ sort: sortSelect.value }));

    // Wait 200 ms after the last key press instead of redrawing on every key
    projectSearch.addEventListener("input", debounce(() => {
        updateProjects({ search: projectSearch.value.trim() });
    }, 200));

    resetFiltersButton.addEventListener("click", () => {
        projectSearch.value = "";
        updateProjects({ ...DEFAULT_FILTERS, search: "" });
    });

    renderProjects();
}

/* =========================================================
   8. GITHUB REPOSITORIES (EXTERNAL API)
   Uses the public GitHub REST API (no key needed):
   - GET /users/{username}        -> profile
   - GET /users/{username}/repos  -> repositories
   The data is loaded only when the section scrolls into view,
   and it is cached in sessionStorage for 10 minutes to stay
   fast and to respect GitHub's limit of 60 requests per hour.
   ========================================================= */
const GITHUB_API = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_REPOS = 6;

const githubBody = document.getElementById("github-body");
const githubProfile = document.getElementById("github-profile");
const githubStatus = document.getElementById("github-status");
const githubRepos = document.getElementById("github-repos");
const githubRetryButton = document.getElementById("github-retry");

// Fetch JSON with a time limit; throws an Error with extra details if it fails
async function fetchJSON(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
            const error = new Error(`GitHub responded with status ${response.status}`);
            error.status = response.status;
            error.rateLimited = response.headers.get("x-ratelimit-remaining") === "0";
            throw error;
        }
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

// Turn any error into a short message a visitor can understand
function getFriendlyErrorMessage(error) {
    if (!navigator.onLine) {
        return "You seem to be offline. Check your internet connection and try again.";
    }
    if (error.name === "AbortError") {
        return "GitHub is taking too long to respond. Please try again.";
    }
    if (error.rateLimited || error.status === 403 || error.status === 429) {
        return "GitHub's hourly request limit was reached. Please try again in a few minutes.";
    }
    if (error.status === 404) {
        return "The GitHub profile could not be found.";
    }
    return "Sorry, my GitHub projects could not be loaded right now. Please try again later.";
}

// "2026-11-02T10:00:00Z" -> "3 weeks ago"
function timeAgo(isoDate) {
    const seconds = Math.round((new Date(isoDate) - Date.now()) / 1000);
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60]
    ];
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    for (const [unit, unitSeconds] of units) {
        if (Math.abs(seconds) >= unitSeconds) {
            return formatter.format(Math.round(seconds / unitSeconds), unit);
        }
    }
    return "just now";
}

// Keep my own repositories (no forks), newest activity first
function prepareRepos(repos) {
    return repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, MAX_REPOS)
        .map((repo) => ({
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            pushedAt: repo.pushed_at
        }));
}

// Use the cached copy when it is younger than GITHUB_CACHE_MINUTES
function readGitHubCache() {
    const cache = readStorage(sessionStorage, STORAGE_KEYS.githubCache, null);
    const maxAge = GITHUB_CACHE_MINUTES * 60 * 1000;

    if (cache && Date.now() - cache.savedAt < maxAge) {
        return cache;
    }
    return null;
}

function renderGitHubLoading() {
    githubRetryButton.hidden = true;
    githubStatus.className = "api-status";
    githubStatus.textContent = "Loading my latest repositories from GitHub…";
    githubRepos.setAttribute("aria-busy", "true");
    githubRepos.innerHTML = '<li class="repo-card skeleton"></li>'.repeat(3);
}

function renderGitHubError(error) {
    githubProfile.innerHTML = "";
    githubRepos.innerHTML = "";
    githubRepos.removeAttribute("aria-busy");
    githubStatus.className = "api-status api-error";
    githubStatus.textContent = getFriendlyErrorMessage(error);
    githubRetryButton.hidden = false;
}

function renderGitHubData({ profile, repos }) {
    githubRepos.removeAttribute("aria-busy");
    githubStatus.className = "api-status";

    githubProfile.innerHTML = `
        <img src="${escapeHTML(profile.avatarUrl)}" alt="" width="56" height="56" loading="lazy">
        <div>
            <p class="profile-name">${escapeHTML(profile.name)}</p>
            <p class="profile-stats">${profile.publicRepos} public repositories · ${profile.followers} followers</p>
        </div>
        <a class="btn-pill" href="${escapeHTML(profile.url)}" target="_blank" rel="noopener">View profile<span class="visually-hidden"> on GitHub (opens in a new tab)</span></a>`;

    if (repos.length === 0) {
        githubRepos.innerHTML = "";
        githubStatus.textContent = "No public repositories yet. New projects will appear here automatically.";
        return;
    }

    githubStatus.textContent = `Showing my ${repos.length} most recently updated repositories.`;
    githubRepos.innerHTML = repos.map((repo) => `
        <li class="repo-card">
            <a class="repo-name" href="${escapeHTML(repo.url)}" target="_blank" rel="noopener">
                ${escapeHTML(repo.name)}<span class="visually-hidden"> (opens in a new tab)</span>
            </a>
            <p class="repo-description">${escapeHTML(repo.description || "No description yet.")}</p>
            <p class="repo-meta">
                ${repo.language ? `<span class="repo-language">${escapeHTML(repo.language)}</span>` : ""}
                <span aria-label="${repo.stars} stars">★ ${repo.stars}</span>
                <span>Updated ${timeAgo(repo.pushedAt)}</span>
            </p>
        </li>`).join("");
}

async function loadGitHubData() {
    const cached = readGitHubCache();
    if (cached) {
        renderGitHubData(cached);
        return;
    }

    renderGitHubLoading();

    try {
        // Both requests run at the same time
        const [profileData, reposData] = await Promise.all([
            fetchJSON(`${GITHUB_API}/users/${GITHUB_USERNAME}`),
            fetchJSON(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100`)
        ]);

        const data = {
            savedAt: Date.now(),
            profile: {
                name: profileData.name || profileData.login,
                avatarUrl: profileData.avatar_url,
                url: profileData.html_url,
                publicRepos: profileData.public_repos,
                followers: profileData.followers
            },
            repos: prepareRepos(reposData)
        };

        writeStorage(sessionStorage, STORAGE_KEYS.githubCache, data);
        renderGitHubData(data);
    } catch (error) {
        console.warn("GitHub API request failed:", error);
        renderGitHubError(error);
    }
}

function initGitHub() {
    githubRetryButton.addEventListener("click", loadGitHubData);

    // Older browsers without IntersectionObserver just load right away
    if (!("IntersectionObserver" in window)) {
        loadGitHubData();
        return;
    }

    // Load once, when the section is close to the screen. A hidden
    // section is never "visible", so it loads after the visitor shows it.
    const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            loadGitHubData();
        }
    }, { rootMargin: "200px" });

    observer.observe(githubBody);
}

/* =========================================================
   9. CONTACT FORM VALIDATION
   Steps:
   1. Every field has its own rule (validators below).
   2. A field shows its error only after the visitor has left it
      once ("touched"), so nobody sees errors before typing.
   3. The Send button stays disabled, with a hint listing what is
      still missing, until every rule passes.
   4. On submit, everything is checked again, then a short
      "Sending…" step runs and a confirmation is shown.
   No backend is connected, so the message is not really sent.
   ========================================================= */
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const contactForm = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const reasonSelect = document.getElementById("reason");
const reasonNote = document.getElementById("reason-note");
const projectLinkGroup = document.getElementById("project-link-group");
const projectLinkInput = document.getElementById("project-link");
const messageInput = document.getElementById("message");
const charCount = document.getElementById("char-count");
const submitButton = document.getElementById("submit-button");
const formHint = document.getElementById("form-hint");
const formMessage = document.getElementById("form-message");

const formFields = [nameInput, emailInput, reasonSelect, projectLinkInput, messageInput];
const touchedFields = new Set();

// A different note depending on the reason the visitor chooses
const REASONS = {
    job: { label: "a job or internship", note: "Great! Please mention the role and the company in your message." },
    collaboration: { label: "a project collaboration", note: "Sounds fun! You can add a link to the project below (optional)." },
    feedback: { label: "feedback on my portfolio", note: "Thank you! Honest feedback helps me improve." },
    hello: { label: "saying hi", note: "Hi! I would love to hear from you." }
};

function isValidUrl(text) {
    try {
        const url = new URL(text);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch (error) {
        return false;
    }
}

// Each rule returns an error message, or "" when the value is valid
const validators = {
    name(value) {
        if (value === "") return "Please enter your name.";
        if (value.length < 2) return "Your name should be at least 2 characters.";
        if (!NAME_PATTERN.test(value)) return "Please use letters only in your name.";
        return "";
    },
    email(value) {
        if (value === "") return "Please enter your email.";
        if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email, like name@example.com.";
        return "";
    },
    reason(value) {
        return value === "" ? "Please choose a reason for your message." : "";
    },
    "project-link"(value) {
        // Only checked when the field is shown and something was typed
        if (reasonSelect.value !== "collaboration" || value === "") return "";
        return isValidUrl(value) ? "" : "Please enter a full link that starts with https://";
    },
    message(value) {
        if (value === "") return "Please write a message before sending.";
        if (value.length < MESSAGE_MIN) return `Your message is too short (at least ${MESSAGE_MIN} characters).`;
        if (value.length > MESSAGE_MAX) return `Your message is too long (at most ${MESSAGE_MAX} characters).`;
        return "";
    }
};

// Short names for the "still needed" hint
const FIELD_HINTS = {
    name: "your name",
    email: "a valid email",
    reason: "a reason",
    "project-link": "a valid project link",
    message: `a message of at least ${MESSAGE_MIN} characters`
};

function showFieldResult(input, errorText) {
    document.getElementById(`${input.id}-error`).textContent = errorText;
    input.classList.toggle("input-error", errorText !== "");
    input.classList.toggle("input-valid", errorText === "" && input.value.trim() !== "");
    input.setAttribute("aria-invalid", String(errorText !== ""));
}

function clearFieldResult(input) {
    document.getElementById(`${input.id}-error`).textContent = "";
    input.classList.remove("input-error", "input-valid");
    input.removeAttribute("aria-invalid");
}

// Check every field; returns the ids of the fields that are not valid yet
function validateForm() {
    const invalidFields = [];

    formFields.forEach((input) => {
        const errorText = validators[input.id](input.value.trim());

        if (errorText) {
            invalidFields.push(input.id);
        }
        if (touchedFields.has(input.id)) {
            showFieldResult(input, errorText);
        }
    });

    return invalidFields;
}

function updateFormState() {
    const invalidFields = validateForm();
    const isValid = invalidFields.length === 0;

    submitButton.disabled = !isValid;
    formHint.textContent = isValid
        ? ""
        : `To enable the Send button, add ${invalidFields.map((id) => FIELD_HINTS[id]).join(", ")}.`;
}

function updateCharCount() {
    const length = messageInput.value.length;
    charCount.textContent = `${length} / ${MESSAGE_MAX}`;
    charCount.classList.toggle("near-limit", length > MESSAGE_MAX * 0.9);
}

function updateReasonSection() {
    const reason = REASONS[reasonSelect.value];
    const isCollaboration = reasonSelect.value === "collaboration";

    reasonNote.textContent = reason ? reason.note : "";
    projectLinkGroup.hidden = !isCollaboration;

    // When the link field is hidden again, forget what was typed in it
    if (!isCollaboration) {
        projectLinkInput.value = "";
        touchedFields.delete(projectLinkInput.id);
        clearFieldResult(projectLinkInput);
    }
}

function resetContactForm() {
    contactForm.reset();
    touchedFields.clear();
    formFields.forEach(clearFieldResult);
    updateReasonSection();
    updateCharCount();
    prefillVisitorName();
    updateFormState();
}

// Use the saved visitor name to save the visitor some typing
function prefillVisitorName() {
    if (nameInput.value === "" && visitorState.name) {
        nameInput.value = visitorState.name;
    }
}

function handleContactSubmit(event) {
    event.preventDefault(); // stop the page from reloading

    // Step 1: check everything again and show every error
    formFields.forEach((input) => touchedFields.add(input.id));
    updateFormState();

    const firstInvalid = formFields.find((input) => input.classList.contains("input-error"));
    if (firstInvalid) {
        firstInvalid.focus();
        return;
    }

    // Step 2: simulate sending (there is no backend)
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const reasonLabel = REASONS[reasonSelect.value].label;

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    formMessage.textContent = "";

    setTimeout(() => {
        // Step 3: confirm and clear the form
        submitButton.textContent = "Send Message";
        resetContactForm();
        formMessage.textContent = `Thank you, \u2068${name}\u2069! Your message about ${reasonLabel} has been received. I will reply to ${email}.`;
    }, 1000);
}

function initContactForm() {
    formFields.forEach((input) => {
        // Mark a field as touched when the visitor leaves it
        input.addEventListener("blur", () => {
            if (input.value.trim() !== "" || input === reasonSelect) {
                touchedFields.add(input.id);
            }
            updateFormState();
        });

        input.addEventListener("input", () => {
            formMessage.textContent = "";
            updateFormState();
        });
    });

    reasonSelect.addEventListener("change", () => {
        touchedFields.add(reasonSelect.id);
        updateReasonSection();
        updateFormState();
    });

    messageInput.addEventListener("input", updateCharCount);
    contactForm.addEventListener("submit", handleContactSubmit);

    // Fill in the name again if the visitor saves a new one in the header
    document.addEventListener("visitor:changed", () => {
        prefillVisitorName();
        updateFormState();
    });

    resetContactForm();
}

/* =========================================================
   10. TIME-ON-SITE TIMER
   The start time is saved in sessionStorage, so reloading the
   page keeps counting. A new tab or browser session starts at 0.
   ========================================================= */
const timeOnSite = document.getElementById("time-on-site");

// 75 -> "01:15", 3725 -> "1:02:05"
function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (number) => String(number).padStart(2, "0");

    return hours > 0
        ? `${hours}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
}

function initTimer() {
    let startTime = readStorage(sessionStorage, STORAGE_KEYS.sessionStart, null);

    if (!startTime) {
        startTime = Date.now();
        writeStorage(sessionStorage, STORAGE_KEYS.sessionStart, startTime);
    }

    const updateTimer = () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        timeOnSite.textContent = formatDuration(elapsedSeconds);
    };

    updateTimer();

    // Skip the work while the tab is in the background
    setInterval(() => {
        if (!document.hidden) {
            updateTimer();
        }
    }, 1000);
}

/* =========================================================
   11. START THE APP
   The script is loaded with "defer", so the HTML is ready here.
   ========================================================= */
initTheme();
initVisitor();
initSectionToggles();
initProjects();
initGitHub();
initContactForm();
initTimer();
