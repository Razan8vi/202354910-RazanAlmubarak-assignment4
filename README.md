# Razan Almubarak – Personal Web Application (Assignment 4)

**Live site:** https://razan8vi.github.io/202354910-RazanAlmubarak-assignment4/

## Project Description

The final version of my personal portfolio for **SWE 363 – Assignment 4:
Personal Web Application**. It brings together everything I built in
Assignments 1–3 and adds two features that make it feel like my own:

- 🇸🇦 **Arabic / English** – one button switches the whole site to Arabic,
  with a right-to-left layout, Arabic font, and translated messages, dates,
  and errors.
- 🌷 **Digital garden** – a small flower pot in the corner grows as you scroll
  down the page: a seed at the top, leaves and a bud on the way, and a full
  bloom when you reach the bottom.

Built with plain HTML, CSS, and JavaScript: no frameworks, no libraries, no
build step.

### Features

| Area | Feature |
|---|---|
| **Language** | English / Arabic switch, right-to-left layout, every text translated (including errors, dates, and GitHub data labels), choice remembered and applied before the page is drawn |
| **Digital garden** | SVG flower that grows with the scroll position (seed → stem → leaves → bud → full bloom), shrinks when you scroll back up, shows how far down you are (%), and blooms with a short message at the bottom |
| **GitHub API** | My latest repositories loaded live from the GitHub REST API, with loading, error, retry, and empty states, and a 10-minute cache |
| **Projects** | Filter by category and level, search in both languages, sort by date or title, choices remembered |
| **Contact form** | Step-by-step validation, reason field with an optional project link, character counter, Send button enabled only when everything is valid |
| **Personal touches** | Greeting by time of day and by name, visit counter, light / dark mode, show / hide sections, time-on-site timer |
| **Quality** | Responsive (desktop, tablet, phone), accessible (Lighthouse 100), friendly error messages, `<noscript>` message, WebP images |

## Setup Instructions (Run Locally)

This is a static site, so it needs no installation.

1. Clone the repository:
   ```bash
   git clone https://github.com/Razan8vi/202354910-RazanAlmubarak-assignment4.git
   cd 202354910-RazanAlmubarak-assignment4
   ```
2. Open `index.html` in a modern browser, **or** in VS Code right-click
   `index.html` and choose **Open with Live Server**.
3. An internet connection is needed for the GitHub section and the fonts.
   Without it, everything else works and the GitHub section explains that you
   are offline.

## How to Use

See the [user guide](docs/user-guide.md) for every feature, step by step.
In short: switch language and theme in the top bar, filter the projects, send
a message, and watch the flower in the corner grow as you scroll down.

## Project Structure

```
202354910-RazanAlmubarak-assignment4/
├── README.md
├── index.html                       # Page structure (static text has data-i18n keys)
├── css/
│   └── styles.css                   # All styles: themes, RTL, garden
├── js/
│   ├── i18n.js                      # English and Arabic texts
│   └── script.js                    # All features, in 13 numbered sections
├── assets/
│   └── images/                      # WebP project images
├── docs/
│   ├── ai-usage-report.md           # How I used AI tools
│   ├── technical-documentation.md   # How everything works, tests, fixes
│   └── user-guide.md                # How to use the site
├── presentation/
│   ├── slides.pdf                   # Presentation slides
│   └── demo-video.mp4               # 5–7 minute video presentation
└── .gitignore
```

## Performance (Lighthouse)

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Mobile | 98–99 | 100 | 96 | 100 |
| Desktop | 100 | 100 | 96 | 100 |

Details in [`docs/technical-documentation.md`](docs/technical-documentation.md#8-performance).

## Presentation

- Slides: [`presentation/slides.pdf`](presentation/slides.pdf)
- Video (5–7 minutes): [`presentation/demo-video.mp4`](presentation/demo-video.mp4)

## AI Use Summary

I used **Claude (Opus 5.5)** on claude.ai to plan the Assignment 4 features,
generate and explain the code for the Arabic / English switch and the digital
garden, test the site in a browser, find and fix bugs. I reviewed and tested everything myself, and I can
explain each part of the code. Full details, the usage log, and my declaration
are in [`docs/ai-usage-report.md`](docs/ai-usage-report.md).
