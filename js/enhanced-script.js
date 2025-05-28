// Enhanced Script for AECC Website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all enhanced features
    initPageTransitions();
    initSmartSlider();
    initAnimations();
    initSearchFunctionality();
    initBreadcrumbs();
});

// Page Transitions
function initPageTransitions() {
    // Add transition class to main content
    const mainContent = document.querySelector('main') || document.querySelector('.container');
    if (mainContent) {
        mainContent.classList.add('page-transition');
    }

    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Use Intersection Observer to trigger animations when elements come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(section);
    });

    // Smooth transitions between pages
    document.querySelectorAll('a').forEach(link => {
        // Only apply to internal links (not anchor links)
        if (link.href.includes(window.location.origin) && !link.href.includes('#') && !link.getAttribute('target')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                
                // Fade out current page
                document.body.style.opacity = 0;
                
                // Navigate to new page after transition
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            });
        }
    });

    // Fade in page on load
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.opacity = 1;
        document.body.style.transition = 'opacity 0.4s ease-in-out';
    }, 100);
}

// Smart Slider
function initSmartSlider() {
    const slider = document.querySelector('.smart-slider');
    if (!slider) return;

    const sliderTrack = slider.querySelector('.smart-slider-track');
    const slides = slider.querySelectorAll('.smart-slider-slide');
    const dots = slider.querySelectorAll('.smart-slider-dot');
    const prevArrow = slider.querySelector('.smart-slider-arrow.prev');
    const nextArrow = slider.querySelector('.smart-slider-arrow.next');
    
    let currentIndex = 0;
    let autoplayInterval;
    let autoplaySpeed = 5000; // Default speed
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Initialize first slide
    updateSlider();
    startAutoplay();
    
    // Event listeners for controls
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            goToPrevSlide();
            resetAutoplay();
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            goToNextSlide();
            resetAutoplay();
        });
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
            resetAutoplay();
        });
    });
    
    // Touch events for mobile swipe
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        pauseAutoplay();
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        resumeAutoplay();
    }, { passive: true });
    
    // Mouse events for desktop drag
    slider.addEventListener('mousedown', (e) => {
        touchStartX = e.screenX;
        slider.style.cursor = 'grabbing';
        pauseAutoplay();
    });
    
    slider.addEventListener('mouseup', (e) => {
        touchEndX = e.screenX;
        slider.style.cursor = 'grab';
        handleSwipe();
        resumeAutoplay();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isElementInViewport(slider)) {
            if (e.key === 'ArrowLeft') {
                goToPrevSlide();
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                goToNextSlide();
                resetAutoplay();
            }
        }
    });
    
    // Pause autoplay when user hovers over slider
    slider.addEventListener('mouseenter', pauseAutoplay);
    slider.addEventListener('mouseleave', resumeAutoplay);
    
    // Adjust autoplay speed based on user interaction
    let userInteractionCount = 0;
    slider.addEventListener('click', () => {
        userInteractionCount++;
        if (userInteractionCount > 3) {
            // User is actively engaged, slow down the autoplay
            autoplaySpeed = 7000;
            resetAutoplay();
        }
    });
    
    // Functions
    function goToNextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }
    
    function goToPrevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }
    
    function updateSlider() {
        // Update track position
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        
        // Update active states
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            goToNextSlide();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            goToPrevSlide();
        }
    }
    
    function startAutoplay() {
        autoplayInterval = setInterval(goToNextSlide, autoplaySpeed);
    }
    
    function pauseAutoplay() {
        clearInterval(autoplayInterval);
    }
    
    function resumeAutoplay() {
        autoplayInterval = setInterval(goToNextSlide, autoplaySpeed);
    }
    
    function resetAutoplay() {
        pauseAutoplay();
        resumeAutoplay();
    }
    
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Animations
function initAnimations() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.feature-card, .blog-card, .resource-card');
    cards.forEach(card => {
        card.classList.add('hover-lift');
    });
    
    // Add pulse animation to important buttons
    const ctaButtons = document.querySelectorAll('.btn-primary, .cta-btn');
    ctaButtons.forEach(button => {
        button.classList.add('pulse');
    });
    
    // Add rotation effect to icons
    const icons = document.querySelectorAll('.feature-icon i, .social-icon i');
    icons.forEach(icon => {
        icon.classList.add('rotate-icon');
    });
    
    // Animate numbers (for statistics)
    animateNumbers();
}

// Animate numbers
function animateNumbers() {
    const numberElements = document.querySelectorAll('.animate-number');
    
    numberElements.forEach(element => {
        const targetNumber = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        const startValue = 0;
        
        function updateNumber() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            if (elapsed < duration) {
                const value = Math.floor(easeOutQuad(elapsed, startValue, targetNumber, duration));
                element.textContent = value;
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetNumber;
            }
        }
        
        // Intersection Observer to start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(element);
    });
    
    // Easing function
    function easeOutQuad(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    }
}

// Search Functionality
function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (!searchInput || !searchButton) return;
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (query === '') return;
        
        // Store search query in session storage
        sessionStorage.setItem('searchQuery', query);
        
        // Redirect to search results page
        window.location.href = 'search-results.html';
    }
    
    // If on search results page, display results
    if (window.location.pathname.includes('search-results.html')) {
        displaySearchResults();
    }
    
    function displaySearchResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;
        
        const query = sessionStorage.getItem('searchQuery');
        if (!query) {
            resultsContainer.innerHTML = '<p>No search query found. Please try searching again.</p>';
            return;
        }
        
        // In a real implementation, this would fetch results from a backend
        // For now, we'll simulate results based on page content
        const pages = [
            { title: 'Home', url: 'index.html', content: 'Welcome to the Association of Congolese Students in China. Find information about community support, academic resources, and more.' },
            { title: 'About Us', url: 'about.html', content: 'Learn about our mission, vision, history, and meet our office members.' },
            { title: 'Blogs', url: 'blogs.html', content: 'Read the latest blogs about student life, academic achievements, and cultural experiences in China.' },
            { title: 'Resources', url: 'resources.html', content: 'Access downloadable files, external resources, and join our community forum.' },
            { title: 'Learning', url: 'learning.html', content: 'Explore educational resources including YouTube channels, blogs, online courses, and Telegram channels.' },
            { title: 'Contact', url: 'contact.html', content: 'Get in touch with us. Find our contact information and office hours.' }
        ];
        
        const results = pages.filter(page => 
            page.title.toLowerCase().includes(query) || 
            page.content.toLowerCase().includes(query)
        );
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `<p>No results found for "${query}". Please try a different search term.</p>`;
            return;
        }
        
        let resultsHTML = `<h2>Search Results for "${query}"</h2>`;
        results.forEach(result => {
            resultsHTML += `
                <div class="search-result-item">
                    <h3><a href="${result.url}">${result.title}</a></h3>
                    <p>${highlightQuery(result.content, query)}</p>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = resultsHTML;
    }
    
    function highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Breadcrumbs
function initBreadcrumbs() {
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    if (!breadcrumbContainer) return;
    
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
    const currentPage = pathSegments[pathSegments.length - 1].replace('.html', '');
    
    // Create home link
    let breadcrumbHTML = `<li class="breadcrumb-item"><a href="index.html">Home</a></li>`;
    
    // Add current page
    if (currentPage && currentPage !== 'index') {
        const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
        breadcrumbHTML += `<li class="breadcrumb-item active">${pageTitle}</li>`;
    }
    
    breadcrumbContainer.innerHTML = breadcrumbHTML;
}
