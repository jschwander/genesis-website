// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your server
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Thank you for your interest! We will contact you shortly.');
        this.reset();
    });
}

// Add animations for sections
document.addEventListener('DOMContentLoaded', function() {
    // Simple animation for sections
    const animateSections = () => {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.8) {
                section.classList.add('visible');
            }
        });
    };
    
    // Initial check
    animateSections();
    
    // Check on scroll
    window.addEventListener('scroll', animateSections);
    
    // Initialize the timeline slider
    initSimpleSlider();
});

// Simple Card Slider for Timeline
function initSimpleSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;
    
    const sliderTrack = document.querySelector('.slider-track');
    const slides = sliderTrack.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    // Calculate how many slides we can show at once
    const containerWidth = sliderContainer.offsetWidth;
    const slideWidth = 400 + 40; // slide width + margin
    const visibleSlides = Math.floor(containerWidth / slideWidth) || 1;
    
    console.log(`Container width: ${containerWidth}, Slide width: ${slideWidth}, Visible slides: ${visibleSlides}`);
    
    // Set the width of the track based on the number of slides
    sliderTrack.style.width = `${slides.length * slideWidth}px`;
    
    let currentSlide = 0;
    const maxSlide = slides.length - visibleSlides;
    
    // Create navigation dots
    if (dotsContainer) {
        dotsContainer.innerHTML = ''; // Clear existing dots
        
        for (let i = 0; i <= maxSlide; i++) {
            const dot = document.createElement('span');
            dot.classList.add('slider-dot');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    
    // Initialize the slider
    updateSlider();
    
    // Add event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    function prevSlide() {
        currentSlide = Math.max(currentSlide - 1, 0);
        updateSlider();
    }
    
    function nextSlide() {
        currentSlide = Math.min(currentSlide + 1, maxSlide);
        updateSlider();
    }
    
    function goToSlide(index) {
        currentSlide = Math.min(Math.max(index, 0), maxSlide);
        updateSlider();
    }
    
    function updateSlider() {
        // Move the track to show the current slide
        const translateX = -currentSlide * slideWidth;
        sliderTrack.style.transform = `translateX(${translateX}px)`;
        
        // Update active classes on slides
        slides.forEach((slide, index) => {
            const isActive = index >= currentSlide && index < currentSlide + visibleSlides;
            slide.classList.toggle('active', isActive);
        });
        
        // Update the active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        // Update button states
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide === maxSlide;
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            // Recalculate visible slides
            const newContainerWidth = sliderContainer.offsetWidth;
            const newVisibleSlides = Math.floor(newContainerWidth / slideWidth) || 1;
            
            // Update maxSlide if needed
            const newMaxSlide = slides.length - newVisibleSlides;
            
            // Adjust current slide if we're past the new max
            if (currentSlide > newMaxSlide) {
                currentSlide = newMaxSlide;
            }
            
            updateSlider();
        }, 250);
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Add scroll animations
window.addEventListener('scroll', () => {
    document.querySelectorAll('.scroll-animation').forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add('visible');
        }
    });
});

// Video Modal Functionality
const videoModal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');
const closeModal = document.querySelector('.close-modal');
const watchButton = document.querySelector('.btn.primary');

// Replace this URL with your YouTube video URL
const videoUrl = 'https://www.youtube.com/embed/tDu47czfwiI';

watchButton.addEventListener('click', (e) => {
    e.preventDefault();
    videoFrame.src = videoUrl;
    videoModal.style.display = 'flex';
    setTimeout(() => {
        videoModal.classList.add('show');
    }, 10);
});

closeModal.addEventListener('click', () => {
    videoModal.classList.remove('show');
    setTimeout(() => {
        videoModal.style.display = 'none';
        videoFrame.src = '';
    }, 300);
});

// Close modal when clicking outside the video
videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        closeModal.click();
    }
});

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('show')) {
        closeModal.click();
    }
});

// Interactive Problem Chart Highlight
const problemCards = document.querySelectorAll('.problem-card');
problemCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    const series = card.getAttribute('data-series');
    document.querySelectorAll('.problem-graph .highlight').forEach(el => el.classList.remove('highlight'));
    const line = document.getElementById('line-' + series);
    if (line) line.classList.add('highlight');
  });
  card.addEventListener('mouseleave', () => {
    document.querySelectorAll('.problem-graph .highlight').forEach(el => el.classList.remove('highlight'));
  });
  card.addEventListener('focus', () => {
    const series = card.getAttribute('data-series');
    document.querySelectorAll('.problem-graph .highlight').forEach(el => el.classList.remove('highlight'));
    const line = document.getElementById('line-' + series);
    if (line) line.classList.add('highlight');
  });
  card.addEventListener('blur', () => {
    document.querySelectorAll('.problem-graph .highlight').forEach(el => el.classList.remove('highlight'));
  });
});

// Scroll Animation Handler
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementVisible = 150; // Adjust this value to change when the animation triggers

        if (rect.top < windowHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

// Scroll Progress Handler
function updateScrollProgress() {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / windowHeight) * 100;
    document.querySelector('.scroll-progress-bar').style.height = `${progress}%`;
}

// Smooth Scroll Handler
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Indicator Handler
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelector('#problem').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// Initialize
window.addEventListener('scroll', () => {
    handleScrollAnimations();
    updateScrollProgress();
});

// Initial check for elements in view
handleScrollAnimations();
updateScrollProgress();

// Add hover effects to cards and interactive elements
document.querySelectorAll('.problem-card, .role-card, .solution-point').forEach(card => {
    card.classList.add('hover-lift', 'hover-glow');
});

// Optional: Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
});