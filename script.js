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

    // Get all problem cards
    const problemCards = document.querySelectorAll('.problem-card');
    const indirectCard = document.querySelector('.problem-card[data-series="indirect"]');
    const ownerCard = document.querySelector('.problem-card[data-series="owner"]');

    // Initial highlight for Indirect (default)
    highlightElements('indirect', true);
    
    // Show the tooltip for the initially selected indirect card
    const indirectTooltip = indirectCard.querySelector('.tooltip');
    if (indirectTooltip) {
        indirectTooltip.style.opacity = '1';
        indirectTooltip.style.visibility = 'visible';
    }
    
    // Add click event listeners for problem cards
    problemCards.forEach(card => {
        const series = card.getAttribute('data-series');
        
        card.addEventListener('click', () => {
            // Get the current state of the clicked button
            const isPressed = card.getAttribute('aria-pressed') === 'true';
            
            // Don't allow deselection - if already pressed, do nothing
            if (isPressed) return;
            
            // Reset all cards
            problemCards.forEach(c => {
                c.setAttribute('aria-pressed', 'false');
                const tooltip = c.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });
            
            // Set the clicked card's state
            card.setAttribute('aria-pressed', 'true');
            
            // Show tooltip if present
            const tooltip = card.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            }
            
            // Clear all highlights
            ['owner', 'indirect', 'materialwages', 'inflation'].forEach(s => {
                highlightElements(s, false);
            });
            
            // Apply highlight and show annotation for the selected button
            highlightElements(series, true);
            showAnnotation(series);
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

    // Enhanced scroll-triggered entrance and exit animations
    const animatedSections = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('exit');
            } else {
                entry.target.classList.remove('visible');
                entry.target.classList.add('exit');
            }
        });
    }, {
        threshold: 0.15
    });

    animatedSections.forEach(section => observer.observe(section));

    // Deming Quote Rotation
    const demingQuotes = [
        "94% of problems in business are systems-driven and only 6% are people-driven.",
        "A bad system will beat a good person every time.",
        "It is not necessary to change. Survival is not mandatory.",
        "Learning is not compulsory... neither is survival.",
        "The system that people work in and the interaction with people may account for 90 or 95 percent of performance.",
        "Improve quality, you automatically improve productivity.",
        "Uncontrolled variation is the enemy of quality.",
        "We should work on our process, not the outcome of our processes."
    ];
    
    let currentQuote = 1; // Start with second quote since first is hardcoded
    const quoteSpan = document.getElementById('deming-quote-text');
    
    if (quoteSpan) {
        console.log("Quote span found");
        setInterval(() => {
            quoteSpan.style.opacity = '0';
            setTimeout(changeQuote, 800); // Wait for fade out
        }, 3000); // Changed from 15000 (15 seconds) to 3000 (3 seconds)
        
        function changeQuote() {
            quoteSpan.textContent = '"' + demingQuotes[currentQuote] + '"'; // Add quotation marks
            currentQuote = (currentQuote + 1) % demingQuotes.length;
            quoteSpan.style.opacity = '1'; // Fade in
        }
        
        // First rotation after 3 seconds to give time to read first quote
        setTimeout(() => {
            console.log("Starting quote rotation");
            setInterval(() => {
                quoteSpan.style.opacity = '0';
                setTimeout(changeQuote, 800); // Wait for fade out
            }, 3000); // Changed from 15000 (15 seconds) to 3000 (3 seconds)
            quoteSpan.style.transition = 'opacity 0.8s ease-in-out';
        }, 3000); // Changed from 15000 (15 seconds) to 3000 (3 seconds)
    }

    // --- Annotations and shaded area logic for Indirect and Owner ---
    const indirectAnnotation = document.getElementById('indirect-annotation');
    const ownerAnnotation = document.getElementById('owner-annotation');
    const indirectWasteArea = document.getElementById('indirect-waste-area');
    const ownerInflationArea = document.getElementById('owner-inflation-area');

    function showAnnotation(type) {
        console.log('showAnnotation called with type:', type);
        if (type === 'indirect') {
            if (indirectAnnotation) indirectAnnotation.setAttribute('opacity', '1');
            if (ownerAnnotation) ownerAnnotation.setAttribute('opacity', '0');
            if (indirectWasteArea) indirectWasteArea.setAttribute('opacity', '0.55');
            if (ownerInflationArea) ownerInflationArea.setAttribute('opacity', '0');
        } else if (type === 'materialwages' || type === 'inflation') {
            if (indirectAnnotation) indirectAnnotation.setAttribute('opacity', '0');
            if (ownerAnnotation) ownerAnnotation.setAttribute('opacity', '0');
            if (indirectWasteArea) indirectWasteArea.setAttribute('opacity', '0');
            if (ownerInflationArea) ownerInflationArea.setAttribute('opacity', '0');
        } else if (type === 'owner') {
            if (indirectAnnotation) indirectAnnotation.setAttribute('opacity', '0');
            if (ownerAnnotation) ownerAnnotation.setAttribute('opacity', '1');
            if (indirectWasteArea) indirectWasteArea.setAttribute('opacity', '0');
            if (ownerInflationArea) ownerInflationArea.setAttribute('opacity', '0.55');
        }
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
    
    let currentSlide = 0;
    const containerWidth = sliderContainer.offsetWidth;
    let slideWidth = containerWidth;
    
    // Make slides the same width as the container
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });
    
    // Set the width of the slider track
    sliderTrack.style.width = `${slides.length * slideWidth}px`;
    
    // Create dots
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.classList.add('slider-dot');
        
        if (i === 0) {
            dot.classList.add('active');
        }
        
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    
    // Initialize the slider
    updateSlider();
    
    // Previous and next buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlider();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlider();
        });
    }
    
    // Go to a specific slide
    function goToSlide(index) {
        currentSlide = index;
        updateSlider();
    }
    
    function updateSlider() {
        const translateX = -currentSlide * slideWidth;
        
        sliderTrack.style.transform = `translateX(${translateX}px)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newContainerWidth = sliderContainer.offsetWidth;
        slideWidth = newContainerWidth;
        
        // Update slide widths
        slides.forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
        
        // Update track width
        sliderTrack.style.width = `${slides.length * slideWidth}px`;
        
        // Update slider position
        updateSlider();
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
document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const closeModal = document.querySelector('.close-modal');
    const watchButton = document.querySelector('.btn.primary');

    // Replace this URL with your YouTube video URL
    const videoUrl = 'https://www.youtube.com/embed/tDu47czfwiI';

    if (watchButton) {
        watchButton.addEventListener('click', (e) => {
            e.preventDefault();
            videoFrame.src = videoUrl;
            videoModal.style.display = 'flex';
            setTimeout(() => {
                videoModal.classList.add('show');
            }, 10);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            videoModal.classList.remove('show');
            setTimeout(() => {
                videoModal.style.display = 'none';
                videoFrame.src = '';
            }, 300);
        });
    }

    // Close modal when clicking outside the video
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal.click();
            }
        });
    }

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal?.classList.contains('show')) {
            closeModal.click();
        }
    });
});

// Interactive Problem Chart Highlight
const problemCards = document.querySelectorAll('.problem-card');
const problemLines = document.querySelectorAll('.problem-graph svg path[id^="line-"]');
const endpointCircles = document.querySelectorAll('.problem-graph svg .endpoint-marker');
const endpointTexts = document.querySelectorAll('.problem-graph svg .endpoint-text');
const problemGraphSVG = document.querySelector('.problem-graph svg');
const interactiveLayout = document.querySelector('.problem-interactive-layout'); // Get the parent layout

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
document.addEventListener('DOMContentLoaded', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('#problem')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
});

// Initialize
window.addEventListener('scroll', () => {
    handleScrollAnimations();
    updateScrollProgress();
});

// Initial check for elements in view
document.addEventListener('DOMContentLoaded', () => {
    handleScrollAnimations();
    updateScrollProgress();
    
    // Add hover effects to cards and interactive elements
    document.querySelectorAll('.problem-card, .role-card, .solution-point').forEach(card => {
        card.classList.add('hover-lift', 'hover-glow');
    });
});

// Optional: Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    }
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

// Problem Modal Popup Logic
function closeAllProblemModals() {
    document.querySelectorAll('.problem-modal-overlay').forEach(m => m.classList.remove('active'));
}

// Owner/Developer Modal
document.addEventListener('DOMContentLoaded', function() {
    // Get the Owner/Developer learn more link using the ID for more reliable targeting
    const ownerDeveloperLink = document.getElementById('owner-developer-link');
    const ownerDeveloperModal = document.getElementById('owner-developer-modal');
    
    if (ownerDeveloperLink && ownerDeveloperModal) {
        console.log('Owner/Developer link and modal found');
        
        // Add event listener to open modal when clicking learn more
        ownerDeveloperLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Owner/Developer link clicked');
            closeAllProblemModals();
            ownerDeveloperModal.classList.add('active');
        });
        
        // Close modal when clicking the close button
        const closeButton = ownerDeveloperModal.querySelector('.problem-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                ownerDeveloperModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside of it
        ownerDeveloperModal.addEventListener('click', function(e) {
            if (e.target === ownerDeveloperModal) {
                ownerDeveloperModal.classList.remove('active');
            }
        });
        
        // Contact Us button functionality
        const contactUsBtn = ownerDeveloperModal.querySelector('.contact-us-btn');
        if (contactUsBtn) {
            contactUsBtn.addEventListener('click', function() {
                // Close the modal
                ownerDeveloperModal.classList.remove('active');
                
                // Scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    } else {
        console.error('Owner/Developer link or modal not found', { 
            linkExists: !!ownerDeveloperLink, 
            modalExists: !!ownerDeveloperModal 
        });
    }
});