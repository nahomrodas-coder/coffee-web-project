// Toggle Menu
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Smooth Scrolling and Mobile Menu Close
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });

        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// Intersection Observer for Animations and Stats
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('stats')) {
                animateStats();
            }
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Stats Animation
let statsAnimated = false; // Prevent re-animation
function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    const statNumbers = document.querySelectorAll('.stat-number');
    const targets = ['50+', '10000+', '5000+', '15+']; // Targets matching the HTML content

    statNumbers.forEach((stat, index) => {
        const targetStr = targets[index];
        const isPlus = targetStr.includes('+');
        const isK = targetStr.toLowerCase().includes('k');
        let finalNum = parseInt(targetStr.replace(/[^\d]/g, ''));
        if (isK) finalNum *= 1000;

        let current = 0;
        const increment = Math.max(1, finalNum / 100); // Ensure at least 1

        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNum) {
                current = finalNum;
                clearInterval(timer);
            }

            let display = Math.floor(current);
            if (isK && display >= 1000) {
                display = Math.floor(display / 1000) + 'k';
            }
            if (isPlus) display += '+';

            stat.textContent = display;
        }, 30);
    });
}

// Contact Form Submission
function submitForm(event) {
    event.preventDefault();
    const button = event.target.querySelector('.submit-btn');
    const originalText = button.innerHTML; // Save original text/icon

    button.innerHTML = 'Sending...';
    button.disabled = true;

    setTimeout(() => {
        showNotification('Message sent successfully!');
        event.target.reset();
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1000);
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--gold);
        color: var(--dark-brown);
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(notification);

    // Fade in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
    });

    // Fade out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}