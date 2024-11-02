const carousel = document.querySelector('.carousel');
const items = document.querySelectorAll('.carousel-item');
let currentIndex = 0;

function showNextTestimonial() {
  currentIndex = (currentIndex + 1) % items.length;
  carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
}

setInterval(showNextTestimonial, 8000); // Change every 8 seconds
