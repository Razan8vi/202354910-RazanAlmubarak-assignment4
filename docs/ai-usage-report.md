# AI Usage Report – Assignment 3

## 1. Tools Used

| Tool | How I used it |
|---|---|
| **Claude (Opus 5.5)** – claude.ai | Checking the Assignment 3 requirements against my Assignment 2 code, planning the features, generating and explaining code (GitHub API, project filters and sorting, contact form rules, saved state, timer), compressing the images, testing the site in a browser, finding and fixing bugs, running Lighthouse, and drafting the documentation. 

## 2. Usage Log

| ID | Tool (model) | Date | Purpose | Files affected | What I changed and how I verified it |
|---|---|---|---|---|---|
| C01 | Claude (Opus 5.5) | 2026-11-21 | One conversation for the whole assignment: understanding the requirements, planning, code, testing, Git help, and documentation | All files listed in A01–A09 | I followed the plan step by step, created and pushed the repository myself, enabled GitHub Pages, and asked Claude to explain the parts I did not understand. |
| A01 | Claude (Opus 5.5) | 2026-11-21 | Compress and resize the project images, fix the duplicated `<ul>`, add `defer`, `preconnect`, and lazy loading | `assets/images/`, `index.html` | I checked that both images still look right in the cards and compared the file sizes (687 KB → 36 KB). |
| A02 | Claude (Opus 5.5) | 2026-11-21 | Light/dark theme with CSS variables, visitor name, visit counter, and Hide/Show buttons, all saved in `localStorage` | `index.html`, `css/styles.css`, `js/script.js` | I tested the theme toggle, saving and changing my name, and hiding a section, then reloaded the page to check that each choice was remembered. |
| A03 | Claude (Opus 5.5) | 2026-11-21 | Project data array with category + level filters, search, and sorting | `index.html`, `css/styles.css`, `js/script.js` | I checked that my project descriptions and dates are correct, and tested several filter combinations, the empty message, and the Reset button. |
| A04 | Claude (Opus 5.5) | 2026-11-21 | GitHub REST API section with loading, error, retry, empty state, and caching | `index.html`, `css/styles.css`, `js/script.js` | I opened the site and checked that my real repositories appear. I tested the error message by turning off my internet connection and clicking **Try again** after turning it back on. |
| A05 | Claude (Opus 5.5) | 2026-11-21 | Contact form rules, reason field with the extra project link field, character counter, disabled Send button | `index.html`, `css/styles.css`, `js/script.js` | I tested an empty form, a wrong email, a short message, a wrong project link, and a fully valid form. |
| A06 | Claude (Opus 5.5) | 2026-11-21 | Time-on-site timer in the footer | `index.html`, `css/styles.css`, `js/script.js` | I watched the timer count and reloaded the page to check that it continues. |
| A07 | Claude (Opus 5.5) | 2026-11-21 | Automated browser tests, bug fixes, smaller images with `srcset`, and Lighthouse | `css/styles.css`, `js/script.js`, `index.html`, `assets/images/` | Claude found the bugs listed in section 8 of the technical documentation (hidden form still showing, Arabic name order, favicon 404). I read each fix to understand the cause. The Lighthouse scores in the documentation were measured by Claude during testing. |
| A08 | Claude (Opus 5.5) | 2026-11-21 | First drafts of the README, the technical documentation, and this report | `README.md`, `docs/` | I read the drafts, checked that they match what the site actually does, and edited the wording. |
| A09 | Claude (Opus 5.5) | 2026-11-21 | Text for the list of AI-assisted commits and the new format of this report | `docs/ai-usage-report.md` | I checked that every commit with AI-assisted code is listed and that the table follows the required format. |


- Compress project images and improve page loading
- Add saved light/dark theme, visitor name and section toggles
- Add project filtering by category and level, sorting and search
- Show my latest GitHub repositories using the GitHub REST API
- Improve contact form with step-by-step checks and a reason field
- Add a time-on-site timer to the footer
- Serve smaller images with srcset and tidy the HTML head
- Update README, technical documentation and AI usage report for Assignment 3
- Update page weight in the Lighthouse tables after the final test

## 3. Benefits & Challenges

**Benefits:**

- Claude explained *why* each piece is written the way it is (for example, why
  the theme script must run in `<head>`, or why the API is called only when the
  section is visible), which helped me understand assigments and the code ,
- Automated browser tests found bugs I would not have noticed easily, such as
  the `hidden` attribute being overridden by `display: flex`.
- Lighthouse showed clearly how much the image compression helped
  (Performance 82 → 100).

**Challenges:**

- The amount of new code was large, so I had to read  and write it section by section
  (the script is split into 11 numbered sections to make this easier).
- The GitHub API could not be reached from Claude's test environment, so the
  API responses were simulated in the tests. I had to check the real API
  myself in my browser.
- Some project details (dates, descriptions) had to be checked by me, because
  the AI could not know them.

## 4. Learning Outcomes

- Calling a REST API with `fetch`, `async/await`, `try/catch/finally`, and
  running two requests together with `Promise.all`
- Cancelling a slow request with `AbortController`, and reading the HTTP status
- Turning technical errors into messages visitors understand
- Protecting the page from HTML injection with `escapeHTML()`
- Combining several conditions in `filter()`, sorting a copy with `sort()`, and
  drawing the result with `map()` + template literals
- Saving and restoring state with `localStorage` / `sessionStorage` and `JSON`
- CSS variables for theming, and `prefers-color-scheme` / `prefers-reduced-motion`
- `IntersectionObserver`, `debounce`, `setInterval`, and custom events
- Image optimization (WebP, `srcset`, lazy loading) and measuring with Lighthouse
- Git feature branches and `--no-ff` merges for each feature

## 5. Responsible Use & Modifications
I did not submit any code that I cannot explain. Claude was used as a learning, planning, and debugging assistant. I reviewed the suggestions, wrote and implemented the code myself, edited js/script.js, css/styles.css, and index.html, and made the necessary changes to the project. I also checked that the information about me and my projects was accurate and tested every feature in my own browser, including the live GitHub API.

The design, colors, fonts, and layout are my own work from Assignments 1 and 2. No personal data is sent anywhere; the visitor name and settings remain stored in the visitor’s own browser.

The complete, unedited Claude conversation in the `conversations/` folder and the original AI outputs before my edits in the `artifacts/` folder are included in `202354910-RazanAlmubarak-assignment3-ai-evidence.zip`, which was submitted on Blackboard.
## 6. Declaration

> I declare that this report and the attached evidence document all of my AI
> use in this assignment, with complete and unedited conversations, and that I
> understand and can explain all the code I submitted. I understand that
> undeclared AI use or a false declaration will be treated as plagiarism
> according to KFUPM regulations.

- **Name:** Razan Almubarak
- **ID:** 202354910
- **Date:** 2026-11-21
