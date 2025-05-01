// HEY!

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
    calculateWasteArea();

    // Set owner card in default state without hover animations
    const ownerCard = document.querySelector('.problem-card[data-series="owner"]');
    if (ownerCard) {
        // Show owner tooltip by default without animation
        const ownerTooltip = ownerCard.querySelector('.tooltip');
        if (ownerTooltip) {
            ownerTooltip.style.opacity = '1';
            ownerTooltip.style.visibility = 'visible';
            ownerTooltip.style.transition = 'none';
            ownerTooltip.style.transform = 'none';
            ownerTooltip.style.animation = 'none';
        }
        
        // Show owner icon without animation
        const ownerIcon = ownerCard.querySelector('.card-icon');
        if (ownerIcon) {
            ownerIcon.style.transform = 'none';
            ownerIcon.style.transition = 'none';
            ownerIcon.style.animation = 'none';
        }

        // Add hover class to card to maintain hover state
        ownerCard.classList.add('hover');
        
        // Set owner highlights without animation
        highlightElements('owner', true);
    }

    // Add event listeners for problem cards
    problemCards.forEach(card => {
        const series = card.getAttribute('data-series');
        
        card.addEventListener('mouseenter', () => {
            // Remove hover class from owner card if it's not the one being hovered
            if (series !== 'owner') {
                ownerCard.classList.remove('hover');
            }

            // Hide all tooltips first
            problemCards.forEach(c => {
                const tooltip = c.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });
            
            // Show current card's tooltip
            const tooltip = card.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            }
            
            // Clear all highlights first
            ['owner', 'indirect', 'materialwages', 'inflation'].forEach(s => {
                highlightElements(s, false);
            });
            
            // Apply new highlight
            highlightElements(series, true);
        });

        card.addEventListener('mouseleave', () => {
            // Hide current card's tooltip
            const tooltip = card.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            }
            
            // Clear all highlights
            ['owner', 'indirect', 'materialwages', 'inflation'].forEach(s => {
                highlightElements(s, false);
            });
            
            // Show owner state without animation
            const ownerTooltip = ownerCard.querySelector('.tooltip');
            if (ownerTooltip) {
                ownerTooltip.style.opacity = '1';
                ownerTooltip.style.visibility = 'visible';
                ownerTooltip.style.transition = 'none';
                ownerTooltip.style.transform = 'none';
                ownerTooltip.style.animation = 'none';
            }
            
            const ownerIcon = ownerCard.querySelector('.card-icon');
            if (ownerIcon) {
                ownerIcon.style.transform = 'none';
                ownerIcon.style.transition = 'none';
                ownerIcon.style.animation = 'none';
            }

            // Re-add hover class to owner card
            ownerCard.classList.add('hover');
            
            highlightElements('owner', true);
        });
    });

    // Open modal on card click
    document.querySelectorAll('.problem-modal-card').forEach(card => {
        card.addEventListener('click', function() {
            closeAllProblemModals();
            const modalId = card.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('active');
        });
    });

    // Close modal on close button or overlay click
    document.querySelectorAll('.problem-modal-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const closeId = btn.getAttribute('data-close');
            const modal = document.getElementById(closeId);
            if (modal) modal.classList.remove('active');
            e.stopPropagation();
        });
    });

    document.querySelectorAll('.problem-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    // Modal navigation (Next/Previous)
    document.querySelectorAll('.modal-nav button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const target = btn.getAttribute('data-nav');
            if (target) {
                // Close all modals
                closeAllProblemModals();
                // Open the target modal
                const modal = document.getElementById(target);
                if (modal) modal.classList.add('active');
            }
        });
    });

    // Animate sections on scroll
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.15 // Animate when 15% of the section is visible
    });

    document.querySelectorAll('.scroll-animation').forEach(section => {
        observer.observe(section);
    });

    // Deming Quote Rotation
    const demingQuotes = [
        "94% of problems in business are systems-driven and only 6% are people-driven.",
        "A system is a network of interdependent components, all working together to help accomplish the aim of the system",
        "Put a good person in a bad system and the bad system wins, no contest.",
        "Best efforts will not substitute for knowledge.",
        "Blame the system, not the people. Most people are trying to do a good job.",
        "You do not install quality; you begin to work on the causes of quality."
    ];
    
    let currentQuote = 1; // Start with second quote since first is hardcoded
    const quoteSpan = document.getElementById('deming-quote-text');
    
    if (quoteSpan) {
        console.log("Quote span found");
        
        function fadeOut() {
            quoteSpan.style.opacity = '0';
            setTimeout(changeQuote, 800); // Wait for fade out
        }
        
        function changeQuote() {
            quoteSpan.textContent = '"' + demingQuotes[currentQuote] + '"'; // Add quotation marks
            currentQuote = (currentQuote + 1) % demingQuotes.length;
            quoteSpan.style.opacity = '1'; // Fade in
        }
        
        // First rotation after 15 seconds to give time to read first quote
        setTimeout(() => {
            console.log("Starting quote rotation");
            // Add CSS transition if not already present
            quoteSpan.style.transition = 'opacity 0.8s ease-in-out';
            fadeOut(); 
            // Start regular interval after first change
            setTimeout(() => {
                setInterval(fadeOut, 7000);
            }, 7000);
        }, 8000);
    }
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
const problemLines = document.querySelectorAll('.problem-graph svg path[id^="line-"]');
const endpointCircles = document.querySelectorAll('.problem-graph svg .endpoint-marker');
const endpointTexts = document.querySelectorAll('.problem-graph svg .endpoint-text');
const problemGraphSVG = document.querySelector('.problem-graph svg');
const interactiveLayout = document.querySelector('.problem-interactive-layout'); // Get the parent layout
const indirectWasteArea = document.getElementById('indirect-waste-area'); // Get the waste area element
const ownerInflationArea = document.getElementById('owner-inflation-area'); // Get the owner inflation area element

