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


const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting
                ) {

                    entry.target.classList.add(
                        "visible"
                    );

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold: 0.08,

            rootMargin:
                "0px 0px -30px 0px"
        }
    );


revealElements.forEach(element => {

    revealObserver.observe(element);

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
