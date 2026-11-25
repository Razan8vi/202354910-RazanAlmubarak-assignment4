# Technical Documentation – Assignment 4

## 1. Overview

This is the final version of my personal portfolio for SWE 363. It brings
together everything from Assignments 1–3 and adds two new features:

- **Arabic / English switch** – the whole site, including text built by
  JavaScript, changes language and direction (right-to-left for Arabic).
- **Digital garden** – a small flower in the corner grows as the visitor
  scrolls down the page, and blooms when they reach the bottom.

The site uses plain HTML, CSS, and JavaScript, with no frameworks, libraries,
or build step, and is deployed with GitHub Pages.

| Assignment | What it added |
|---|---|
| A1 | Responsive layout, About / Projects / Contact, time-of-day greeting |
| A2 | Live project search, contact form validation, animated feedback |
| A3 | GitHub REST API, filters + sorting, saved theme and visitor name, show/hide sections, timer, image optimization |
| **A4** | **Arabic / English with RTL, digital garden, no-JavaScript message, accessibility fixes, final documentation and presentation** |

## 2. File Structure

| File | Purpose |
|---|---|
| `index.html` | Page structure. Static text carries `data-i18n` keys |
| `css/styles.css` | All styles in 12 numbered sections. Colors are CSS variables, so one file serves both themes |
| `js/i18n.js` | `TRANSLATIONS`: every text in English and Arabic |
| `js/script.js` | All features in 13 numbered sections (listed at the top of the file) |
| `assets/images/` | Project images in WebP (large + 400 px versions) |
| `docs/` | This document, the user guide, and the AI usage report |
| `presentation/` | `slides.pdf` and `demo-video.mp4` |

Both scripts are loaded with `defer`: they run in order (`i18n.js` first) after
the HTML is parsed, without blocking the page from drawing.

### JavaScript sections (`js/script.js`)

| # | Section | Main functions |
|---|---|---|
| 1 | Settings and storage keys | `GITHUB_USERNAME`, `STORAGE_KEYS` |
| 2 | Storage helpers | `readStorage()`, `writeStorage()`, `removeStorage()` |
| 3 | Utilities | `escapeHTML()`, `debounce()` |
| 4 | **Language** | `t()`, `applyLanguage()`, `onLanguageChange()`, `translateStaticText()` |
| 5 | Theme | `applyTheme()`, `initTheme()` |
| 6 | Visitor name and greeting | `validateVisitorName()`, `countVisit()`, `renderGreeting()` |
| 7 | Show / hide sections | `setSectionVisibility()`, `initSectionToggles()` |
| 8 | Projects | `filterProjects()`, `sortProjects()`, `renderProjects()`, `updateProjects()` |
| 9 | GitHub API | `fetchJSON()`, `loadGitHubData()`, `getFriendlyErrorMessage()`, `prepareRepos()` |
| 10 | Contact form | `validators`, `validateForm()`, `updateFormState()`, `handleContactSubmit()` |
| 11 | Timer | `formatDuration()`, `initTimer()` |
| 12 | **Digital garden** | `getScrollProgress()`, `growthBetween()`, `updateGarden()`, `requestGardenUpdate()` |
| 13 | Start | Calls every `init...()` function once; `initLanguage()` runs last |

## 3. Arabic / English Switch

### How text is translated

```
TRANSLATIONS = { en: { "nav.about": "About", ... }, ar: { "nav.about": "نبذة عني", ... } }
```

- **Static text** in `index.html` has a key: `data-i18n` (text),
  `data-i18n-placeholder`, `data-i18n-aria-label`, or `data-i18n-title`.
  `translateStaticText()` fills them all and translates `document.title`.
- **Text built by JavaScript** uses `t(key, values)`, for example
  `t("projects.count", { shown: 3, total: 6 })` → "Showing 3 of 6 projects" /
  "عرض 3 من أصل 6 مشاريع". `{name}` placeholders are filled from `values`.
  When a sentence needs logic (the empty-projects message has a different word
  order in Arabic), the translation is a small function instead of a string.
- `t()` falls back to English if a key is missing in Arabic, and logs a
  warning, so a missing translation never breaks the page.
