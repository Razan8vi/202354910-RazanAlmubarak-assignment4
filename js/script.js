/* =========================================================
   Razan Almubarak – Portfolio script (Assignment 4)

   The text for both languages lives in js/i18n.js (TRANSLATIONS),
   which is loaded before this file.

   Contents
   1. Settings and storage keys
   2. Storage helpers (localStorage / sessionStorage)
   3. Small utilities
   4. Language (Arabic / English)
   5. Theme (light / dark mode)
   6. Visitor name and greeting
   7. Show / hide sections
   8. Projects: filter, level and sort
   9. GitHub repositories (external API)
   10. Contact form validation
   11. Time-on-site timer
   12. Digital garden (a flower that grows while you explore)
   13. Start the app
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
    sessionStart: "portfolio.sessionStart",
    language: "portfolio.language",
    garden: "portfolio.garden"
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
   4. LANGUAGE (ARABIC / ENGLISH)
   - t(key, values) returns the text for the current language.
   - Static text in index.html is marked with data-i18n,
     data-i18n-placeholder, data-i18n-aria-label and data-i18n-title.
   - Text built by JavaScript is redrawn by the functions that
     register themselves with onLanguageChange().
   - Arabic switches the page to right-to-left (dir="rtl").
   ========================================================= */
const SUPPORTED_LANGUAGES = ["en", "ar"];
const languageToggle = document.getElementById("language-toggle");
const languageListeners = [];

// The <head> script already set <html lang> from the saved choice
let currentLanguage = SUPPORTED_LANGUAGES.includes(document.documentElement.lang)
    ? document.documentElement.lang
    : "en";

// Look up a translation and fill in {placeholders}
function t(key, values = {}) {
    const entry = TRANSLATIONS[currentLanguage][key] ?? TRANSLATIONS.en[key];

    if (entry === undefined) {
        console.warn(`Missing translation: ${key}`);
        return key;
    }
    if (typeof entry === "function") {
        return entry(values);
    }
    return entry.replace(/\{(\w+)\}/g, (match, name) => (name in values ? values[name] : match));
}

// Locale for dates and numbers: Gregorian calendar and Latin digits in Arabic too
function getLocale() {
    return currentLanguage === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-US";
}

// Register a function that redraws its text when the language changes
function onLanguageChange(callback) {
    languageListeners.push(callback);
}

// Fill every element marked with data-i18n* attributes
function translateStaticText() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
        element.title = t(element.dataset.i18nTitle);
    });
    document.title = t("page.title");
}

function applyLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    // The button is written in the language it switches TO
    languageToggle.lang = language === "ar" ? "en" : "ar";

    translateStaticText();
    languageListeners.forEach((callback) => callback());
}

function initLanguage() {
    applyLanguage(currentLanguage);

    languageToggle.addEventListener("click", () => {
        const next = currentLanguage === "en" ? "ar" : "en";
        applyLanguage(next);
        writeStorage(localStorage, STORAGE_KEYS.language, next);
        document.dispatchEvent(new CustomEvent("garden:step", { detail: "language" }));
    });
}

/* =========================================================
   5. THEME (LIGHT / DARK MODE)
   A small script in <head> applies the saved theme before the
   page is drawn. This part keeps the button in sync and saves
   every change.
   ========================================================= */
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    // The button shows the theme you will switch TO
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? t("theme.toLight") : t("theme.toDark");
    themeToggle.setAttribute("aria-pressed", String(!isDark));
}

function initTheme() {
    applyTheme(document.documentElement.dataset.theme || "dark");

    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme;
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        writeStorage(localStorage, STORAGE_KEYS.theme, next);
        document.dispatchEvent(new CustomEvent("garden:step", { detail: "theme" }));
    });

    onLanguageChange(() => applyTheme(document.documentElement.dataset.theme));
}

