/* =====================================================
   PAW PRINTS WEEKLY — SCRIPT.JS
   Glen A. Wilson High School
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const newsletterForm = document.getElementById("newsletterForm");
    const emailInput = document.getElementById("emailInput");
    const currentDate = document.getElementById("currentDate");


    /* =====================================================
       CURRENT DATE
    ===================================================== */

    if (currentDate) {
        const now = new Date();

        currentDate.textContent = now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        }).toUpperCase();
    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("open");

            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", isOpen);
        });


        /* Close menu when clicking a navigation link */

        mainNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }


    /* =====================================================
       SCROLL REVEAL
       Animations replay every time elements enter
       the viewport.
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    /*
                     * Remove the class first so the animation
                     * can be restarted from the beginning.
                     */

                    entry.target.classList.remove("visible");

                    /*
                     * Force browser reflow.
                     */

                    void entry.target.offsetWidth;

                    /*
                     * Start animation.
                     */

                    entry.target.classList.add("visible");

                } else {

                    /*
                     * Remove visible when leaving viewport.
                     * This allows it to animate again later.
                     */

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
       
       CSS animations pause/reset when they leave the
       viewport and restart when they return.
    ===================================================== */

    const animationTargets = [];


    /*
     * Find elements that have CSS animations.
     */

    document.querySelectorAll("*").forEach(element => {

        const styles = window.getComputedStyle(element);

        if (
            styles.animationName &&
            styles.animationName !== "none"
        ) {
            animationTargets.push(element);
        }

    });


    /*
     * Observe animated elements.
     */

    const animationObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                const element = entry.target;


                if (entry.isIntersecting) {

                    /*
                     * Remove reset state.
                     */

                    element.classList.remove("viewport-reset");

                    /*
                     * Force a reflow so the browser knows
                     * the animation should restart.
                     */

                    void element.offsetWidth;

                    /*
                     * Resume animation.
                     */

                    element.classList.remove("viewport-paused");

                } else {

                    /*
                     * Pause the animation.
                     */

                    element.classList.add("viewport-paused");


                    /*
                     * Remove the reset class first.
                     */

                    element.classList.remove("viewport-reset");

                    /*
                     * Force reflow.
                     */

                    void element.offsetWidth;

                    /*
                     * Completely reset the animation.
                     */

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
       
       Highlights the navigation item corresponding
       to the section currently being viewed.
    ===================================================== */

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(
        '.main-nav a[href^="#"]'
    );


    const sectionObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    const id = entry.target.getAttribute("id");

                    navLinks.forEach(link => {

                        link.classList.remove("active");

                        if (
                            link.getAttribute("href") === `#${id}`
                        ) {
                            link.classList.add("active");
                        }

                    });

                }

            });

        },
        {
            threshold: 0.25,
            rootMargin: "-20% 0px -60% 0px"
        }
    );


    sections.forEach(section => {
        sectionObserver.observe(section);
    });


    /* =====================================================
       NEWSLETTER FORM
    ===================================================== */

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();

            const button = newsletterForm.querySelector(
                'button[type="submit"]'
            );


            if (!button || !emailInput) {
                return;
            }


            const originalText = button.textContent;

            button.textContent = "SUBSCRIBED!";
            button.disabled = true;

            emailInput.value = "";


            setTimeout(() => {

                button.textContent = originalText;
                button.disabled = false;

            }, 3000);

        });

    }


    /* =====================================================
       SMOOTH SCROLLING
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#" ||
                targetId.length <= 1
            ) {
                return;
            }


            const target = document.querySelector(targetId);


            if (!target) {
                return;
            }


            event.preventDefault();


            /*
             * Account for the sticky header.
             */

            const header = document.querySelector("header");

            const headerHeight = header
                ? header.offsetHeight
                : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;


            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       HOVER PERFORMANCE
       
       Gives the browser a small hint before hover effects.
    ===================================================== */

    const hoverElements = document.querySelectorAll(
        ".story-card, .sports-card, .staff-card, .btn, .nav-link"
    );


    hoverElements.forEach(element => {

        element.addEventListener("mouseenter", () => {
            element.style.willChange = "transform";
        });


        element.addEventListener("mouseleave", () => {
            element.style.willChange = "auto";
        });

    });


    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    const heroPaw = document.querySelector(".hero-paw");

    let ticking = false;


    function updateParallax() {

        if (!heroPaw) {
            ticking = false;
            return;
        }


        const scrollPosition = window.scrollY;


        /*
         * Keep movement subtle so lower-end computers
         * don't have to render a large amount of movement.
         */

        const movement = Math.min(
            scrollPosition * 0.08,
            35
        );


        heroPaw.style.transform =
            `translate3d(0, ${movement}px, 0)`;


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
       
       Closes the mobile navigation.
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            if (mainNav) {
                mainNav.classList.remove("open");
            }

            if (menuToggle) {
                menuToggle.classList.remove("active");
                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        }

    });


    /* =====================================================
       REDUCED MOTION
       
       Respect users who have disabled animations
       in their operating system.
    ===================================================== */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    function handleReducedMotion() {

        if (reducedMotion.matches) {

            document.documentElement.classList.add(
                "reduce-motion"
            );

        } else {

            document.documentElement.classList.remove(
                "reduce-motion"
            );

        }

    }


    handleReducedMotion();


    if (reducedMotion.addEventListener) {

        reducedMotion.addEventListener(
            "change",
            handleReducedMotion
        );

    } else if (reducedMotion.addListener) {

        reducedMotion.addListener(
            handleReducedMotion
        );

    }


    /* =====================================================
       IMAGE FALLBACK
       
       If tiger.png cannot load, prevent a broken-image
       icon from ruining the layout.
    ===================================================== */

    const tigerImages = document.querySelectorAll(
        'img[src="images/tiger.png"]'
    );


    tigerImages.forEach(image => {

        image.addEventListener("error", () => {

            image.classList.add("image-error");

        });

    });


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    /*
     * Make sure the page starts at the correct scroll
     * position when loaded through a hash.
     */

    if (window.location.hash) {

        setTimeout(() => {

            const target = document.querySelector(
                window.location.hash
            );


            if (target) {

                const header =
                    document.querySelector("header");

                const headerHeight = header
                    ? header.offsetHeight
                    : 0;


                window.scrollTo({
                    top:
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        headerHeight,
                    behavior: "auto"
                });

            }

        }, 100);

    }

});
