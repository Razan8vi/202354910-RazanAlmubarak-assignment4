# Technical Documentation – Assignment 3

## 1. Overview

This document explains how my portfolio works and what changed in Assignment 3.
The site uses plain HTML, CSS, and JavaScript with no frameworks or libraries.
Assignment 3 adds:

- an external API (GitHub REST API),
- multi-step logic (project filters + sort, a contact form with rules, a timer),
- saved state (theme, visitor name, hidden sections, filters),
- performance improvements, measured with Lighthouse.

## 2. File Structure

| File | Purpose |
|---|---|
| `index.html` | Page structure: header, About, Projects, GitHub, Contact, footer |
| `css/styles.css` | All styles. Colors are CSS variables, so one file serves both themes |
| `js/script.js` | All features, split into 11 numbered sections (listed at the top of the file) |
| `assets/images/` | Project images in WebP (large + 400 px versions) |
| `docs/` | AI usage report and this document |

### JavaScript sections (`js/script.js`)

| # | Section | Main functions |
|---|---|---|
| 1 | Settings and storage keys | `GITHUB_USERNAME`, `STORAGE_KEYS` |
| 2 | Storage helpers | `readStorage()`, `writeStorage()`, `removeStorage()` |
| 3 | Utilities | `escapeHTML()`, `debounce()` |
| 4 | Theme | `applyTheme()`, `initTheme()` |
| 5 | Visitor name and greeting | `validateVisitorName()`, `countVisit()`, `renderGreeting()` |
| 6 | Show / hide sections | `setSectionVisibility()`, `initSectionToggles()` |
| 7 | Projects | `filterProjects()`, `sortProjects()`, `renderProjects()`, `updateProjects()` |
| 8 | GitHub API | `fetchJSON()`, `loadGitHubData()`, `getFriendlyErrorMessage()`, `prepareRepos()` |
| 9 | Contact form | `validators`, `validateForm()`, `updateFormState()`, `handleContactSubmit()` |
| 10 | Timer | `formatDuration()`, `initTimer()` |
| 11 | Start | Calls every `init...()` function once |

The script is loaded with `defer`, so it runs after the HTML is ready and does
not block the page from drawing.

## 3. API Integration – GitHub REST API

**Endpoints** (public, no API key needed):

- `GET https://api.github.com/users/Razan8vi` – name, avatar, number of repositories, followers
- `GET https://api.github.com/users/Razan8vi/repos?per_page=100` – repositories

**Flow (`loadGitHubData`)**

1. If a cached copy in `sessionStorage` is younger than 10 minutes, show it and stop.
2. Otherwise show a loading message and three skeleton cards.
3. Send both requests at the same time with `Promise.all`.
4. `fetchJSON()` uses an `AbortController` to cancel a request after 8 seconds,
   and throws an error with the HTTP status when `response.ok` is false.
5. `prepareRepos()` removes forks, sorts by the last push date (newest first),
   keeps 6 repositories, and keeps only the fields the page needs.
6. Save the result in `sessionStorage` and draw the profile and repository cards.
7. Any error goes to `catch`, which shows a friendly message and a **Try again** button.

**When is the API called?** An `IntersectionObserver` starts the request only
when the GitHub section is 200 px away from the screen. A hidden section is
never "visible", so it is loaded only after the visitor clicks **Show**. This
saves requests (GitHub allows 60 per hour without a key).

**Error handling (`getFriendlyErrorMessage`)**

| Situation | Message shown |
|---|---|
| No internet (`navigator.onLine` is false) | "You seem to be offline. Check your internet connection and try again." |
| No answer after 8 seconds (`AbortError`) | "GitHub is taking too long to respond. Please try again." |
| Rate limit (status 403/429 or `x-ratelimit-remaining: 0`) | "GitHub's hourly request limit was reached. Please try again in a few minutes." |
| User not found (404) | "The GitHub profile could not be found." |
| Anything else | "Sorry, my GitHub projects could not be loaded right now. Please try again later." |
| Request worked but no repositories | "No public repositories yet. New projects will appear here automatically." |

**Security:** repository names and descriptions come from outside the site, so
`escapeHTML()` converts `<`, `>`, `&`, `"`, and `'` before the text is inserted
with `innerHTML`. I tested this with a fake repository named
`<img src=x onerror=alert(1)>`; it appears as plain text and no code runs.

## 4. Complex Logic

### 4.1 Project filter, level, search, and sort

