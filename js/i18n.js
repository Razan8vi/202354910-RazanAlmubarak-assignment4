/* =========================================================
   Razan Almubarak – Translations (Assignment 4)

   Every piece of text on the site, in English ("en") and
   Arabic ("ar"). The keys are used in two places:
   - index.html: data-i18n="key" (and data-i18n-placeholder,
     data-i18n-aria-label, data-i18n-title) on static elements
   - js/script.js: t("key", { values }) for text built by JavaScript

   {name} inside a string is replaced with values.name.
   A function value is used when the sentence needs logic.
   ========================================================= */

"use strict";

const TRANSLATIONS = {
    en: {
        /* Page */
        "page.title": "Razan Almubarak | Personal Portfolio",
        "lang.button": "العربية",
        "lang.buttonLabel": "Switch the site to Arabic",

        /* Navigation and header */
        "nav.about": "About",
        "nav.projects": "Projects",
        "nav.github": "GitHub",
        "nav.contact": "Contact",
        "theme.toLight": "☀ Light mode",
        "theme.toDark": "☾ Dark mode",
        "hero.name": "Razan Almubarak",
        "hero.tagline": "Software Engineering Student — Building Applications and Creating Meaningful Digital Experiences",

        /* Greeting and visitor name */
        "greeting.morning": "Good morning",
        "greeting.afternoon": "Good afternoon",
        "greeting.evening": "Good evening",
        "greeting.returning": "{time}, {name}! Welcome back. This is visit number {visits}.",
        "greeting.named": "{time}, {name}! Thanks for visiting my portfolio.",
        "greeting.anonymous": "{time}! Thanks for visiting my portfolio.",
        "visitor.label": "What should I call you?",
        "visitor.placeholder": "Your first name",
        "visitor.save": "Save",
        "visitor.change": "Not you? Change name",
        "visitor.errorEmpty": "Please type a name first.",
        "visitor.errorLength": "Your name should be 2 to 30 characters.",
        "visitor.errorLetters": "Please use letters only.",

        /* Show / hide sections */
        "section.hide": "Hide",
        "section.show": "Show",
        "section.toggleLabel": "{action} {section}",

        /* About */
        "about.title": "About Me",
        "about.text": "Hi, I'm Razan, a Software Engineering student with an interest in web development. I enjoy turning ideas into simple, functional websites, and I am continuously developing my skills in HTML, CSS, and JavaScript. I am especially interested in creating digital experiences that are useful and easy to use.",

        /* Projects */
        "projects.title": "Projects",
        "projects.category": "Category",
        "category.all": "All",
        "category.web": "Web",
        "category.mobile": "Mobile",
        "category.software-engineering": "Software Engineering",
        "projects.level": "Level",
        "level.all": "All levels",
        "level.beginner": "Beginner",
        "level.intermediate": "Intermediate",
        "level.advanced": "Advanced",
        "projects.sort": "Sort by",
        "sort.newest": "Newest first",
        "sort.oldest": "Oldest first",
        "sort.title": "Title (A–Z)",
        "projects.search": "Search",
        "projects.searchPlaceholder": "e.g. API, UML, Arabic",
        "projects.reset": "Reset filters",
        "projects.count": "Showing {shown} of {total} projects",
        "projects.viewCode": "View code on GitHub",
        "projects.technologies": "Technologies",
        "levelMessage.all": "Pick a level to see projects that match what you are looking for.",
        "levelMessage.beginner": "Beginner projects: my first steps with HTML, CSS, and JavaScript.",
        "levelMessage.intermediate": "Intermediate projects: interactive features, validation, and real use cases.",
        "levelMessage.advanced": "Advanced projects: APIs, saved state, and team-based software engineering.",
        "projects.empty": ({ level, category, search }) => {
            const levelText = level ? `${level.toLowerCase()} ` : "";
            const categoryText = category ? `${category} ` : "";
            const ending = search ? ` match "${search}"` : " yet";
            return `No ${levelText}${categoryText}projects${ending}. Try another level or category, or reset the filters.`;
        },

        /* GitHub */
        "github.title": "Latest on GitHub",
        "github.intro": "These repositories are loaded live from my GitHub account, so this list stays up to date without editing the page.",
        "github.loading": "Loading my latest repositories from GitHub…",
        "github.errorOffline": "You seem to be offline. Check your internet connection and try again.",
        "github.errorTimeout": "GitHub is taking too long to respond. Please try again.",
        "github.errorRateLimit": "GitHub's hourly request limit was reached. Please try again in a few minutes.",
        "github.errorNotFound": "The GitHub profile could not be found.",
        "github.errorGeneric": "Sorry, my GitHub projects could not be loaded right now. Please try again later.",
        "github.empty": "No public repositories yet. New projects will appear here automatically.",
        "github.showing": "Showing my {count} most recently updated repositories.",
        "github.stats": "{repos} public repositories · {followers} followers",
        "github.viewProfile": "View profile",
        "github.viewProfileHidden": " on GitHub (opens in a new tab)",
        "github.noDescription": "No description yet.",
        "github.updated": "Updated {time}",
        "github.stars": "{count} stars",
        "github.justNow": "just now",
        "github.retry": "Try again",
        "common.newTab": " (opens in a new tab)",

        /* Contact */
        "contact.title": "Contact Me",
        "contact.name": "Name",
        "contact.namePlaceholder": "Your name",
        "contact.email": "Email",
        "contact.reason": "Reason for contacting me",
        "contact.reasonChoose": "Choose a reason…",
        "contact.reasonJob": "Job or internship opportunity",
        "contact.reasonCollaboration": "Project collaboration",
        "contact.reasonFeedback": "Feedback on my portfolio",
        "contact.reasonHello": "Just saying hi",
        "contact.link": "Project link",
        "contact.optional": "(optional)",
        "contact.message": "Message",
        "contact.messagePlaceholder": "Write your message here...",
        "contact.send": "Send Message",
        "contact.sending": "Sending…",
        "contact.success": "Thank you, {name}! Your message about {reason} has been received. I will reply to {email}.",
        "contact.hint": "To enable the Send button, add {fields}.",
        "contact.listSeparator": ", ",
        "reason.job.label": "a job or internship",
        "reason.job.note": "Great! Please mention the role and the company in your message.",
        "reason.collaboration.label": "a project collaboration",
        "reason.collaboration.note": "Sounds fun! You can add a link to the project below (optional).",
        "reason.feedback.label": "feedback on my portfolio",
        "reason.feedback.note": "Thank you! Honest feedback helps me improve.",
        "reason.hello.label": "saying hi",
        "reason.hello.note": "Hi! I would love to hear from you.",
        "error.nameEmpty": "Please enter your name.",
        "error.nameShort": "Your name should be at least 2 characters.",
        "error.nameLetters": "Please use letters only in your name.",
        "error.emailEmpty": "Please enter your email.",
        "error.emailInvalid": "Please enter a valid email, like name@example.com.",
        "error.reason": "Please choose a reason for your message.",
        "error.link": "Please enter a full link that starts with https://",
        "error.messageEmpty": "Please write a message before sending.",
        "error.messageShort": "Your message is too short (at least {min} characters).",
        "error.messageLong": "Your message is too long (at most {max} characters).",
        "hint.name": "your name",
        "hint.email": "a valid email",
        "hint.reason": "a reason",
        "hint.project-link": "a valid project link",
        "hint.message": "a message of at least {min} characters",

        /* Footer and timer */
        "footer.copy": "© Razan Almubarak. Built for SWE 363 – Assignment 4.",
        "footer.timer": "You have been on my portfolio for",

        /* Digital garden */
        "garden.bloomed": "Your flower bloomed! Thank you for reading all the way down."
    },

    ar: {
        /* الصفحة */
        "page.title": "رزان المبارك | البورتفوليو الشخصي",
        "lang.button": "English",
        "lang.buttonLabel": "التبديل إلى الإنجليزية",

        /* التنقل والهيدر */
        "nav.about": "نبذة عني",
        "nav.projects": "المشاريع",
        "nav.github": "GitHub",
        "nav.contact": "تواصل",
        "theme.toLight": "☀ الوضع الفاتح",
        "theme.toDark": "☾ الوضع الداكن",
        "hero.name": "رزان المبارك",
        "hero.tagline": "طالبة هندسة برمجيات — أبني التطبيقات وأصنع تجارب رقمية ذات معنى",

        /* التحية واسم الزائر */
        "greeting.morning": "صباح الخير",
        "greeting.afternoon": "طاب يومك",
        "greeting.evening": "مساء الخير",
        "greeting.returning": "{time} يا {name}! أهلًا بعودتك، هذه زيارتك رقم {visits}.",
        "greeting.named": "{time} يا {name}! شكرًا لزيارتك موقعي.",
        "greeting.anonymous": "{time}! شكرًا لزيارتك موقعي.",
        "visitor.label": "بماذا أناديك؟",
        "visitor.placeholder": "اسمك الأول",
        "visitor.save": "حفظ",
        "visitor.change": "لست أنت؟ غيّر الاسم",
        "visitor.errorEmpty": "اكتب اسمًا أولًا.",
        "visitor.errorLength": "يجب أن يكون الاسم بين 2 و30 حرفًا.",
        "visitor.errorLetters": "استخدم الحروف فقط.",

        /* إظهار وإخفاء الأقسام */
        "section.hide": "إخفاء",
        "section.show": "إظهار",
        "section.toggleLabel": "{action} {section}",

        /* نبذة عني */
        "about.title": "نبذة عني",
        "about.text": "مرحبًا، أنا رزان، طالبة هندسة برمجيات مهتمة بتطوير الويب. أستمتع بتحويل الأفكار إلى مواقع بسيطة وعملية، وأطوّر مهاراتي باستمرار في HTML وCSS وJavaScript. وأهتم بشكل خاص بصناعة تجارب رقمية مفيدة وسهلة الاستخدام.",

        /* المشاريع */
        "projects.title": "المشاريع",
        "projects.category": "التصنيف",
        "category.all": "الكل",
        "category.web": "ويب",
        "category.mobile": "جوال",
        "category.software-engineering": "هندسة البرمجيات",
        "projects.level": "المستوى",
        "level.all": "كل المستويات",
        "level.beginner": "مبتدئ",
        "level.intermediate": "متوسط",
        "level.advanced": "متقدم",
        "projects.sort": "الترتيب",
        "sort.newest": "الأحدث أولًا",
        "sort.oldest": "الأقدم أولًا",
        "sort.title": "العنوان (أ–ي)",
        "projects.search": "بحث",
        "projects.searchPlaceholder": "مثل: API، UML، عربي",
        "projects.reset": "إعادة ضبط الفلاتر",
        "projects.count": "عرض {shown} من أصل {total} مشاريع",
        "projects.viewCode": "عرض الكود على GitHub",
        "projects.technologies": "التقنيات",
        "levelMessage.all": "اختر مستوى لتظهر لك المشاريع التي تناسب ما تبحث عنه.",
        "levelMessage.beginner": "مشاريع المبتدئين: خطواتي الأولى مع HTML وCSS وJavaScript.",
        "levelMessage.intermediate": "مشاريع المستوى المتوسط: ميزات تفاعلية، وتحقق من المدخلات، وحالات استخدام حقيقية.",
        "levelMessage.advanced": "مشاريع متقدمة: واجهات برمجية، وحفظ الحالة، وهندسة برمجيات ضمن فريق.",
        "projects.empty": ({ level, category, search }) => {
            const categoryText = category ? ` في تصنيف «${category}»` : "";
            const levelText = level ? ` بمستوى «${level}»` : "";
            const ending = search ? ` تطابق «${search}»` : " بعد";
            return `لا توجد مشاريع${categoryText}${levelText}${ending}. جرّب مستوى أو تصنيفًا آخر، أو أعد ضبط الفلاتر.`;
        },

        /* GitHub */
        "github.title": "آخر أعمالي على GitHub",
        "github.intro": "هذه المستودعات تُحمَّل مباشرة من حسابي في GitHub، فتبقى القائمة محدّثة دون الحاجة لتعديل الصفحة.",
        "github.loading": "جارٍ تحميل أحدث مستودعاتي من GitHub…",
        "github.errorOffline": "يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك ثم حاول مرة أخرى.",
        "github.errorTimeout": "GitHub يتأخر في الرد. حاول مرة أخرى.",
        "github.errorRateLimit": "وصلت طلبات GitHub إلى الحد المسموح في الساعة. حاول مرة أخرى بعد دقائق.",
        "github.errorNotFound": "تعذّر العثور على حساب GitHub.",
        "github.errorGeneric": "عذرًا، تعذّر تحميل مشاريعي من GitHub الآن. حاول مرة أخرى لاحقًا.",
        "github.empty": "لا توجد مستودعات عامة بعد. ستظهر المشاريع الجديدة هنا تلقائيًا.",
        "github.showing": "عرض آخر {count} مستودعات حدّثتها.",
        "github.stats": "{repos} مستودعات عامة · {followers} متابعين",
        "github.viewProfile": "عرض الحساب",
        "github.viewProfileHidden": " على GitHub (يفتح في تبويب جديد)",
        "github.noDescription": "لا يوجد وصف بعد.",
        "github.updated": "آخر تحديث {time}",
        "github.stars": "{count} نجوم",
        "github.justNow": "الآن",
        "github.retry": "حاول مرة أخرى",
        "common.newTab": " (يفتح في تبويب جديد)",

        /* التواصل */
        "contact.title": "تواصل معي",
        "contact.name": "الاسم",
        "contact.namePlaceholder": "اسمك",
        "contact.email": "البريد الإلكتروني",
        "contact.reason": "سبب التواصل",
        "contact.reasonChoose": "اختر السبب…",
        "contact.reasonJob": "فرصة وظيفية أو تدريب",
        "contact.reasonCollaboration": "تعاون في مشروع",
        "contact.reasonFeedback": "رأيك في موقعي",
        "contact.reasonHello": "مجرد تحية",
        "contact.link": "رابط المشروع",
        "contact.optional": "(اختياري)",
        "contact.message": "الرسالة",
        "contact.messagePlaceholder": "اكتب رسالتك هنا...",
        "contact.send": "إرسال الرسالة",
        "contact.sending": "جارٍ الإرسال…",
        "contact.success": "شكرًا لك يا {name}! وصلتني رسالتك بخصوص {reason}، وسأرد عليك على {email}.",
        "contact.hint": "لتفعيل زر الإرسال، أضف: {fields}.",
        "contact.listSeparator": "، ",
        "reason.job.label": "فرصة وظيفية أو تدريب",
        "reason.job.note": "رائع! اذكر الدور واسم الشركة في رسالتك.",
        "reason.collaboration.label": "التعاون في مشروع",
        "reason.collaboration.note": "فكرة جميلة! يمكنك إضافة رابط المشروع في الأسفل (اختياري).",
        "reason.feedback.label": "رأيك في موقعي",
        "reason.feedback.note": "شكرًا لك! الآراء الصادقة تساعدني على التحسّن.",
        "reason.hello.label": "التحية",
        "reason.hello.note": "أهلًا! يسعدني أن أسمع منك.",
        "error.nameEmpty": "اكتب اسمك من فضلك.",
        "error.nameShort": "يجب أن يتكون الاسم من حرفين على الأقل.",
        "error.nameLetters": "استخدم الحروف فقط في الاسم.",
        "error.emailEmpty": "اكتب بريدك الإلكتروني.",
        "error.emailInvalid": "اكتب بريدًا إلكترونيًا صحيحًا، مثل name@example.com.",
        "error.reason": "اختر سبب رسالتك.",
        "error.link": "اكتب رابطًا كاملًا يبدأ بـ https://",
        "error.messageEmpty": "اكتب رسالتك قبل الإرسال.",
        "error.messageShort": "رسالتك قصيرة جدًا ({min} أحرف على الأقل).",
        "error.messageLong": "رسالتك طويلة جدًا ({max} حرف كحد أقصى).",
        "hint.name": "اسمك",
        "hint.email": "بريدًا إلكترونيًا صحيحًا",
        "hint.reason": "سبب التواصل",
        "hint.project-link": "رابط مشروع صحيحًا",
        "hint.message": "رسالة من {min} أحرف على الأقل",

        /* الفوتر والمؤقت */
        "footer.copy": "© رزان المبارك. صُمّم لمادة SWE 363 – الواجب 4.",
        "footer.timer": "مدة زيارتك لموقعي",

        /* الحديقة الرقمية */
        "garden.bloomed": "تفتّحت وردتك! شكرًا لأنك قرأت حتى النهاية."
    }
};
