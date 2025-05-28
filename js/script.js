// Mobile menu toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
}

// Login modal functionality
const loginBtn = document.querySelector('.login-btn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close-btn');

if (loginBtn && loginModal && closeBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });
}

// Form validation for registration
const registrationForm = document.getElementById('registrationForm');

if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Here you would normally send the form data to the server
        alert('Registration submitted successfully! You will receive a confirmation email shortly.');
        registrationForm.reset();
    });
}

// Scholarship type visibility toggle
const scholarshipRadios = document.querySelectorAll('input[name="scholarshipStatus"]');
const scholarshipTypeField = document.getElementById('scholarshipType');

if (scholarshipRadios.length > 0 && scholarshipTypeField) {
    scholarshipRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Yes') {
                scholarshipTypeField.parentElement.style.display = 'block';
                scholarshipTypeField.required = true;
            } else {
                scholarshipTypeField.parentElement.style.display = 'none';
                scholarshipTypeField.required = false;
                scholarshipTypeField.value = '';
            }
        });
    });
    
    // Initialize on page load
    if (document.querySelector('input[name="scholarshipStatus"][value="No"]')?.checked) {
        scholarshipTypeField.parentElement.style.display = 'none';
        scholarshipTypeField.required = false;
    }
}

// Back to login link in registration page
const backToLoginLink = document.getElementById('backToLogin');

if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') return;
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Resources tabs functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

if (tabBtns.length > 0 && tabPanes.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Contact form validation
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Here you would normally send the form data to the server
        alert('Your message has been sent successfully! We will get back to you soon.');
        contactForm.reset();
    });
}

// Login form submission
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Here you would normally authenticate the user
        alert('Login successful!');
        loginModal.style.display = 'none';
        // Redirect to profile page or dashboard
        // window.location.href = 'profile.html';
    });
}
