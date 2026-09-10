/* =====================================================
   PAW PRINTS WEEKLY
   Main JavaScript + Supabase Articles
===================================================== */

const PPW_SUPABASE_URL = "https://qyipadinsphoyxotrceo.supabase.co";
const PPW_SUPABASE_KEY = "sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt";

/* -----------------------------
   BASIC SITE FUNCTIONS
----------------------------- */

const currentDate = document.getElementById("currentDate");

if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }).toUpperCase();
}

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const open = mainNav.classList.toggle("open");
        menuToggle.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open);
    });

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        });
    });
}

/* -----------------------------
   REPLAYABLE SCROLL REVEALS
----------------------------- */

const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("visible");
                void entry.target.offsetWidth;
                entry.target.classList.add("visible");
            } else {
                entry.target.classList.remove("visible");
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
    });

    revealElements.forEach(element => revealObserver.observe(element));
}

/* -----------------------------
   ACTIVE NAVIGATION
----------------------------- */

const navLinks = [...document.querySelectorAll("#mainNav a")];
const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

if (navSections.length) {
    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            navLinks.forEach(link => link.classList.remove("active"));
            const active = navLinks.find(link => link.getAttribute("href") === `#${entry.target.id}`);
            if (active) active.classList.add("active");
        });
    }, {
        threshold: 0.15,
        rootMargin: "-25% 0px -60% 0px"
    });

    navSections.forEach(section => navObserver.observe(section));
}

/* -----------------------------
   NEWSLETTER DEMO
----------------------------- */

const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", event => {
        event.preventDefault();
        const input = newsletterForm.querySelector("input[type='email']");
        const button = newsletterForm.querySelector("button");

        if (!input || !button) return;

        button.textContent = "Subscribed";
        input.value = "";
        input.placeholder = "You're on the list";
        button.disabled = true;
    });
}

/* -----------------------------
   SMOOTH ANCHOR LINKS
----------------------------- */

document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", event => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

/* -----------------------------
   SUPABASE ARTICLE SYSTEM
----------------------------- */

