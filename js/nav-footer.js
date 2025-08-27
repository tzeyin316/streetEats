// Set active nav link based on current page
document.addEventListener('DOMContentLoaded', function () {
    setActiveNavLink();
    addSmoothScrollToTop();
});

function setActiveNavLink() {
    // Get current page filename
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // If no filename or empty, assume it's index.html
    if (!currentPage || currentPage === '') {
        currentPage = 'index.html';
    }

    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-link');

    // Remove active class from all links first
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Find and activate the matching link
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref.endsWith(currentPage)) {
            link.classList.add('active');
        }
    });
}

// Allow smooth scroll to top of page
function addSmoothScrollToTop() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const linkHref = this.getAttribute('href');

            // Check if it's linking to the same page
            let currentPage = window.location.pathname.split('/').pop();
            if (!currentPage || currentPage === '') {
                currentPage = 'index.html';
            }

        if (linkHref.endsWith(currentPage)) {
                // Same page - prevent default and scroll to top
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
}