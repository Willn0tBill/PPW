/* =========================================
   PAW PRINTS WEEKLY
   Main JavaScript
========================================= */


/* =========================================
   MOBILE MENU
========================================= */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("active");

    if (mainNav.classList.contains("active")) {
        menuToggle.textContent = "✕";
    } else {
        menuToggle.textContent = "☰";
    }
});


/* Close mobile menu when clicking a link */

document.querySelectorAll("#mainNav a").forEach(link => {

    link.addEventListener("click", () => {

        mainNav.classList.remove("active");

        menuToggle.textContent = "☰";

    });

});


/* =========================================
   NEWSLETTER
========================================= */

const newsletterForm = document.getElementById("newsletterForm");

newsletterForm.addEventListener("submit", event => {

    event.preventDefault();

    const email = document.getElementById("email");

    if (!email.value.trim()) {
        return;
    }

    alert(
        "Thanks for subscribing to Paw Prints Weekly!"
    );

    email.value = "";

});


/* =========================================
   SIMPLE SCROLL REVEAL
========================================= */

const revealElements = document.querySelectorAll(
    ".article-card, .news-item, .opinion-card"
);

const revealObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.08
    }
);


revealElements.forEach(element => {

    element.style.opacity = "0";
    element.style.transform = "translateY(15px)";
    element.style.transition =
        "opacity 0.5s ease, transform 0.5s ease";

    revealObserver.observe(element);

});