if (typeof supabase !== "undefined") {
    const ppwDatabase = supabase.createClient(PPW_SUPABASE_URL, PPW_SUPABASE_KEY);

    const latestContainer = document.getElementById("latestArticles");
    const featuredContainer = document.getElementById("featuredArticle");
    const schoolContainer = document.getElementById("schoolArticles");
    const studentContainer = document.getElementById("studentLifeArticle");
    const sportsContainer = document.getElementById("sportsArticles");
    const opinionContainer = document.getElementById("opinionArticles");

    const esc = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const formatDate = value => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        }).toUpperCase();
    };

    const categoryLabel = value => esc(value || "STORY").toUpperCase();

    const articleUrl = article => `article.html?slug=${encodeURIComponent(article.slug || "")}`;

    const imageMarkup = (article, large = false) => {
        if (article.image_url) {
            return `<img class="${large ? "dynamic-featured-image-element" : "dynamic-article-image"}" src="${esc(article.image_url)}" alt="${esc(article.title)}" loading="lazy">`;
        }

        return `<div class="${large ? "image-placeholder" : "dynamic-article-placeholder"}">
            <div class="placeholder-paw">🐾</div>
            <span>${categoryLabel(article.category)}</span>
        </div>`;
    };

    const standardCard = article => `
        <a class="dynamic-article-card reveal" href="${articleUrl(article)}">
            ${imageMarkup(article)}
            <div class="dynamic-article-body">
                <span class="category">${categoryLabel(article.category)}</span>
                <h3>${esc(article.title)}</h3>
                ${article.excerpt ? `<p>${esc(article.excerpt)}</p>` : ""}
                <div class="dynamic-card-meta">
                    <span>BY ${esc(article.author || "PPW STAFF").toUpperCase()}</span>
                    <span>${formatDate(article.published_at)}</span>
                </div>
            </div>
        </a>`;

    const empty = (message, dark = false) =>
        `<div class="dynamic-empty${dark ? " dark-empty" : ""}">${esc(message)}</div>`;

    const newsCard = (article, index) => `
        <a class="dynamic-news-card reveal" href="${articleUrl(article)}">
            <div class="dynamic-news-number">${String(index + 1).padStart(2, "0")}</div>
            <div>
                <span class="category">${categoryLabel(article.category)}</span>
                <h3>${esc(article.title)}</h3>
                ${article.excerpt ? `<p>${esc(article.excerpt)}</p>` : ""}
                <div class="dynamic-card-meta">
                    <span>BY ${esc(article.author || "PPW STAFF").toUpperCase()}</span>
                    <span>${formatDate(article.published_at)}</span>
                </div>
            </div>
            <span class="dynamic-news-arrow">→</span>
        </a>`;

    const featuredCard = article => `
        <a class="dynamic-featured-card reveal" href="${articleUrl(article)}">
            <div class="dynamic-featured-image">
                ${article.image_url
                    ? `<img src="${esc(article.image_url)}" alt="${esc(article.title)}" loading="lazy">`
                    : `<div class="image-placeholder"><div class="placeholder-paw">🐾</div><span>FEATURED STORY</span></div>`}
                <div class="image-corner">${categoryLabel(article.category)}</div>
            </div>
            <div class="dynamic-featured-content">
                <span class="category">${categoryLabel(article.category)}</span>
                <h3>${esc(article.title)}</h3>
                ${article.excerpt ? `<p>${esc(article.excerpt)}</p>` : ""}
                <div class="article-meta">
                    <span>BY ${esc(article.author || "PPW STAFF").toUpperCase()}</span>
                    <span>${formatDate(article.published_at)}</span>
                </div>
                <span class="read-more">Read full story <span>→</span></span>
            </div>
        </a>`;

    const sectionFeature = article => `
        <a class="dynamic-article-card reveal" href="${articleUrl(article)}">
            ${imageMarkup(article)}
            <div class="dynamic-article-body">
                <span class="category">LATEST IN ${categoryLabel(article.category)}</span>
                <h3>${esc(article.title)}</h3>
                ${article.excerpt ? `<p>${esc(article.excerpt)}</p>` : ""}
                <div class="dynamic-card-meta">
                    <span>BY ${esc(article.author || "PPW STAFF").toUpperCase()}</span>
                    <span>${formatDate(article.published_at)}</span>
                </div>
                <span class="read-more">Read full story <span>→</span></span>
            </div>
        </a>`;

    async function loadArticles() {
        const { data, error } = await ppwDatabase
            .from("articles")
            .select("id,title,slug,excerpt,category,author,image_url,published_at,featured,status")
            .eq("status", "published")
            .order("published_at", { ascending: false });

        if (error) {
            console.error("PPW article loading error:", error);
            if (latestContainer) latestContainer.innerHTML = empty("Articles could not be loaded right now.");
            if (featuredContainer) featuredContainer.innerHTML = empty("The featured story could not be loaded right now.");
            if (schoolContainer) schoolContainer.innerHTML = empty("School news could not be loaded right now.", true);
            if (studentContainer) studentContainer.innerHTML = empty("Student life stories could not be loaded right now.");
            if (sportsContainer) sportsContainer.innerHTML = empty("Sports stories could not be loaded right now.");
            if (opinionContainer) opinionContainer.innerHTML = empty("Opinions could not be loaded right now.");
            return;
        }

        const articles = data || [];

        /* Latest Stories = everything, newest first. */
        if (latestContainer) {
            latestContainer.innerHTML = articles.length
                ? articles.slice(0, 8).map(standardCard).join("")
                : empty("No published stories yet.");
        }

        /* Featured = newest published article overall. */
        if (featuredContainer) {
            featuredContainer.innerHTML = articles.length
                ? featuredCard(articles[0])
                : empty("No featured story has been published yet.");
        }

        /* Each perspective section gets its own newest article. */
        const byCategory = category => articles.filter(article =>
            String(article.category || "").toLowerCase() === category.toLowerCase()
        );

        const school = byCategory("School News");
        const student = byCategory("Student Life");
        const sports = byCategory("Sports");
        const opinions = byCategory("Opinions");

        if (schoolContainer) {
            schoolContainer.innerHTML = school.length
                ? school.slice(0, 3).map(newsCard).join("")
                : empty("No school news has been published yet.", true);
        }

        if (studentContainer) {
            studentContainer.innerHTML = student.length
                ? sectionFeature(student[0])
                : empty("No student life story has been published yet.");
        }

        if (sportsContainer) {
            sportsContainer.innerHTML = sports.length
                ? sports.slice(0, 3).map(standardCard).join("")
                : empty("No sports story has been published yet.");
        }

        if (opinionContainer) {
            opinionContainer.innerHTML = opinions.length
                ? opinions.slice(0, 2).map(standardCard).join("")
                : empty("No opinion has been published yet.");
        }

        /* New cards are added after the original observer was created, so observe them here too. */
        document.querySelectorAll(".dynamic-article-card.reveal, .dynamic-featured-card.reveal, .dynamic-news-card.reveal")
            .forEach(element => {
                element.classList.remove("visible");
                void element.offsetWidth;
                element.classList.add("visible");
            });
    }

    if (latestContainer || featuredContainer || schoolContainer || studentContainer || sportsContainer || opinionContainer) {
        loadArticles();
    }
}

/* -----------------------------
   SMALL INTERACTIONS
----------------------------- */

document.querySelectorAll(".button, .read-more, .sports-card a, .view-all").forEach(element => {
    element.addEventListener("mouseenter", () => {
        element.style.willChange = "transform";
    });
    element.addEventListener("mouseleave", () => {
        element.style.willChange = "auto";
    });
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape" && mainNav && menuToggle) {
        mainNav.classList.remove("open");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }
});