- **Projects** store each text field in both languages
  (`title: { en, ar }`). The search looks at both languages, so "UML" and
  "طويق" both work whichever language is shown.

### Redrawing in the other language

Each feature registers a redraw function with `onLanguageChange()`.
`applyLanguage()` sets `<html lang>` and `dir`, translates the static text,
and then calls every registered function:

| Feature | What is redrawn |
|---|---|
| Theme | Button label |
| Visitor | Greeting and any visible name error |
| Sections | Hide / Show labels and their `aria-label` |
| Projects | Cards, level message, counter, empty message, dates |
| GitHub | Loading, error, or data view (kept in `githubView`) |
| Contact | Reason note, field errors, the "still needed" hint, button, confirmation (kept in `lastSentMessage`) |
| Garden | The bloom message, if it is on screen |

### Right-to-left layout

- `dir="rtl"` on `<html>` flips Flexbox and Grid automatically.
- Direction-specific CSS uses logical properties (`border-inline-start`,
  `inset-inline-start`), so the project cards' accent border and the garden
  move to the right side in Arabic.
- Arabic uses the **Tajawal** font for all text, a taller `line-height`, and
  `letter-spacing: 0` on the big heading (letter spacing breaks joined Arabic
  letters).
- Names and email addresses inside sentences are wrapped in Unicode isolate
  marks (`⁨ … ⁩`), so an Arabic name in English text (or the reverse)
  appears in the right order.
- Dates and relative times use `ar-SA-u-ca-gregory-nu-latn`: Arabic month
  names with the Gregorian calendar and Latin digits ("نوفمبر 2026").

### Saved choice without a flash

The choice is saved in `localStorage` (`portfolio.language`). The small script
in `<head>` reads it and sets `lang="ar" dir="rtl"` **before** the page is
drawn, so the layout never jumps from left-to-right to right-to-left. English
is the default for first-time visitors.

## 4. Digital Garden

### Idea

A flower pot sits in the corner of the screen. At the top of the page it is
a seed. As the visitor scrolls down, the stem grows, two leaves open, a bud
appears and opens, and at the bottom the flower is in full bloom. Scrolling
back up makes it smaller again. Nothing needs to be clicked: the flower is a
playful reading-progress indicator.

> The first version grew with six "exploration steps" (seeing sections,
> switching theme or language, sending a message) and had a progress panel.
> I changed the idea so it follows the scroll position instead, which is
> simpler for visitors and shows the growth continuously.

### How the growth is calculated

1. `getScrollProgress()` returns how far down the page the visitor is:
   `scrollY / (scrollHeight − innerHeight)`, kept between 0 and 1. If the whole
   page fits on the screen, it returns 1.
2. Each part of the flower grows during its own part of the page
   (`GROWTH_RANGES`):

| Part | Grows between |
|---|---|
| Stem | 0 % – 55 % |
| First leaf | 15 % – 30 % |
| Second leaf | 30 % – 45 % |
| Bud | 50 % – 70 % |
| Petals | 70 % – 95 % |
| Yellow center | 88 % – 100 % |

3. `growthBetween(progress, [start, end])` turns the page position into a
   value from 0 to 1 for that part.
4. `updateGarden()` writes each value to a CSS variable on `#garden`
   (`--stem`, `--leaf1`, `--leaf2`, `--bud`, `--petals`, `--center`) and
   updates the `45%` label.
5. At 98 % the pot gets the `is-bloomed` class, plays a short "dance"
   animation once, and shows a thank-you message (translated).

### Drawing the flower

The flower is one inline SVG (pot, soil, seed, stem, two leaves, bud, petals,
center). JavaScript never touches the SVG; CSS reads the variables:

```css
.g-stem      { stroke-dashoffset: calc(1 - var(--stem, 0)); } /* path with pathLength="1" */
.g-leaf-left { scale: var(--leaf1, 0); }
.g-petals    { scale: var(--petals, 0); }
.g-seed      { opacity: calc(1 - var(--stem, 0) * 5); }      /* disappears as the stem starts */
```

Each leaf sits in a `<g>` that positions and rotates it, and CSS scales the
leaf itself. This avoids a bug found during testing: when the rotation and the
CSS `scale` were on the same element, `transform-origin` moved the leaves away
from the stem.

