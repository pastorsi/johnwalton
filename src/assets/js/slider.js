document.addEventListener("DOMContentLoaded", function () {
    const sliders = document.querySelectorAll(".slider-container");
  
    const observerOptions = {
      root: null,
      threshold: 0.5, // Trigger when 50% of the element is visible
    };
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const overlayImage = entry.target.querySelector(".slider-overlay img");
          overlayImage.style.transform = "scale(1)"; // Expand to full size
          observer.unobserve(entry.target); // Stop observing after animation
        }
      });
    }, observerOptions);
  
    sliders.forEach(slider => {
      observer.observe(slider);
    });
  });
  