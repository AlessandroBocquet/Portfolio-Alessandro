document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const btn = document.querySelector('.btn');
    const menu = document.getElementById('menu');
    const menuLinks = document.querySelectorAll('#menu a[href^="#"]');

    // Create navigation cursor
    function createNavCursor() {
        const navLinksContainer = document.querySelector('.nav-links');
        if (navLinksContainer && !document.querySelector('.nav-cursor')) {
            const cursor = document.createElement('div');
            cursor.classList.add('nav-cursor');
            navLinksContainer.appendChild(cursor);
            return cursor;
        }
        return document.querySelector('.nav-cursor');
    }

    // Update cursor position
    function updateCursorPosition(activeLink) {
        const cursor = document.querySelector('.nav-cursor');
        const navLinksContainer = document.querySelector('.nav-links');
        
        if (cursor && activeLink && navLinksContainer) {
            const containerRect = navLinksContainer.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            const leftPosition = linkRect.left - containerRect.left;
            
            cursor.style.left = `${leftPosition}px`;
        }
    }

    // Make updateCursorPosition globally accessible for translations
    window.updateCursorPosition = updateCursorPosition;

    // Navigation smooth scrolling and active state management
    if (menuLinks.length > 0) {
        // Create cursor after translations are loaded
        setTimeout(() => {
            createNavCursor();
        }, 100);

        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Remove active class from all links
                    menuLinks.forEach(l => l.classList.remove('active'));
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Update cursor position
                    updateCursorPosition(this);
                    
                    // NO WHITE BACKGROUND ON ENTIRE NAVBAR - REMOVED
                    // Only the individual link gets styled via CSS
                    
                    // Smooth scroll to section
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Improved Intersection Observer for bidirectional scrolling
        const sections = document.querySelectorAll('#about, #work, #contact');
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
        };

        const observer = new IntersectionObserver((entries) => {
            // Find the section with the highest intersection ratio
            let mostVisibleSection = null;
            let highestRatio = 0;
            
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
                    highestRatio = entry.intersectionRatio;
                    mostVisibleSection = entry.target;
                }
            });
            
            // Only proceed if we have a clearly visible section
            if (mostVisibleSection && highestRatio > 0.25) {
                const targetId = `#${mostVisibleSection.id}`;
                const correspondingLink = document.querySelector(`#menu a[href="${targetId}"]`);
                const currentlyActive = document.querySelector('#menu a.active');
                
                // Only update if this is different from current active
                if (correspondingLink && correspondingLink !== currentlyActive) {
                    // ENSURE ONLY ONE ACTIVE - Remove active from ALL links first
                    menuLinks.forEach(link => link.classList.remove('active'));
                    // Add active to the most visible section's link
                    correspondingLink.classList.add('active');
                    // Update cursor position
                    updateCursorPosition(correspondingLink);
                }
            }
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

        // Additional scroll listener for better section detection
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPosition = window.scrollY + window.innerHeight / 3;
                let currentSection = null;
                let bestMatch = null;
                let smallestDistance = Infinity;
                
                // Find the section closest to our detection point
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionMiddle = sectionTop + (section.offsetHeight / 2);
                    const distance = Math.abs(scrollPosition - sectionMiddle);
                    
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        bestMatch = section;
                    }
                    
                    // Also check if we're clearly inside a section
                    const sectionBottom = sectionTop + section.offsetHeight;
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        currentSection = section;
                    }
                });
                
                // Use the section we're inside, or the closest one
                const targetSection = currentSection || bestMatch;
                
                if (targetSection) {
                    const targetId = `#${targetSection.id}`;
                    const correspondingLink = document.querySelector(`#menu a[href="${targetId}"]`);
                    const currentlyActive = document.querySelector('#menu a.active');
                    
                    // Only update if this is different from current active
                    if (correspondingLink && correspondingLink !== currentlyActive) {
                        // CRITICAL: Remove ALL active classes to prevent multiple active states
                        menuLinks.forEach(link => link.classList.remove('active'));
                        correspondingLink.classList.add('active');
                        // Update cursor position
                        updateCursorPosition(correspondingLink);
                    }
                }
            }, 100); // Slightly longer delay to prevent conflicts with observer
        });

        // Initialize first active section based on URL hash or default to about
        setTimeout(() => {
            // Check if there's a hash in the URL
            const hash = window.location.hash;
            let targetSection = null;
            let targetLink = null;

            if (hash && hash.length > 1) {
                // Try to find the section based on the hash
                targetSection = document.querySelector(hash);
                if (targetSection) {
                    targetLink = document.querySelector(`#menu a[href="${hash}"]`);
                }
            }

            // If no valid hash section found, default to about
            if (!targetSection || !targetLink) {
                targetSection = document.querySelector('#about');
                targetLink = document.querySelector('#menu a[href="#about"]');
            }

            if (targetLink) {
                // Remove active from all links first
                menuLinks.forEach(link => link.classList.remove('active'));
                // Set the appropriate link as active
                targetLink.classList.add('active');
                // Initialize cursor position
                updateCursorPosition(targetLink);
                
                // Scroll to the target section if it exists
                if (targetSection && hash) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }, 200);

        // Update cursor position on resize
        window.addEventListener('resize', () => {
            const activeLink = document.querySelector('#menu a.active');
            if (activeLink) {
                updateCursorPosition(activeLink);
            }
        });

        // Handle hash changes (browser back/forward, direct hash navigation)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash && hash.length > 1) {
                const targetSection = document.querySelector(hash);
                const targetLink = document.querySelector(`#menu a[href="${hash}"]`);
                
                if (targetSection && targetLink) {
                    // Remove active from all links
                    menuLinks.forEach(link => link.classList.remove('active'));
                    // Set new active link
                    targetLink.classList.add('active');
                    // Update cursor position
                    updateCursorPosition(targetLink);
                }
            }
        });
    }

    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    if (dropbtn) {
        dropbtn.addEventListener('click', function() {
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });
    }

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            if (dropdownContent) dropdownContent.style.display = 'none';
        }
    });

    if (btn) {
        btn.addEventListener('mousemove', function(e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });

        btn.addEventListener('mouseleave', function() {
            btn.style.setProperty('--x', '50%');
            btn.style.setProperty('--y', '50%');
        });
    }

    // Bubble Animation System
    const bubbles = document.querySelectorAll('.bulles');
    if (bubbles.length > 0) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let isMouseMoving = false;
        let mouseTimeout;

        // Bubble Configuration
        const bubbleConfigs = [
            { element: bubbles[0], offsetX: -80, offsetY: -40, speed: 0.05, delay: 0 },
            { element: bubbles[1], offsetX: 20, offsetY: 30, speed: 0.04, delay: 100 },
            { element: bubbles[2], offsetX: 60, offsetY: -20, speed: 0.03, delay: 200 }
        ];

        // Initialize bubbles at center of screen
        bubbleConfigs.forEach(config => {
            if (config.element) {
                const bubbleWidth = config.element.offsetWidth || 200;
                const bubbleHeight = config.element.offsetHeight || 200;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                config.element.style.transform = `translate(${centerX - bubbleWidth / 2 + config.offsetX}px, ${centerY - bubbleHeight / 2 + config.offsetY}px)`;
            }
        });

        // Track mouse movement
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMouseMoving = true;

            // Clear the timeout and reset it
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                isMouseMoving = false;
            }, 150); // Consider mouse stopped after 150ms of no movement
        });

        // Smooth animation loop
        function animateBubbles() {
            bubbleConfigs.forEach((config, index) => {
                const bubble = config.element;
                if (!bubble) return;

                // Get bubble dimensions
                const bubbleWidth = bubble.offsetWidth || 200;
                const bubbleHeight = bubble.offsetHeight || 200;

                // Calculate target position with offset, constrained to viewport
                let targetX = mouseX + config.offsetX;
                let targetY = mouseY + config.offsetY;

                // Constrain to viewport boundaries
                targetX = Math.max(bubbleWidth / 2, Math.min(window.innerWidth - bubbleWidth / 2, targetX));
                targetY = Math.max(bubbleHeight / 2, Math.min(window.innerHeight - bubbleHeight / 2, targetY));

                // Get current position from transform
                const currentTransform = bubble.style.transform;
                let currentX = targetX; // Start at target position
                let currentY = targetY;

                if (currentTransform && currentTransform.includes('translate')) {
                    const matches = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                    if (matches) {
                        // Add back the center offset to get actual position
                        currentX = parseFloat(matches[1]) + bubbleWidth / 2;
                        currentY = parseFloat(matches[2]) + bubbleHeight / 2;
                    }
                }

                // Adjust speed based on whether mouse is moving
                let effectiveSpeed = config.speed;
                if (!isMouseMoving) {
                    effectiveSpeed *= 0.3; // Slower settling when mouse stops
                }

                // Smooth interpolation
                const newX = currentX + (targetX - currentX) * effectiveSpeed;
                const newY = currentY + (targetY - currentY) * effectiveSpeed;

                // Apply transform with center adjustment (subtract half width/height to center)
                bubble.style.transform = `translate(${newX - bubbleWidth / 2}px, ${newY - bubbleHeight / 2}px)`;
            });

            requestAnimationFrame(animateBubbles);
        }

        // Start animation
        setTimeout(() => {
            animateBubbles();
        }, 100);
    }

    // Dropdown Hover
    const dropdown = document.querySelector('.dropdown');
    let timeout;

    if (dropdown) {
        dropdown.addEventListener('mouseover', () => {
            clearTimeout(timeout);
            if (dropdownContent) {
                dropdownContent.style.display = 'block';
                dropdownContent.style.opacity = '1';
                dropdownContent.style.visibility = 'visible';
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                if (dropdownContent) {
                    dropdownContent.style.display = 'none';
                    dropdownContent.style.opacity = '0';
                    dropdownContent.style.visibility = 'hidden';
                }
            }, 300);
        });
    }
});

// Current Year Update
document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('current-year');
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;

    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');
    let timeout;

    dropdown.addEventListener('mouseover', () => {
        clearTimeout(timeout);
        dropdownContent.style.display = 'block';
        dropdownContent.style.opacity = '1';
        dropdownContent.style.visibility = 'visible';
    });

    dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
            dropdownContent.style.display = 'none';
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
        }, 300); 
    });
});

// Dropdown Toggle
function toggleDropdown() {
  var dropdownContent = document.getElementById("dropdown-content");
  dropdownContent.classList.toggle("show");
}

// Close Dropdown on Outside Click
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