/* =========================================================
   6. VISITOR NAME AND GREETING
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
        return t("greeting.morning");
    } else if (hour < 18) {
        return t("greeting.afternoon");
    }
    return t("greeting.evening");
}

// Returns the translation key of the error, or "" when the name is fine
function validateVisitorName(name) {
    if (name === "") {
        return "visitor.errorEmpty";
    }
    if (name.length < 2 || name.length > 30) {
        return "visitor.errorLength";
    }
    if (!NAME_PATTERN.test(name)) {
        return "visitor.errorLetters";
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

    // Isolate the name so it displays correctly in both text directions
    const name = visitorState.name ? `\u2068${visitorState.name}\u2069` : "";

    if (name && visits > 1) {
        greetingElement.textContent = t("greeting.returning", { time: timeOfDay, name, visits });
    } else if (name) {
        greetingElement.textContent = t("greeting.named", { time: timeOfDay, name });
    } else {
        greetingElement.textContent = t("greeting.anonymous", { time: timeOfDay });
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
        const errorKey = validateVisitorName(name);

        if (errorKey) {
            visitorError.dataset.errorKey = errorKey;
            visitorError.textContent = t(errorKey);
            visitorInput.classList.add("input-error");
            return;
        }

        delete visitorError.dataset.errorKey;
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

    onLanguageChange(() => {
        renderGreeting();
        const { errorKey } = visitorError.dataset;
        visitorError.textContent = errorKey ? t(errorKey) : "";
    });
}

/* =========================================================
   7. SHOW / HIDE SECTIONS
   Every button with data-toggle-section="<id>" hides or shows
   the body of that section. The list of hidden sections is
   saved, so the page looks the same on the next visit.
   ========================================================= */
const sectionToggleButtons = document.querySelectorAll("[data-toggle-section]");

function setSectionVisibility(button, isVisible) {
    const body = document.getElementById(button.getAttribute("aria-controls"));
    const sectionName = t(button.dataset.labelKey);
    const action = isVisible ? t("section.hide") : t("section.show");

    body.hidden = !isVisible;
    button.setAttribute("aria-expanded", String(isVisible));
    button.textContent = action;
    button.setAttribute("aria-label", t("section.toggleLabel", { action, section: sectionName }));
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

    onLanguageChange(() => {
        sectionToggleButtons.forEach((button) => {
            setSectionVisibility(button, button.getAttribute("aria-expanded") === "true");
        });
    });
}

/* =========================================================
   8. PROJECTS: FILTER, LEVEL AND SORT
   The projects are stored as data and drawn by JavaScript.
   Every text field has an English and an Arabic version.
   Every change runs the same pipeline:
   category filter -> level filter -> search -> sort -> render
   ========================================================= */