Projects are stored in the `PROJECTS` array (title, description, category,
level, date, tags, optional image and link) and drawn by JavaScript.
Every change goes through the same pipeline:

```
category filter → level filter → keyword search → sort → render
```

- `filterProjects()` keeps a project only when **all three** conditions are true:
  `category === "all" || project.category === category`, the same for level, and
  the search text appears in the title, description, or tags.
- `sortProjects()` sorts a **copy** of the array (`[...projects]`) by date
  (`"2026-10"` strings compare correctly with `localeCompare`) or by title.
- `renderProjects()` builds the cards, updates "Showing X of 5 projects",
  shows the message for the chosen level (`LEVEL_MESSAGES`), and updates the
  active category button (`aria-pressed`).
- The empty message is built from the active filters, for example
  *"No beginner Mobile projects yet."* or *"No projects match "zzz"."*.
- The **Reset filters** button appears only when something differs from the default.
- The search waits 200 ms after the last key press (`debounce`) before redrawing.

### 4.2 Contact form

| Field | Rules |
|---|---|
| Name | Not empty, at least 2 characters, letters only (any language, so Arabic names work) |
| Email | Not empty, matches `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` |
| Reason | One option must be chosen |
| Project link | Only shown for "Project collaboration"; optional, but if filled it must be a valid `http(s)` URL (checked with `new URL()`) |
| Message | 10 to 500 characters, with a live counter that turns red after 450 |

Steps:

1. Each field has its own function in the `validators` object, which returns an
   error message or an empty string.
2. A field is "touched" after the visitor leaves it. Only touched fields show
   their errors, so the form is not red before the visitor types anything.
3. After every change `updateFormState()` checks all fields. The **Send** button
   is disabled until all rules pass, and a hint lists what is still missing,
   e.g. *"To enable the Send button, add a valid email, a reason."*
4. On submit, all fields are checked again. If one is wrong, the first wrong
   field gets focus. If everything is right, the button shows "Sending…" for one
   second, then a personal confirmation appears and the form is cleared.
5. Each reason shows a different note under the select (`REASONS`).

### 4.3 Time-on-site timer

`initTimer()` saves the start time in `sessionStorage`. Every second it shows
`Date.now() - startTime` as `mm:ss` (or `h:mm:ss` after an hour) using
`formatDuration()`. It skips the update when the tab is hidden
(`document.hidden`), and reloading the page keeps the same start time.

## 5. State Management

All saved values go through `readStorage()` / `writeStorage()`. They use
`JSON.parse` / `JSON.stringify` and a `try/catch`, so the site still works when
storage is blocked (for example in some private browsing modes).

| Key | Storage | Value | Used for |
|---|---|---|---|
| `portfolio.theme` | localStorage | `"light"` or `"dark"` | Theme toggle |
| `portfolio.visitorName` | localStorage | e.g. `"Sara"` | Greeting and contact form |
| `portfolio.visitCount` | localStorage + sessionStorage | number / `true` | "This is visit number 3" (counted once per session) |
| `portfolio.hiddenSections` | localStorage | e.g. `["about"]` | Hide / Show buttons |
| `portfolio.projectFilters` | localStorage | `{ category, level, sort }` | Restores the project filters |
| `portfolio.githubCache` | sessionStorage | profile + repos + time | 10-minute API cache |
| `portfolio.sessionStart` | sessionStorage | timestamp | Timer |

**Theme without a flash:** a small script in `<head>` reads the saved theme (or
the system preference from `prefers-color-scheme`) and sets
`<html data-theme="...">` **before** the page is drawn. All colors in
`styles.css` are CSS variables defined for `[data-theme="dark"]` and
`[data-theme="light"]`, so changing the attribute recolors the whole page.

**Saved values are checked:** if an old or edited value in storage is not
valid (e.g. an unknown category), `initProjects()` falls back to the default.

## 6. Accessibility

- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`) and one `h1`.
- Every input has a `<label>`; errors are linked with `aria-describedby` and
  announced with `aria-live="polite"`; wrong fields get `aria-invalid="true"`.
- Toggle buttons use `aria-pressed` (theme, categories) and `aria-expanded` +
  `aria-controls` (Hide / Show).
- Links that open a new tab say so to screen readers.
- Visible keyboard focus (`:focus-visible`) and colors checked for contrast in
  both themes (Lighthouse Accessibility: 100).
- Animations are turned off for visitors who choose reduced motion
  (`prefers-reduced-motion`).

## 7. Performance

| Change | Effect |
|---|---|
| Converted the two JPG images (368 KB + 319 KB, up to 2939 px wide) to WebP at 640–800 px, plus 400 px versions | Images went from 687 KB to 36 KB in total |
| `srcset` + `sizes` on project images | Small screens download the 400 px version |
| `loading="lazy"` and `width` / `height` on images | Off-screen images load later; no layout jump |
| `defer` on the script | HTML is drawn without waiting for JavaScript |
| `preconnect` to Google Fonts and the GitHub API, removed an unused font weight | Faster font and API connections |
| API called only when the section is on screen, cached for 10 minutes | Fewer requests, instant on reload |
| `debounce` on search; timer skips hidden tabs | Less work while typing / in the background |
| One `renderProjects()` function and shared CSS classes (`.field`, `.btn-pill`) | No repeated code |
| Removed unused files and code (old JPGs, the duplicated `<ul>`, Assignment 2 code that the new features replaced) | Smaller, cleaner files |

**Lighthouse results** (Chrome Lighthouse 12, local server):

| | Performance | Accessibility | Best Practices | SEO | Page weight | LCP |
|---|---|---|---|---|---|---|
| Assignment 2 (mobile) | 82 | 95 | 96 | 91 | 685 KB | 4.8 s |
| Assignment 3 (mobile) | 100 | 100 | 96 | 100 | 92 KB | 1.4 s |
| Assignment 3 (desktop) | 100 | 100 | 96 | 100 | 92 KB | 0.4 s |

The remaining Best Practices point was a console message caused by the test
machine having no access to external sites. Lighthouse also suggests
compression and cache headers, which depend on the web server (GitHub Pages
compresses files automatically), not on the code.

## 8. Problems Found and Fixed (Debugging)

| Problem | Cause | Fix |
|---|---|---|
| The visitor name form stayed visible after saving a name | `.visitor-form { display: flex }` overrides the `hidden` attribute | Added `[hidden] { display: none !important; }` |
| Arabic names appeared in the wrong order inside the English greeting ("!سارة") | Mixed right-to-left and left-to-right text | Wrapped the name in Unicode isolate marks (`⁨` … `⁩`) |
| Browser console showed a 404 for `favicon.ico` | No favicon | Added a small inline SVG favicon |
| A failed API call was logged as a console error and lowered Lighthouse Best Practices | `console.error` in the `catch` | Changed to `console.warn`; the visitor still sees the friendly message |
| Duplicated `<ul class="projects-list">` from Assignment 2 | Copy/paste mistake | Removed; the list is now created by JavaScript |

## 9. Testing

Tested in Chrome (desktop and a 390 px phone size) with automated browser tests
and by hand. The GitHub API answers were simulated for the error cases.

| Test | Expected result |
|---|---|
| Category **Web** + level **Advanced** | 1 project, advanced message shown |
| Category **Mobile** + level **Beginner** | "No beginner Mobile projects yet…", Reset button shown |
| Sort **Title (A–Z)** | Cards in alphabetical order |
| Search "uml" / "zzz" | 1 project / "No projects match "zzz"…" |
| Reload after changing filters | Same category, level, and sort |
| GitHub API works | Profile + up to 6 repositories, forks hidden |
| GitHub returns 500 | Friendly error + Try again; Try again loads the data |
| GitHub rate limit (403) | Rate-limit message |
| No repositories | "No public repositories yet…" |
| Repository name with HTML code | Shown as plain text, nothing runs |
| Save visitor name "R2" | "Please use letters only." |
| Save visitor name "سارة" | Greeting shows the name correctly; form is pre-filled |
| Theme toggle, then reload | Same theme, no flash |
| Hide **About**, then reload | About stays hidden |
| Email "abc" | "Please enter a valid email…" |
| Reason "Project collaboration" + link "notaurl" | Link field appears; URL error |
| Message "short" | Send stays disabled; counter "5 / 500" |
| All fields valid | Send enabled → "Sending…" → confirmation, form cleared |
| Reload the page | Timer keeps counting |
| 390 px wide screen | No horizontal scrolling, controls stack in one column |
| HTML validator (`html-validate`) | No errors |

## 10. Limitations

- The contact form has no backend, so messages are not actually sent.
- Without a GitHub token the API allows 60 requests per hour per visitor;
  the 10-minute cache keeps the site far below this.
- Saved settings belong to one browser; another device starts with the defaults.
