document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.item');
    const timelineProgress = document.querySelector('.timeline-progress');
    const timelineDot = document.querySelector('.timeline-dot');
    const timelineContainer = document.querySelector('.timeline-container');

    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.75) &&
            rect.bottom >= (window.innerHeight * 0.25)
        );
    }

    // Function to update timeline progress and dot position
    function updateTimeline() {
        // Calculate scroll progress (0 to 1)
        const containerHeight = timelineContainer.offsetHeight;
        const containerTop = timelineContainer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        
        // How much of the timeline container has been scrolled through
        let progress = 0;
        
        if (containerTop < 0) {
            // Container has started to scroll off the top
            progress = Math.min(1, Math.abs(containerTop) / (containerHeight - windowHeight));
        }
        
        // Set progress line height
        timelineProgress.style.height = `${progress * 100}%`;
        
        // Update dot position
        const dotPosition = Math.max(0, Math.min(progress * containerHeight, containerHeight - 20));
        timelineDot.style.top = `${dotPosition}px`;
        
        // Animate timeline items
        timelineItems.forEach(item => {
            if (isInViewport(item)) {
                item.classList.add('active');
            }
        });
    }

    // Initial update
    updateTimeline();

    // Update on scroll
    window.addEventListener('scroll', updateTimeline);
    window.addEventListener('resize', updateTimeline);
});
