document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, {
        threshold: 0.15 // Trigger when 15% of the element is visible
    });

    const targets = document.querySelectorAll('.fade-in, .fade-in-section');
    targets.forEach(target => {
        observer.observe(target);
    });
});