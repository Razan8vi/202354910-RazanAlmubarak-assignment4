# AI Usage Report – Assignment 4

## 1. Tools Used

| Tool | How I used it |
|---|---|
| **Claude (Opus 5.5)** – claude.ai | Checking the Assignment 4 requirements against my Assignment 3 code, brainstorming creative feature ideas, generating and explaining the code for the Arabic / English switch and the digital garden, testing the site in a browser (English, Arabic, phone size), finding and fixing bugs, running Lighthouse, and drafting the documentation, slides, and presentation script. |

## 2. Usage Log

| ID | Tool (model) | Date | Purpose | Files affected | What I changed and how I verified it |
|---|---|---|---|---|---|
| C01 | Claude (Opus 5.5) | 2026-11-25 | One conversation for the whole assignment: requirements, feature ideas, code, testing, Git help, documentation, and presentation | All files listed in A01–A06 | I chose the features myself (from a list of ideas, I picked the Arabic / English switch and the digital garden and dropped the others), created and pushed the repository, enabled GitHub Pages, and asked Claude to explain the parts I did not understand. |
| A01 | Claude (Opus 5.5) | 2026-11-25 | Arabic / English switch: translations file, `t()` helper, right-to-left layout, Arabic font, redrawing every feature in the chosen language | `js/i18n.js`, `js/script.js`, `index.html`, `css/styles.css` | I read all the Arabic texts and corrected the wording where needed, switched the language in every section, and checked the right-to-left layout on my laptop and phone. |
| A02 | Claude (Opus 5.5) | 2026-11-25 | Digital garden: SVG flower. The first version grew with six exploration steps and had a progress panel; I decided it should grow with scrolling instead, so Claude changed it to follow the scroll position | `index.html`, `css/styles.css`, `js/script.js`, `js/i18n.js` | I changed the idea myself (no clicks, the flower grows as you scroll down), then scrolled up and down on my laptop and phone to check that it grows, shrinks, and blooms at the bottom. |
| A03 | Claude (Opus 5.5) | 2026-11-25 | Automated browser tests, bug fixes (leaf position, drawing order, toast over the panel), no-JavaScript message, accessibility fix for the language button | `css/styles.css`, `js/script.js`, `index.html` | I read each fix in section 10 of the technical documentation to understand the cause. The Lighthouse scores in the documentation were measured by Claude during testing. |
| A04 | Claude (Opus 5.5) | 2026-11-25 | First drafts of the README, the technical documentation, the user guide, and this report | `README.md`, `docs/` | I read the drafts, checked that they match what the site does, and edited the wording. |
| A05 | Claude (Opus 5.5) | 2026-11-25 | Presentation slides | `presentation/slides.pdf` | I reviewed every slide and adjusted the content to how I want to present. |
| A06 | Claude (Opus 5.5) | 2026-11-25 | Presentation script with timings (used to record the video; not in the repository) | `presentation/demo-video.mp4` (recorded by me) | I rewrote the script in my own words, practiced it, and recorded the video myself with my own voice and screen. |

**AI-assisted commits:** the commits below contain work made with Claude's help.
The first commit (`Start Assignment 4 from Assignment 3 portfolio`) only copied
my Assignment 3 files.

- Add Arabic / English language switch with right-to-left layout
- Add a digital garden: a flower that grows while visitors explore
- Add a no-JavaScript message and fix the language button label
- Make the flower grow with scrolling instead of steps
- Write the Assignment 4 documentation and user guide
- Add the presentation slides

## 3. Benefits & Challenges

**Benefits:**

- Claude gave me many feature ideas, which helped me pick ones that feel like
  me: an Arabic version of my site and a flower that matches my style.
- It explained how translation systems work (keys, a lookup function, and
  redrawing on change), so I understand how to add another language later.
- Browser tests found layout bugs in the SVG flower that I would not have
  noticed without zooming in on each stage.

**Challenges:**

- Translating text built by JavaScript was harder than static text: every
  feature had to redraw itself when the language changes.
- Right-to-left layouts need care: some CSS (borders, positions, letter
  spacing) behaves differently in Arabic.
- I had to check the Arabic texts myself, because natural wording matters more
  than a literal translation.

## 4. Learning Outcomes

- Internationalization (i18n): translation keys, `data-*` attributes, a
  lookup function with placeholders, and fallbacks
- Right-to-left layouts with `dir="rtl"` and logical CSS properties
  (`inset-inline-start`, `border-inline-start`)
- Unicode isolate marks for mixed Arabic / English text, and `Intl` locales for
  dates (Gregorian calendar, Latin digits)
- Measuring scroll progress and updating at most once per frame with
  `requestAnimationFrame` and a passive scroll listener
- Passing values from JavaScript to CSS with custom properties (`--stem`, `--bud`)
- SVG drawing and CSS-driven sizing (`stroke-dashoffset`, `scale`,
  `transform-box`), and respecting `prefers-reduced-motion`

## 5. Responsible Use & Modifications

I did not submit code I cannot explain. I reviewed `js/i18n.js`,
`js/script.js`, `css/styles.css`, and `index.html` section by section, checked
the Arabic texts and my project details, and tested every feature in my own
browser, including the live GitHub API. The design (colors, fonts, layout) is
my own from earlier assignments. No personal data is sent anywhere: the
visitor's name and choices stay in their own browser.

The complete, unedited Claude conversation (`conversations/`) and the original
AI outputs before my edits (`artifacts/`) are included in
`202354910-RazanAlmubarak-assignment4-ai-evidence.zip`, submitted on
Blackboard.

## 6. Declaration

> I declare that this report and the attached evidence document all of my AI
> use in this assignment, with complete and unedited conversations, and that I
> understand and can explain all the code I submitted. I understand that
> undeclared AI use or a false declaration will be treated as plagiarism
> according to KFUPM regulations.

- **Name:** Razan Almubarak
- **ID:** 202354910
- **Date:** 2026-11-25