### Performance

- The scroll listener is `passive`, so it never delays scrolling.
- `requestGardenUpdate()` asks for **one** `requestAnimationFrame` at a time:
  however many scroll events fire, the flower updates at most once per frame.
- Only CSS variables change; the browser redraws a 68 px element.
- Short CSS transitions (0.15 s) smooth out very fast scrolling.
- The garden also updates on `resize` and `load` (images change the page
  height).

### Accessibility

- The pot is decorative (`aria-hidden="true"`) and has
  `pointer-events: none`, so it never blocks clicks or keyboard focus.
- The bloom message uses `role="status"`, so screen readers announce it.
- With `prefers-reduced-motion`, the transitions and the bloom animation are
  turned off; the flower still changes size with the page.
- The pot sits bottom-left in English and bottom-right in Arabic, and the
  footer gets extra space on phones so the pot never covers its text.

## 5. Features Kept from Assignment 3

### GitHub REST API

- `GET /users/Razan8vi` and `GET /users/Razan8vi/repos` run together with
  `Promise.all`; `fetchJSON()` stops after 8 seconds with `AbortController`.
- Loaded only when the section is near the screen (`IntersectionObserver`),
  and cached in `sessionStorage` for 10 minutes.
- Friendly, translated messages for offline, timeout, rate limit (403/429),
  not found (404), and other errors, with a **Try again** button.
- Text from the API goes through `escapeHTML()` before it is inserted.

### Projects: filter, level, search, sort

`category filter → level filter → search → sort → render`. Each level shows its
own message, the counter shows "Showing X of 6 projects", the empty message
names the active filters, and the choices are saved.

### Contact form

Rules for name (letters, 2+), email, reason, optional project link (only for
"Project collaboration", must be `http(s)`), and message (10–500 characters).
Errors appear after a field is left, the Send button stays disabled with a
hint listing what is missing, and a confirmation follows a short "Sending…"
step. No backend is connected.

### Saved state

| Key | Storage | Used for |
|---|---|---|
| `portfolio.theme` | localStorage | Light / dark mode |
| `portfolio.language` | localStorage | Arabic / English |
| `portfolio.visitorName` | localStorage | Greeting and contact form |
| `portfolio.visitCount` | localStorage + sessionStorage | Visit counter |
| `portfolio.hiddenSections` | localStorage | Hide / Show buttons |
| `portfolio.projectFilters` | localStorage | Category, level, sort |
| `portfolio.githubCache` | sessionStorage | 10-minute API cache |
| `portfolio.sessionStart` | sessionStorage | Timer |

All reads and writes go through `try/catch`, so the site still works when
storage is blocked.

## 6. Error Handling

| Situation | What the visitor sees |
|---|---|
| GitHub API fails | Translated message explaining why + **Try again** |
| No public repositories | "No public repositories yet…" |
| Filters match nothing | A message naming the filters, + **Reset filters** |
| Invalid form input | Message under the field, red border, Send disabled |
| `localStorage` blocked | Site works; choices are just not remembered |
| Missing translation | English text is shown and a warning is logged |
| JavaScript turned off | Short English and Arabic `<noscript>` message |
| Old browser without `IntersectionObserver` | GitHub loads immediately |

## 7. Accessibility

- Semantic landmarks, one `h1`, labels on every input, errors linked with
  `aria-describedby` and announced with `aria-live`.
- `aria-pressed` on toggles, `aria-expanded` + `aria-controls` on Hide / Show.
- `<html lang>` changes with the language, so screen readers switch voice;
  the language button has `lang="ar"` / `lang="en"` on its own text.
- Visible `:focus-visible` outline, contrast checked in both themes,
  `prefers-reduced-motion` respected.
- Lighthouse Accessibility: **100**. The "label-content-name-mismatch" warning
  was fixed by keeping the language button's visible text as its name.

## 8. Performance

