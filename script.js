let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];

// Update Cart Count on Load
updateCartCount();

// Toggle Menu
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        renderCartItems();
    }
}

function addToCart(name, price) {
    cart.push({ name, price, id: Date.now() });
    localStorage.setItem('coffeeCart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('coffeeCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const count = document.getElementById('cart-count');
    if (count) count.textContent = `(${cart.length})`;
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.textContent = '0';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <span>${item.price} birr</span>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.textContent = total;
}

function checkout() {
    if (cart.length === 0) return alert("Cart is empty!");

    fetch('http://localhost:3005/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price, 0),
            date: new Date()
        })
    })
        .then(res => res.json())
        .then(data => {
            alert("Order placed successfully!");
            cart = [];
            localStorage.setItem('coffeeCart', JSON.stringify(cart));
            updateCartCount();
            toggleCart();
        })
        .catch(err => {
            console.error(err);
            alert("Order Error: Could not reach the server. Please ensure the server is running and try again.");
        });
}

// Smooth Scrolling and Mobile Menu Close
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const targetId = anchor.getAttribute('href');

        // Ignore links that are just "#" (like the Cart link)
        if (targetId === '#') {
            e.preventDefault();
            return;
        }

        e.preventDefault();

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }

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

// Initialize Observer on all .fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});


// Stats Animation
let statsAnimated = false; // Prevent re-animation
function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    const statNumbers = document.querySelectorAll('.stat-number');
    const targets = ['50+', '1.2M+', '5,000+', '23'];

    statNumbers.forEach((stat, index) => {
        const targetStr = targets[index] || '0';
        const isPlus = targetStr.includes('+');
        const isM = targetStr.toUpperCase().includes('M');
        const isK = targetStr.toLowerCase().includes('k') || targetStr.includes(',');

        let cleanStr = targetStr.replace(/,/g, '').replace(/[^\d.]/g, '');
        let finalNum = parseFloat(cleanStr);

        if (isM) finalNum *= 1000000;
        else if (cleanStr.includes('k')) finalNum *= 1000;

        let current = 0;
        const increment = Math.max(1, finalNum / 50);

        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNum) {
                current = finalNum;
                clearInterval(timer);
            }

            let display = Math.floor(current).toLocaleString();
            if (isM) display = (current / 1000000).toFixed(1) + 'M';
            else if (targetStr.includes('k')) display = (current / 1000).toFixed(0) + 'k';

            if (isPlus) display += '+';

            stat.textContent = display;
        }, 40);
    });
}

// Contact Form Submission (Mock)
function submitForm(event) {
    event.preventDefault();
    const button = event.target.querySelector('.submit-btn');
    const originalText = button.innerHTML;

    button.innerHTML = 'Sending...';
    button.disabled = true;

    // Send to backend (Future implementation)
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
        z-index: 2001;
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