/* =====================================================
   PAW PRINTS WEEKLY
   Glen A. Wilson High School
   Main JavaScript
===================================================== */


/* =====================================================
   ELEMENTS
===================================================== */

const menuToggle =
    document.getElementById("menuToggle");

const mainNav =
    document.getElementById("mainNav");

const newsletterForm =
    document.getElementById("newsletterForm");

const emailInput =
    document.getElementById("email");

const currentDate =
    document.getElementById("currentDate");


/* =====================================================
   CURRENT DATE
===================================================== */

function updateDate() {

    if (!currentDate) return;

    const date = new Date();

    const options = {
        month: "long",
        year: "numeric"
    };

    currentDate.textContent =
        date.toLocaleDateString(
            "en-US",
            options
        ).toUpperCase();

}

updateDate();


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

if (menuToggle && mainNav) {

    menuToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                mainNav.classList.toggle("open");

            menuToggle.classList.toggle(
                "active",
                isOpen
            );

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
            );

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

        }
    );


    /* Close menu when clicking a link */

    const navLinks =
        mainNav.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mainNav.classList.remove("open");

                menuToggle.classList.remove(
                    "active"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                document.body.classList.remove(
                    "menu-open"
                );

            }
        );

    });

}


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("visible");
                void entry.target.offsetWidth;
                entry.target.classList.add("visible");
            } else {
                entry.target.classList.remove("visible");
            }
        });
    },
    {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
    }
);

revealElements.forEach(element => {
    revealObserver.observe(element);
});


/* =====================================================
   VIEWPORT ANIMATION CONTROLLER
   Animations pause and reset when they leave the viewport.
   They restart from the beginning when they return.
===================================================== */

const animationTargets = [];

document.querySelectorAll("*").forEach(element => {
    const styles = window.getComputedStyle(element);

    if (styles.animationName && styles.animationName !== "none") {
        animationTargets.push(element);
    }
});

const animationObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            const element = entry.target;

            if (entry.isIntersecting) {
                // Remove the reset state, force a reflow, then replay.
                element.classList.remove("viewport-reset");
                void element.offsetWidth;
                element.classList.remove("viewport-paused");
            } else {
                // Stop the animation first.
                element.classList.add("viewport-paused");

                // Then completely reset it so the next entrance starts at 0%.
                element.classList.remove("viewport-reset");
                void element.offsetWidth;
                element.classList.add("viewport-reset");
            }
        });
    },
    {
        threshold: 0.01,
        rootMargin: "0px"
    }
);

animationTargets.forEach(element => {
    animationObserver.observe(element);
});

/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );

const navigationLinks =
    document.querySelectorAll(
        "#mainNav a"
    );


const sectionObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    const sectionId =
                        entry.target.id;

                    navigationLinks.forEach(
                        link => {

                            link.classList.remove(
                                "active"
                            );

                            if (
                                link.getAttribute(
                                    "href"
                                ) ===
                                `#${sectionId}`
                            ) {

                                link.classList.add(
                                    "active"
                                );

                            }

                        }
                    );

                }

            });

        },
        {
            rootMargin:
                "-30% 0px -60% 0px"
        }
    );


sections.forEach(section => {

    sectionObserver.observe(section);

});


/* =====================================================
   NEWSLETTER
===================================================== */

if (newsletterForm) {

    newsletterForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            if (!email) {
                return;
            }


            /*
                This is currently a demo.

                Later you can connect this to:
                - Google Forms
                - Formspree
                - EmailJS
                - your own backend
            */


            const button =
                newsletterForm.querySelector(
                    "button"
                );

            const originalText =
                button.textContent;


            button.textContent =
                "Subscribed!";


            button.disabled = true;


            emailInput.value = "";


            setTimeout(() => {

                button.textContent =
                    originalText;

                button.disabled = false;

            }, 3000);

        }
    );

}


/* =====================================================
   SMOOTH ANCHOR HANDLING
===================================================== */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                const header =
                    document.querySelector(
                        ".site-header"
                    );


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 0;


                const targetPosition =
                    target.getBoundingClientRect()
                        .top
                    +
                    window.scrollY
                    -
                    headerHeight
                    -
                    10;


                window.scrollTo({

                    top: targetPosition,

                    behavior: "smooth"

                });

            }
        );

    });