| Measure | Effect |
|---|---|
| WebP images with `srcset` (400 px + large) and `loading="lazy"` | Images: 687 KB in A2 → 36 KB |
| `width` / `height` on images | No layout shift |
| `defer` on both scripts, `preconnect` to fonts and API | Faster first paint |
| API only when the section is visible, cached 10 minutes | Fewer requests |
| Garden: passive scroll listener + one `requestAnimationFrame` per frame, CSS variables only | Smooth scrolling, almost no work per frame |
| Debounced search; timer skips hidden tabs | Less work |

**Lighthouse** (Chrome Lighthouse 12, local server):

| | Performance | Accessibility | Best Practices | SEO | Page weight |
|---|---|---|---|---|---|
| Assignment 3 (mobile) | 100 | 100 | 96 | 100 | 92 KB |
| Assignment 4 (mobile) | 98–99 | 100 | 96 | 100 | 118 KB |
| Assignment 4 (desktop) | 100 | 100 | 96 | 100 | 115 KB |

The page is slightly larger than in A3 because of the Arabic font weights and
the translations file. The Best Practices point is a console message caused by
the test machine having no access to external fonts.

## 9. Testing

Automated browser tests (Chrome, desktop 1280 px and phone 390 px) plus manual
checks. GitHub API answers were also simulated to test the error cases.

| Test | Expected result |
|---|---|
| Click **العربية** | `lang="ar"`, `dir="rtl"`, Arabic title, every static text translated |
| Arabic: greeting with a saved name | "مساء الخير يا سارة! …" with the name in the right order |
| Arabic: project cards | Arabic titles, badges, and dates ("نوفمبر 2026") |
| Arabic: Mobile + Beginner | "لا توجد مشاريع في تصنيف «جوال» بمستوى «مبتدئ» بعد…" |
| Search "طويق" and "UML" in Arabic | 1 project each |
| Arabic: GitHub section | Arabic status and "آخر تحديث قبل 3 أيام" |
| Switch language while a form error is shown | Error and hint redraw in the new language |
| Send the form, then switch language | Confirmation redraws in the new language |
| Reload in Arabic | Stays Arabic and right-to-left, no flash |
| Phone width in Arabic | No horizontal scrolling |
| Top of the page | Seed only, label `0%` |
| Scroll to 20 %, 40 %, 60 %, 80 % | Stem and first leaf, then both leaves, then bud, then opening petals (checked with screenshots) |
| Bottom of the page | Full bloom, label `100%`, dance animation, "Your flower bloomed!…" |
| Scroll back to the top | Flower shrinks back to a seed |
| Switch to Arabic at the bottom | Message translated, pot moves to the bottom-right |
| Click where the pot is | The click reaches the page (`pointer-events: none`) |
| All Assignment 3 tests (filters, form, API errors, saved state, timer) | Still pass |
| HTML validator (`html-validate`) | No errors |
| Browser console | No errors or warnings |

**Browsers:** the code uses features supported by current versions of Chrome,
Edge, Firefox, and Safari (logical CSS properties, `:is()`, the CSS `scale`
property, `Intl.RelativeTimeFormat`, optional chaining `??`).

## 10. Problems Found and Fixed

| Problem | Cause | Fix |
|---|---|---|
| Garden leaves floated away from the stem | CSS `transform-origin` also applied to the SVG `rotate()` on the same element | Each leaf in its own `<g>` for position/rotation; CSS scales only the leaf |
| Stem was drawn on top of the flower | SVG draws elements in source order | Pot → stem → leaves → bud → petals → center |
| Visitors had to do tasks to grow the flower | First design used six exploration steps and a panel | Redesigned: the flower follows the scroll position |
| Big Arabic heading looked broken | `letter-spacing: 1px` separates joined Arabic letters | `letter-spacing: 0` when `lang="ar"` |
| Arabic dates showed the Hijri calendar | `ar-SA` defaults to the Islamic calendar | Locale `ar-SA-u-ca-gregory-nu-latn` |
| Lighthouse: label-content-name-mismatch | Language button's `aria-label` differed from its visible text | Visible text is the name; the explanation moved to `title` |

## 11. Limitations and Future Work

- The contact form has no backend; a service such as Formspree could send real
  emails.
- Repository descriptions come from GitHub and stay in English.
- Future ideas: more languages through the same `TRANSLATIONS` object, and
  different plants or seasons for returning visitors.
