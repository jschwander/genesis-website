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
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        });
    });

    // Close modal on close button or overlay click
    document.querySelectorAll('.problem-modal-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const closeId = btn.getAttribute('data-close');
            const modal = document.getElementById(closeId);
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.problem-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
            }
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
        "What we need to do is learn to work in the system, by which I mean that everybody, every team, every platform, every division, every component is there not for individual competitive profit or recognition, but for contribution to the system as a whole on a win-win basis.",
        "A system is a network of interdependent components that work together to try to accomplish the aim of the system. A system must have an aim. Without the aim, there is no system.",
        "A change in philosophy requires unlearning industrial thinking evident in departmentalization, scarcity of knowledge and information competitiveness.",
        "Lack of knowledge…that is the problem.",
        "Information is not knowledge. Let's not confuse the two.",
        "The world is drowning in information but is slow in acquisition of knowledge. There is no substitute for knowledge.",
        "Scientific data are not taken for museum purposes; they are taken as a basis for doing something. If nothing is to be done with the data, then there is no use in collecting any. The ultimate purpose of taking data is to provide a basis for action or a recommendation for action. The step intermediate between the collection of data and the action is prediction.",
        "In God we trust. All others bring data.",
        "A bad system will beat a good person every time.",
        "Understanding variation is the key to success in quality and business.",
        "Customer expectations? Nonsense. No customer ever asked for the electric light, the pneumatic tire, the VCR, or the CD. All customer expectations are only what you and your competitor have led him to expect. He knows nothing else.",
        "Two basic rules of life are: 1) Change is inevitable. 2) Everybody resists change.",
        "Long-term commitment to new learning and new philosophy is required of any management that seeks transformation. The timid and the fainthearted, and the people that expect quick results, are doomed to disappointment.",
        "The ultimate purpose of collecting the data is to provide a basis for action or a recommendation.",
        "Management is prediction.",
        "We are here to learn, to make a difference and to have fun.",
        "It is not necessary to change. Survival is not mandatory.",
        "Nobody should try to use data unless he has collected data.",
        "Innovation comes from the producer - not from the customer.",
        "My mother was my biggest role model. She taught me to hate waste. We never wasted anything.",
        "Almost any system of management will do well in a seller's market.",
        "American management thinks that they can just copy from Japan. But they don't know what to copy.",
        "The result of long-term relationships is better and better quality, and lower and lower costs.",
        "The prevailing system of management has crushed fun out of the workplace.",
        "I am forever learning and changing.",
        "Improve quality, you automatically improve productivity.",
        "Manage the cause, not the result.",
        "Innovation comes from people who take joy in their work.",
        "People work in the system. Management creates the system.",
        "We should work on our process, not the outcome of our processes.",
        "The most valuable 'currency' of any organization is the initiative and creativity of its members. Every leader has the solemn moral responsibility to develop these to the maximum in all his people. This is the leader's highest priority.",
        "Uncontrolled variation is the enemy of quality.",
        "Transformation is not automatic. It must be learned; it must be led.",
        "Our prevailing system of management has destroyed our people. People are born with intrinsic motivation, self-respect, dignity, curiosity to learn, joy in learning.",
        "You must not run your Organization as a functional hierarchy. You must understand it as a System.",
        "The customer is the most important part of the production line.",
        "When we cooperate, everybody wins.",
        "To optimize the whole, we must sub-optimize the parts",
        "Management's job is to optimize the whole system.",
        "A goal without a method is nonsense.",
        "A leader is a coach, not a judge.",
        "Quality starts in the boardroom.",
        "Most American executives think they are in the business to make money, rather than products or service. The Japanese corporate credo, on the other hand, is that a company should become the world's most efficient provider of whatever product and service it offers. Once it becomes the world leader and continues to offer good products, profits follow.",
        "The source of innovation is freedom. All we have - new knowledge, invention - comes from freedom. Discoveries and new knowledge come from freedom. When somebody is responsible only to himself, [has] only himself to satisfy, then you'll have invention, new thought, now product, new design, new ideas.",
        "The transformation will come from leadership.",
        "We are here to make another world.",
        "It is management's job to direct the efforts of all components toward the aim of the system. The first step is clarification: everyone in the organization must understand the aim of the system, and how to direct his efforts toward it.",
        "Everyone must understand the damage and loss to the whole organization from a team that seeks to become a selfish, independent, profit center.",
        "Sub-optimization is when everyone is for himself. Optimization is when everyone is working to help the company.",
        "Anyone that enjoys his work is a pleasure to work with.",
        "He that would run his company on visible figures alone will in time have neither company nor figures."
    ];
    
    let currentQuote = 0; // Start with the first quote
    const quoteSpan = document.getElementById('deming-quote-text');
    let quoteInterval;
    let quoteTimeout;
    let isTransitioning = false;
    
    if (quoteSpan) {
        const prevButton = document.querySelector('.quote-prev');
        const nextButton = document.querySelector('.quote-next');
        
        // Set initial quote immediately
        quoteSpan.textContent = `"${demingQuotes[0]}"`;
        
        function changeQuote(direction = 'next') {
            if (isTransitioning) return; // Prevent rapid-fire clicks
            isTransitioning = true;
            
            // Add immediate visual feedback
            if (direction === 'next') {
                nextButton.style.transform = 'scale(0.95)';
                setTimeout(() => nextButton.style.transform = '', 150);
            } else {
                prevButton.style.transform = 'scale(0.95)';
                setTimeout(() => prevButton.style.transform = '', 150);
            }
            
            quoteSpan.style.opacity = '0';
            quoteSpan.style.transform = direction === 'next' ? 'translateX(-10px)' : 'translateX(10px)';
            
            // Update current quote index
            if (direction === 'next') {
                currentQuote = (currentQuote + 1) % demingQuotes.length;
            } else {
                currentQuote = (currentQuote - 1 + demingQuotes.length) % demingQuotes.length;
            }
            
            // Update quote text with transition
            setTimeout(() => {
                quoteSpan.textContent = `"${demingQuotes[currentQuote]}"`;
                quoteSpan.style.transform = direction === 'next' ? 'translateX(10px)' : 'translateX(-10px)';
                
                requestAnimationFrame(() => {
                    quoteSpan.style.opacity = '1';
                    quoteSpan.style.transform = 'translateX(0)';
                    isTransitioning = false;
                });
            }, 200);
        }
        
        // Event listeners for navigation buttons
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                stopAutoRotation();
                changeQuote('prev');
                startAutoRotation(); // Restart auto-rotation after manual navigation
            });
            
            nextButton.addEventListener('click', () => {
                stopAutoRotation();
                changeQuote('next');
                startAutoRotation(); // Restart auto-rotation after manual navigation
            });
        }
        
        function startAutoRotation() {
            stopAutoRotation();
            quoteInterval = setInterval(() => changeQuote('next'), 8000); // Increased interval to 8 seconds
        }
        
        function stopAutoRotation() {
            if (quoteInterval) clearInterval(quoteInterval);
            if (quoteTimeout) clearTimeout(quoteTimeout);
        }
        
        // Start auto-rotation after a delay
        setTimeout(startAutoRotation, 1000);
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
    document.querySelectorAll('.problem-modal-overlay').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
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