/* =====================================================
   CARD HOVER MICRO-EFFECT
===================================================== */

const cards =
    document.querySelectorAll(
        ".article-card, .sports-card, .staff-card"
    );


cards.forEach(card => {

    card.addEventListener(
        "mouseenter",
        () => {

            card.style.willChange =
                "transform";

        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            card.style.willChange =
                "auto";

        }
    );

});


/* =====================================================
   PARALLAX DECORATION
   Very subtle and lightweight
===================================================== */

const hero =
    document.querySelector(".hero");

const decorativePaws =
    document.querySelectorAll(
        ".hero-paw"
    );


let ticking = false;


function updateParallax() {

    if (!hero) {
        ticking = false;
        return;
    }


    const scrollY =
        window.scrollY;


    /*
        Keep the movement extremely small
        so the website stays smooth.
    */

    decorativePaws.forEach(
        (paw, index) => {

            const amount =
                scrollY *
                (0.015 + index * 0.006);


            paw.style.transform =
                `translateY(${amount}px)`;

        }
    );


    ticking = false;

}


window.addEventListener(
    "scroll",
    () => {

        if (!ticking) {

            window.requestAnimationFrame(
                updateParallax
            );

            ticking = true;

        }

    },
    {
        passive: true
    }
);


/* =====================================================
   ESCAPE KEY
   Close mobile navigation
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            mainNav &&
            mainNav.classList.contains("open")
        ) {

            mainNav.classList.remove(
                "open"
            );

            menuToggle.classList.remove(
                "active"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove(
                "menu-open"
            );

        }

    }
);
/* =====================================================
   SUPABASE — LATEST PPW ARTICLES
===================================================== */
const PPW_SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co";
const PPW_SUPABASE_KEY="sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt";

if(typeof supabase!=="undefined"&&document.getElementById("latestArticles")){
    const ppwDatabase=supabase.createClient(PPW_SUPABASE_URL,PPW_SUPABASE_KEY);
    const latestArticles=document.getElementById("latestArticles");

    function ppwEsc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
    function ppwDate(v){return v?new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase():""}

    async function loadPPWArticles(){
        const {data,error}=await ppwDatabase.from("articles")
            .select("id,title,slug,excerpt,category,author,image_url,published_at,featured")
            .eq("status","published")
            .order("published_at",{ascending:false})
            .limit(8);

        if(error){
            console.error("PPW article loading error:",error);
            latestArticles.innerHTML='<div class="dynamic-empty">Latest stories are temporarily unavailable.</div>';
            return;
        }

        if(!data||!data.length){
            latestArticles.innerHTML='<div class="dynamic-empty">No published stories yet. Check back soon.</div>';
            return;
        }

        latestArticles.innerHTML=data.map(a=>{
            const image=a.image_url
                ?`<img class="dynamic-article-image" src="${ppwEsc(a.image_url)}" alt="${ppwEsc(a.title)}" loading="lazy">`
                :`<div class="dynamic-article-placeholder">${ppwEsc(a.category).toUpperCase()}</div>`;

            return `<article class="dynamic-article-card reveal">
                <a class="dynamic-article-link" href="article.html?slug=${encodeURIComponent(a.slug)}">
                    ${image}
                    <div class="dynamic-article-content">
                        <span class="category">${ppwEsc(a.category).toUpperCase()}</span>
                        <h3>${ppwEsc(a.title)}</h3>
                        <p>${ppwEsc(a.excerpt||"Read the latest story from Paw Prints Weekly.")}</p>
                        <div class="dynamic-article-meta">
                            <span>${ppwEsc((a.author||"PPW STAFF").toUpperCase())}</span>
                            <span>${ppwDate(a.published_at)}</span>
                        </div>
                    </div>
                </a>
            </article>`;
        }).join("");

        // Replay reveal animations for cards created after page load.
        latestArticles.querySelectorAll(".reveal").forEach(card=>{
            if(typeof revealObserver!=="undefined") revealObserver.observe(card);
        });
    }

    loadPPWArticles();
}
