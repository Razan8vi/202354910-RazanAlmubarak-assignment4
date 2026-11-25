# Razan Almubarak – Personal Portfolio (Assignment 3)

**Live site:** https://razan8vi.github.io/202354910-RazanAlmubarak-assignment3/

## Project Description

A personal portfolio website built with plain HTML, CSS, and JavaScript (no
frameworks) for **SWE 363 – Assignment 3: Advanced Functionality**. It builds
on my Assignment 1 and Assignment 2 portfolio and adds an external API,
multi-step logic, saved state, and performance improvements.

The site has five parts:

- **Header** – greeting, visitor name, and a light/dark mode toggle.
- **About Me** – a short introduction.
- **Projects** – project cards that can be filtered, searched, and sorted.
- **Latest on GitHub** – my repositories, loaded live from the GitHub API.
- **Contact** – a contact form with step-by-step validation.

### New in Assignment 3

| Requirement | Feature | Details |
|---|---|---|
| **API integration** | Latest on GitHub | Loads my profile and repositories from the public **GitHub REST API** (`/users/Razan8vi` and `/users/Razan8vi/repos`) with `fetch`, `async/await`, and `Promise.all`. Shows a loading skeleton, then my 6 most recently updated repositories (forks excluded) with language, stars, and "updated X days ago". If the request fails, a friendly message explains why (offline, timeout, GitHub rate limit, or a general error) and a **Try again** button appears. |
| **Complex logic** | Project filters | Filter by **category** (All / Web / Mobile / Software Engineering) **and** by **level** (Beginner / Intermediate / Advanced), search by keyword, then **sort** by newest, oldest, or title. Each level shows its own message, a counter shows "Showing X of 5 projects", and the empty message names the exact filters that found nothing. |
| | Contact form | Separate rules for name, email, reason, and message length (10–500 characters). The **Send** button stays disabled until every rule passes, and a hint lists what is still missing. Choosing **Project collaboration** shows an extra, optional project link field that must be a valid URL. |
| | Timer | The footer shows how long the visitor has been on the site. It keeps counting after a page reload. |
| **State management** | Light / dark mode | Saved in `localStorage`; the first visit follows the system setting. |
| | Visitor name | Saved in `localStorage`, used in the greeting and to pre-fill the contact form. The greeting also counts visits ("This is visit number 3"). |
| | Show / hide sections | **Hide** / **Show** buttons on About, Projects, and GitHub, remembered between visits. |
| | Saved filters | The chosen category, level, and sort order are restored on the next visit. |
| **Performance** | Faster loading | Images compressed from **687 KB to 36 KB** (JPG → resized WebP + 400 px versions with `srcset`), lazy-loaded images, `defer` script, cached API results (10 minutes), API called only when its section is on screen, debounced search. |

Features kept from earlier assignments: time-of-day greeting (A1), responsive
layout (A1), contact form validation and fade-in animations (A2).

> No backend is connected. The contact form checks the input and shows a
> confirmation message, but it does not send the message anywhere.

## Setup Instructions (Run Locally)

This is a static site, so it needs no installation or build step.

1. Clone the repository:
   ```bash
   git clone https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment3.git
   cd 202354910-RazanAlmubarak-assignment3
   ```
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari), **or**
   in VS Code right-click `index.html` and choose **Open with Live Server**.
3. An internet connection is needed for the GitHub section and the Google Fonts.
   Without it, the rest of the site still works and the GitHub section shows an
   offline message.

To reset the saved settings (theme, name, filters), open the browser DevTools →
**Application** → **Local Storage** and delete the keys that start with
`portfolio.`.

## Project Structure

```
202354910-RazanAlmubarak-assignment3/
├── README.md
├── index.html                       # Page structure
├── css/
│   └── styles.css                   # All styles, light and dark theme
├── js/
│   └── script.js                    # All features, split into numbered sections
├── assets/
│   └── images/                      # Compressed WebP project images
├── docs/
│   ├── ai-usage-report.md           # How I used AI tools
│   └── technical-documentation.md   # How the features work, testing, performance
└── .gitignore
```

## Performance (Lighthouse)

| | Performance | Accessibility | Best Practices | SEO | Page weight | LCP (mobile) |
|---|---|---|---|---|---|---|
| Assignment 2 | 82 | 95 | 96 | 91 | 685 KB | 4.8 s |
| **Assignment 3** | **100** | **100** | **96** | **100** | **92 KB** | **1.4 s** |

Measured with Lighthouse (mobile preset) on a local server. Details are in
[`docs/technical-documentation.md`](docs/technical-documentation.md#7-performance).

## AI Use Summary

I used **Claude (Opus 5.5)** on claude.ai to plan the Assignment 3 features,
generate and review code for the GitHub API section, project filters, contact
form, state management, and timer, to find bugs during browser testing, to run
Lighthouse, and to draft the documentation. I reviewed every part, made sure I
can explain each function, and tested the features myself. Full details,
including the usage log and my declaration, are in
[`docs/ai-usage-report.md`](docs/ai-usage-report.md).
