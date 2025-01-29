document.addEventListener("DOMContentLoaded", function () {
    const sliders = document.querySelectorAll(".slider-container");

    sliders.forEach(slider => {
        const overlay = slider.querySelector(".slider-overlay");
        const handle = slider.querySelector(".slider-handle");

        let position = 100; // Start fully covering the after image
        let direction = -1; // Moving left initially
        const speed = 0.5; // Slower speed (smaller values = slower movement)
        const intervalTime = 40; // Adjust for smoothness

        function animateSlider() {
            position += speed * direction;

            // Stop at 0% (fully reveals after image)
            if (position <= 0) {
                position = 0;
                direction = 1; // Change direction to expand again
                setTimeout(() => requestAnimationFrame(animateSlider), 2000); // 2s pause before expanding
                return;
            }

            // Stop at 100% (fully covers after image)
            if (position >= 100) {
                position = 100;
                direction = -1; // Change direction to contract again
                setTimeout(() => requestAnimationFrame(animateSlider), 2000); // 2s pause before contracting
                return;
            }

            overlay.style.width = position + "%";
            handle.style.left = position + "%";

            setTimeout(() => requestAnimationFrame(animateSlider), intervalTime); // Slows down animation
        }

        animateSlider(); // Start animation
    });
});