const PROJECTS = [
    {
        title: { en: "BYTO – Book Your Truck Online", ar: "BYTO – احجز شاحنتك أونلاين" },
        description: {
            en: "A front-end project from my training at Tuwaiq Academy: a truck-booking app that supports Arabic and English. It gave me more experience in building structured screens and applying core development concepts to a practical use case.",
            ar: "مشروع واجهات أمامية من تدريبي في أكاديمية طويق: تطبيق لحجز الشاحنات يدعم العربية والإنجليزية. أكسبني خبرة أكبر في بناء شاشات منظمة وتطبيق مفاهيم التطوير الأساسية على حالة استخدام عملية."
        },
        category: "mobile",
        level: "intermediate",
        date: "2025-08",
        tags: { en: ["Front-end", "Arabic / English", "Tuwaiq Academy"], ar: ["واجهات أمامية", "عربي / إنجليزي", "أكاديمية طويق"] },
        image: {
            src: "assets/images/byto-app.webp",
            small: "assets/images/byto-app-400.webp",
            alt: { en: "BYTO app language selection screen", ar: "شاشة اختيار اللغة في تطبيق BYTO" },
            width: 640,
            height: 480
        }
    },
    {
        title: { en: "Personal Portfolio Website", ar: "موقع البورتفوليو الشخصي" },
        description: {
            en: "My first portfolio website (Assignment 1), built with HTML, CSS, and JavaScript. It includes an About Me section, project cards, a contact form, and a time-of-day greeting.",
            ar: "أول موقع بورتفوليو لي (الواجب 1)، مبني بـ HTML وCSS وJavaScript. يحتوي على نبذة عني، وبطاقات للمشاريع، ونموذج تواصل، وتحية حسب وقت اليوم."
        },
        category: "web",
        level: "beginner",
        date: "2026-09",
        tags: { en: ["HTML", "CSS", "JavaScript"], ar: ["HTML", "CSS", "JavaScript"] },
        image: {
            src: "assets/images/portfolio-a1.webp",
            small: "assets/images/portfolio-a1-400.webp",
            alt: { en: "Screenshot of my Assignment 1 portfolio website", ar: "صورة من موقع البورتفوليو في الواجب 1" },
            width: 800,
            height: 450
        },
        link: "https://github.com/Razan8vi/202354910-razan-almubarak-assignment1"
    },
    {
        title: { en: "Interactive Portfolio", ar: "البورتفوليو التفاعلي" },
        description: {
            en: "Assignment 2 made the portfolio interactive: a live project search, contact form validation with clear error messages, and animated feedback.",
            ar: "في الواجب 2 أصبح الموقع تفاعليًا: بحث مباشر في المشاريع، وتحقق من نموذج التواصل مع رسائل خطأ واضحة، وتأثيرات حركية للتنبيهات."
        },
        category: "web",
        level: "intermediate",
        date: "2026-10",
        tags: { en: ["DOM events", "Form validation", "CSS animation"], ar: ["أحداث DOM", "التحقق من النماذج", "حركات CSS"] },
        link: "https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment2"
    },
    {
        title: { en: "Personal Web Application (this site)", ar: "تطبيق الويب الشخصي (هذا الموقع)" },
        description: {
            en: "Assignment 4, the final version: an Arabic / English switch with a right-to-left layout, and a flower that grows while you explore the site, on top of everything from Assignments 1–3.",
            ar: "الواجب 4، النسخة النهائية: تبديل بين العربية والإنجليزية مع تخطيط من اليمين لليسار، ووردة تكبر كلما استكشفت الموقع، فوق كل ما بنيته في الواجبات 1–3."
        },
        category: "web",
        level: "advanced",
        date: "2026-11",
        tags: { en: ["Arabic / English", "RTL layout", "SVG animation"], ar: ["عربي / إنجليزي", "تخطيط RTL", "حركة SVG"] },
        link: "https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment4"
    },
    {
        title: { en: "Advanced Portfolio", ar: "البورتفوليو المتقدم" },
        description: {
            en: "Assignment 3 connected the portfolio to the GitHub REST API and added project filtering and sorting, a saved light/dark theme, a remembered visitor name, and a time-on-site timer.",
            ar: "في الواجب 3 ربطت الموقع بواجهة GitHub البرمجية، وأضفت فلترة المشاريع وترتيبها، وحفظ الوضع الفاتح والداكن، وتذكّر اسم الزائر، ومؤقتًا لمدة الزيارة."
        },
        category: "web",
        level: "advanced",
        date: "2026-11",
        tags: { en: ["REST API", "async / await", "localStorage"], ar: ["REST API", "async / await", "localStorage"] },
        link: "https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment3"
    },
    {
        title: { en: "KFUPM PeerLearn", ar: "منصة KFUPM PeerLearn" },
        description: {
            en: "A team software engineering project for a peer-tutoring platform for KFUPM students. We gathered and analyzed the requirements, then modeled them with UML use case diagrams and low-fidelity GUI mockups.",
            ar: "مشروع هندسة برمجيات جماعي لمنصة تعليم بين الأقران لطلاب جامعة الملك فهد للبترول والمعادن. جمعنا المتطلبات وحللناها، ثم نمذجناها بمخططات حالات الاستخدام UML ونماذج أولية للواجهات."
        },
        category: "software-engineering",
        level: "advanced",
        date: "2026-04",
        tags: { en: ["Requirements", "UML", "Team project"], ar: ["المتطلبات", "UML", "مشروع جماعي"] }
    }
];