function highlightElements(series, highlight) {
    // Highlight lines
    problemLines.forEach(line => {
        if (line.id === `line-${series}` || 
            (highlight && (series === 'indirect' || series === 'owner') && line.id === 'line-inflation')) {
            line.classList.toggle('highlight', highlight);
            line.style.opacity = highlight ? '1' : '0.3';
        } else {
            line.style.opacity = highlight ? '0.3' : '1';
        }
    });

    // Highlight corresponding circle and text
    const circle = document.getElementById(`circle-${series}`);
    const text = document.getElementById(`text-${series}`);
    if (circle) circle.classList.toggle('visible', highlight);
    if (text) text.classList.toggle('visible', highlight);

    // For indirect series, also show inflation circle and text
    if (series === 'indirect') {
        const inflationCircle = document.getElementById('circle-inflation');
        const inflationText = document.getElementById('text-inflation');
        if (inflationCircle) inflationCircle.classList.toggle('visible', highlight);
        if (inflationText) inflationText.classList.toggle('visible', highlight);
    }

    // For owner series, also show inflation circle and text
    if (series === 'owner') {
        const inflationCircle = document.getElementById('circle-inflation');
        const inflationText = document.getElementById('text-inflation');
        if (inflationCircle) inflationCircle.classList.toggle('visible', highlight);
        if (inflationText) inflationText.classList.toggle('visible', highlight);
    }

    // Handle waste explanation visibility
    const wasteExplanation = document.getElementById('waste-explanation');
    if (wasteExplanation) {
        wasteExplanation.style.opacity = highlight ? '0' : '1';
    }

    // Handle indirect waste area
    if (interactiveLayout && series === 'indirect') {
        interactiveLayout.classList.toggle('show-indirect-waste', highlight);
    }

    // Handle owner inflation area
    if (interactiveLayout && series === 'owner') {
        interactiveLayout.classList.toggle('show-owner-inflation', highlight);
    }

    // Adjust overall SVG opacity if highlighting
    if (problemGraphSVG) {
        problemGraphSVG.style.opacity = highlight ? '1' : '1'; // Keep full opacity
    }
}

function handleLineHover(lineId) {
    // Show the corresponding circle and text
    const circleId = lineId.replace('line', 'circle');
    const textId = lineId.replace('line', 'text');
    
    document.getElementById(circleId).classList.add('visible');
    document.getElementById(textId).classList.add('visible');
    
    // Dim other lines
    const allLines = document.querySelectorAll('.data-line');
    allLines.forEach(line => {
        if (line.id !== lineId) {
            line.style.opacity = '0.2';
        }
    });
}

function handleLineLeave(lineId) {
    // Hide the corresponding circle and text
    const circleId = lineId.replace('line', 'circle');
    const textId = lineId.replace('line', 'text');
    
    document.getElementById(circleId).classList.remove('visible');
    document.getElementById(textId).classList.remove('visible');
    
    // Restore other lines
    const allLines = document.querySelectorAll('.data-line');
    allLines.forEach(line => {
        line.style.opacity = '1';
    });
}

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

function calculateWasteArea() {
    const wasteArea = document.querySelector('#waste-area');
    if (!wasteArea) {
        console.error('Waste area element not found');
        return;
    }

    // Set the fill color to transparent
    wasteArea.setAttribute('fill', 'rgba(231, 76, 60, 0)');
    // Force the color using style as well to ensure it overrides any existing styles
    wasteArea.style.fill = 'rgba(231, 76, 60, 0)';
    wasteArea.style.opacity = '0';
    
    // Make sure the waste area is rendered below the lines
    const svg = wasteArea.closest('svg');
    if (svg) {
        // Move the waste-area element before the lines in the SVG
        // This ensures it's rendered behind the lines
        const ownerLine = document.querySelector('#line-owner');
        if (ownerLine && ownerLine.parentNode) {
            ownerLine.parentNode.insertBefore(wasteArea, ownerLine);
        }
    }
}

// Ensure the function is called after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the timeline slider
    initSimpleSlider();
    
    // Calculate waste area with a small delay to ensure SVG is loaded
    setTimeout(calculateWasteArea, 100);
});

// Problem Modal Popup Logic
function closeAllProblemModals() {
    document.querySelectorAll('.problem-modal-overlay').forEach(m => m.classList.remove('active'));
}