// Function to toggle paid steps visibility in owner/developer modal
function togglePaidSteps() {
    const paidSteps = document.querySelector('.paid-steps');
    const toggleBtn = document.querySelector('.toggle-btn');
    if (paidSteps.classList.contains('active')) {
        paidSteps.classList.remove('active');
        toggleBtn.textContent = 'More...';
    } else {
        paidSteps.classList.add('active');
        toggleBtn.textContent = 'Less...';
    }
}

function togglePaidSteps(event) {
    const modal = event.target.closest('.modal');
    const paidSteps = modal.querySelector('.paid-steps');
    const toggleBtn = event.target;
    
    if (paidSteps.classList.contains('active')) {
        paidSteps.classList.remove('active');
        toggleBtn.textContent = 'More...';
    } else {
        paidSteps.classList.add('active');
        toggleBtn.textContent = 'Less...';
    }
}

// Add click event listeners for all modal links
document.addEventListener('DOMContentLoaded', function() {
    const modalLinks = document.querySelectorAll('.role-card .learn-more');
    
    modalLinks.forEach(link => {
        const roleCard = link.closest('.role-card');
        const role = roleCard.querySelector('h3').textContent.toLowerCase().split(' ')[0];
        const modalId = `${role}-modal`;
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        });
    });

    // Add click event listeners for all toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', togglePaidSteps);
    });

    // Close modal when clicking outside or on close button
    const modals = document.querySelectorAll('.problem-modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('problem-modal-close')) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
});

function toggleExpandableContent(linkElement) {
    const content = linkElement.nextElementSibling;
    if (content.classList.contains('expandable-content')) {
        content.classList.toggle('show');
        linkElement.textContent = content.classList.contains('show') ? 'Less...' : 'More...';
    }
}