const CATEGORIES = ["all", "web", "mobile", "software-engineering"];
const LEVELS = ["all", "beginner", "intermediate", "advanced"];
const SORT_OPTIONS = ["newest", "oldest", "title"];
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

// "2026-10" -> "Oct 2026" (English) or "أكتوبر 2026" (Arabic)
function formatMonth(yearMonth) {
    const [year, month] = yearMonth.split("-").map(Number);
    return new Date(year, month - 1).toLocaleDateString(getLocale(), { month: "short", year: "numeric" });
}

// Step 1–3: keep only the projects that pass every rule.
// The search looks at both languages, so "UML" or "طويق" both work.
function filterProjects(projects, { category, level, search }) {
    const searchText = search.toLowerCase();

    return projects.filter((project) => {
        const matchesCategory = category === "all" || project.category === category;
        const matchesLevel = level === "all" || project.level === level;
        const searchableText = SUPPORTED_LANGUAGES
            .flatMap((language) => [project.title[language], project.description[language], ...project.tags[language]])
            .join(" ")
            .toLowerCase();
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
        sorted.sort((a, b) => a.title[currentLanguage].localeCompare(b.title[currentLanguage], currentLanguage));
    }
    return sorted;
}

function createProjectCard(project) {
    const title = project.title[currentLanguage];

    // srcset lets the browser pick the small (400 px) or large image for the card size
    const image = project.image
        ? `<img src="${project.image.src}"
                srcset="${project.image.small} 400w, ${project.image.src} ${project.image.width}w"
                sizes="(max-width: 600px) 90vw, 280px"
                alt="${escapeHTML(project.image.alt[currentLanguage])}" class="project-img"
                width="${project.image.width}" height="${project.image.height}" loading="lazy">`
        : `<div class="project-img project-img-placeholder" aria-hidden="true">${escapeHTML(title.charAt(0))}</div>`;

    const tags = project.tags[currentLanguage].map((tag) => `<li>${escapeHTML(tag)}</li>`).join("");

    const link = project.link
        ? `<a class="project-link" href="${project.link}" target="_blank" rel="noopener">${t("projects.viewCode")}<span class="visually-hidden">${t("common.newTab")}</span></a>`
        : "";

    return `
        <li class="project-card">
            ${image}
            <div class="project-meta">
                <span class="badge badge-${project.level}">${t(`level.${project.level}`)}</span>
                <span>${t(`category.${project.category}`)}</span>
                <span aria-hidden="true">•</span>
                <time datetime="${project.date}">${formatMonth(project.date)}</time>
            </div>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(project.description[currentLanguage])}</p>
            <ul class="tag-list" aria-label="${t("projects.technologies")}">${tags}</ul>
            ${link}
        </li>`;
}

// Builds a specific hint, e.g. "No beginner Mobile projects yet."
function getEmptyMessage({ category, level, search }) {
    return t("projects.empty", {
        level: level === "all" ? "" : t(`level.${level}`),
        category: category === "all" ? "" : t(`category.${category}`),
        search
    });
}

function renderProjects() {
    const visibleProjects = sortProjects(filterProjects(PROJECTS, projectState), projectState.sort);

    projectsList.innerHTML = visibleProjects.map(createProjectCard).join("");
    resultsCount.textContent = t("projects.count", { shown: visibleProjects.length, total: PROJECTS.length });
    levelMessage.textContent = t(`levelMessage.${projectState.level}`);

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
    if (!CATEGORIES.includes(projectState.category)) {
        projectState.category = DEFAULT_FILTERS.category;
    }
    if (!LEVELS.includes(projectState.level)) {
        projectState.level = DEFAULT_FILTERS.level;
    }
    if (!SORT_OPTIONS.includes(projectState.sort)) {
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

    onLanguageChange(renderProjects);
    renderProjects();
}

/* =========================================================
   9. GITHUB REPOSITORIES (EXTERNAL API)
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

// What the section shows right now, so it can be redrawn in the other language
const githubView = { state: "idle", data: null, error: null };

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
        return t("github.errorOffline");
    }
    if (error.name === "AbortError") {
        return t("github.errorTimeout");
    }
    if (error.rateLimited || error.status === 403 || error.status === 429) {
        return t("github.errorRateLimit");
    }
    if (error.status === 404) {
        return t("github.errorNotFound");
    }
    return t("github.errorGeneric");
}

// "2026-11-02T10:00:00Z" -> "3 weeks ago" / "قبل 3 أسابيع"
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
    const formatter = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });

    for (const [unit, unitSeconds] of units) {
        if (Math.abs(seconds) >= unitSeconds) {
            return formatter.format(Math.round(seconds / unitSeconds), unit);
        }
    }
    return t("github.justNow");
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
    Object.assign(githubView, { state: "loading" });
    githubRetryButton.hidden = true;
    githubStatus.className = "api-status";
    githubStatus.textContent = t("github.loading");
    githubRepos.setAttribute("aria-busy", "true");
    githubRepos.innerHTML = '<li class="repo-card skeleton"></li>'.repeat(3);
}

function renderGitHubError(error) {
    Object.assign(githubView, { state: "error", error });
    githubProfile.innerHTML = "";
    githubRepos.innerHTML = "";
    githubRepos.removeAttribute("aria-busy");
    githubStatus.className = "api-status api-error";
    githubStatus.textContent = getFriendlyErrorMessage(error);
    githubRetryButton.hidden = false;
}

function renderGitHubData(data) {
    const { profile, repos } = data;
    Object.assign(githubView, { state: "data", data });
    githubRepos.removeAttribute("aria-busy");
    githubStatus.className = "api-status";

    githubProfile.innerHTML = `
        <img src="${escapeHTML(profile.avatarUrl)}" alt="" width="56" height="56" loading="lazy">
        <div>
            <p class="profile-name">${escapeHTML(profile.name)}</p>
            <p class="profile-stats">${t("github.stats", { repos: profile.publicRepos, followers: profile.followers })}</p>
        </div>
        <a class="btn-pill" href="${escapeHTML(profile.url)}" target="_blank" rel="noopener">${t("github.viewProfile")}<span class="visually-hidden">${t("github.viewProfileHidden")}</span></a>`;

    if (repos.length === 0) {
        githubRepos.innerHTML = "";
        githubStatus.textContent = t("github.empty");
        return;
    }

    githubStatus.textContent = t("github.showing", { count: repos.length });
    githubRepos.innerHTML = repos.map((repo) => `
        <li class="repo-card">
            <a class="repo-name" href="${escapeHTML(repo.url)}" target="_blank" rel="noopener">
                ${escapeHTML(repo.name)}<span class="visually-hidden">${t("common.newTab")}</span>
            </a>
            <p class="repo-description">${escapeHTML(repo.description || t("github.noDescription"))}</p>
            <p class="repo-meta">
                ${repo.language ? `<span class="repo-language">${escapeHTML(repo.language)}</span>` : ""}
                <span aria-label="${t("github.stars", { count: repo.stars })}">★ ${repo.stars}</span>
                <span>${t("github.updated", { time: timeAgo(repo.pushedAt) })}</span>
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

    // Redraw whatever is on screen in the new language
    onLanguageChange(() => {
        if (githubView.state === "loading") {
            renderGitHubLoading();
        } else if (githubView.state === "error") {
            renderGitHubError(githubView.error);
        } else if (githubView.state === "data") {
            renderGitHubData(githubView.data);
        }
    });
}

/* =========================================================
   10. CONTACT FORM VALIDATION
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
// (texts: reason.<id>.label and reason.<id>.note in js/i18n.js)
const REASONS = ["job", "collaboration", "feedback", "hello"];

// The last message sent, so the confirmation can be redrawn in the other language
let lastSentMessage = null;

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
        if (value === "") return t("error.nameEmpty");
        if (value.length < 2) return t("error.nameShort");
        if (!NAME_PATTERN.test(value)) return t("error.nameLetters");
        return "";
    },
    email(value) {
        if (value === "") return t("error.emailEmpty");
        if (!EMAIL_PATTERN.test(value)) return t("error.emailInvalid");
        return "";
    },
    reason(value) {
        return value === "" ? t("error.reason") : "";
    },
    "project-link"(value) {
        // Only checked when the field is shown and something was typed
        if (reasonSelect.value !== "collaboration" || value === "") return "";
        return isValidUrl(value) ? "" : t("error.link");
    },
    message(value) {
        if (value === "") return t("error.messageEmpty");
        if (value.length < MESSAGE_MIN) return t("error.messageShort", { min: MESSAGE_MIN });
        if (value.length > MESSAGE_MAX) return t("error.messageLong", { max: MESSAGE_MAX });
        return "";
    }
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
        : t("contact.hint", {
            fields: invalidFields.map((id) => t(`hint.${id}`, { min: MESSAGE_MIN })).join(t("contact.listSeparator"))
        });
}

function updateCharCount() {
    const length = messageInput.value.length;
    charCount.textContent = `${length} / ${MESSAGE_MAX}`;
    charCount.classList.toggle("near-limit", length > MESSAGE_MAX * 0.9);
}

function updateReasonSection() {
    const reason = reasonSelect.value;
    const isCollaboration = reason === "collaboration";

    reasonNote.textContent = REASONS.includes(reason) ? t(`reason.${reason}.note`) : "";
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
    lastSentMessage = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        reason: reasonSelect.value
    };

    submitButton.disabled = true;
    submitButton.dataset.sending = "true";
    submitButton.textContent = t("contact.sending");
    formMessage.textContent = "";

    setTimeout(() => {
        // Step 3: confirm and clear the form
        delete submitButton.dataset.sending;
        submitButton.textContent = t("contact.send");
        resetContactForm();
        renderSuccessMessage();
        document.dispatchEvent(new CustomEvent("garden:step", { detail: "message" }));
    }, 1000);
}

function renderSuccessMessage() {
    if (!lastSentMessage) {
        formMessage.textContent = "";
        return;
    }
    const { name, email, reason } = lastSentMessage;
    formMessage.textContent = t("contact.success", {
        name: `\u2068${name}\u2069`,
        reason: t(`reason.${reason}.label`),
        email: `\u2068${email}\u2069`
    });
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
            lastSentMessage = null;
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

    // Redraw notes, errors, the hint, the button and the confirmation
    onLanguageChange(() => {
        updateReasonSection();
        updateFormState();
        submitButton.textContent = submitButton.dataset.sending ? t("contact.sending") : t("contact.send");
        renderSuccessMessage();
    });

    resetContactForm();
}

/* =========================================================
   11. TIME-ON-SITE TIMER
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
   12. DIGITAL GARDEN
   A flower in a small pot grows one stage for every step the
   visitor explores. Steps come from two places:
   - an IntersectionObserver notices when a section is on screen
   - other features send a "garden:step" event (theme, language,
     contact form)
   The finished steps are saved, so the flower keeps growing over
   several visits. JavaScript only sets data-stage="0"–"6"; the CSS
   draws each stage.
   ========================================================= */
const GARDEN_STEPS = ["about", "projects", "github", "theme", "language", "message"];
const GARDEN_SECTIONS = ["about", "projects", "github"];
const GARDEN_TOAST_MS = 3500;

const garden = document.getElementById("garden");
const gardenButton = document.getElementById("garden-button");
const gardenPanel = document.getElementById("garden-panel");
const gardenClose = document.getElementById("garden-close");
const gardenReset = document.getElementById("garden-reset");
const gardenStage = document.getElementById("garden-stage");
const gardenProgress = document.getElementById("garden-progress");
const gardenProgressFill = document.getElementById("garden-progress-fill");
const gardenStepsList = document.getElementById("garden-steps");
const gardenCount = document.getElementById("garden-count");
const gardenToast = document.getElementById("garden-toast");

// Only keep saved steps that still exist
const gardenDone = new Set(
    readStorage(localStorage, STORAGE_KEYS.garden, []).filter((step) => GARDEN_STEPS.includes(step))
);
let gardenToastTimer;

function renderGarden() {
    const done = gardenDone.size;
    const total = GARDEN_STEPS.length;

    garden.dataset.stage = String(done);
    gardenButton.classList.toggle("is-bloomed", done === total);
    gardenButton.setAttribute("aria-label", t("garden.button", { done, total }));
    gardenCount.textContent = `${done}/${total}`;
    gardenStage.textContent = t(`garden.stage.${done}`);
    gardenProgress.textContent = t("garden.progress", { done, total });
    gardenProgressFill.style.width = `${(done / total) * 100}%`;

    gardenStepsList.innerHTML = GARDEN_STEPS.map((step) => {
        const isDone = gardenDone.has(step);
        return `
            <li class="${isDone ? "is-done" : ""}">
                <span class="garden-check" aria-hidden="true">${isDone ? "✓" : ""}</span>
                ${t(`garden.step.${step}`)}
                <span class="visually-hidden">(${isDone ? t("garden.done") : t("garden.todo")})</span>
            </li>`;
    }).join("");
}

function showGardenToast(message) {
    gardenToast.textContent = message;
    gardenToast.classList.add("is-visible");

    clearTimeout(gardenToastTimer);
    gardenToastTimer = setTimeout(() => gardenToast.classList.remove("is-visible"), GARDEN_TOAST_MS);
}

// Play a CSS animation class once (used for the "grow" and "bloom" effects)
function playOnce(element, className) {
    element.classList.remove(className);
    void element.offsetWidth; // restart the animation if it is already running
    element.classList.add(className);
    element.addEventListener("animationend", () => element.classList.remove(className), { once: true });
}

function completeGardenStep(step) {
    if (!GARDEN_STEPS.includes(step) || gardenDone.has(step)) {
        return; // unknown step, or already counted
    }

    gardenDone.add(step);
    writeStorage(localStorage, STORAGE_KEYS.garden, [...gardenDone]);
    renderGarden();

    const done = gardenDone.size;
    const total = GARDEN_STEPS.length;

    if (done === total) {
        playOnce(gardenButton, "just-bloomed");
        showGardenToast(t("garden.bloomed"));
    } else {
        playOnce(gardenButton, "just-grew");
        showGardenToast(t("garden.grew", { done, total }));
    }
}

function setGardenPanel(isOpen) {
    gardenPanel.hidden = !isOpen;
    gardenButton.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
        gardenClose.focus();
    }
}

function watchGardenSections() {
    if (!("IntersectionObserver" in window)) {
        return; // older browsers: the other steps still work
    }

    // A section counts once about a third of it has been on screen
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                completeGardenStep(entry.target.id);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    GARDEN_SECTIONS
        .filter((id) => !gardenDone.has(id))
        .forEach((id) => observer.observe(document.getElementById(id)));
}

function initGarden() {
    document.addEventListener("garden:step", (event) => completeGardenStep(event.detail));

    gardenButton.addEventListener("click", () => setGardenPanel(gardenPanel.hidden));
    gardenClose.addEventListener("click", () => {
        setGardenPanel(false);
        gardenButton.focus();
    });

    gardenReset.addEventListener("click", () => {
        gardenDone.clear();
        removeStorage(localStorage, STORAGE_KEYS.garden);
        renderGarden();
        watchGardenSections();
    });

    // Close with Escape, or by clicking anywhere outside the garden
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !gardenPanel.hidden) {
            setGardenPanel(false);
            gardenButton.focus();
        }
    });
    document.addEventListener("click", (event) => {
        if (!gardenPanel.hidden && !garden.contains(event.target)) {
            setGardenPanel(false);
        }
    });

    onLanguageChange(renderGarden);
    renderGarden();
    watchGardenSections();
}

/* =========================================================
   13. START THE APP
   The script is loaded with "defer", so the HTML is ready here.
   initLanguage() runs last, so every part has registered its
   onLanguageChange() function before the first translation.
   ========================================================= */
initTheme();
initVisitor();
initSectionToggles();
initProjects();
initGitHub();
initContactForm();
initTimer();
initGarden();
initLanguage();
