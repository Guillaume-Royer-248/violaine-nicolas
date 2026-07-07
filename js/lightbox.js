const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

const btnClose = lightbox.querySelector(".close");
const btnNext = document.getElementById("next");
const btnPrev = document.getElementById("prev");

/**
 * Fermer la lightbox
 */
function closeLightbox() {
  lightbox.classList.add("hidden");
  lightboxImg.src = "";
  currentGallery = [];
  currentIndex = 0;
}

/**
 * Événements boutons
 */
btnClose.addEventListener("click", closeLightbox);
btnNext.addEventListener("click", nextImage);
btnPrev.addEventListener("click", prevImage);

/**
 * Navigation clavier
 */
document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;

  switch (e.key) {
    case "Escape":
      closeLightbox();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "ArrowLeft":
      prevImage();
      break;
  }
});

/**
 * Swipe mobile (basique mais efficace)
 */
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;

  handleSwipe();
});

function handleSwipe() {
  const diff = touchStartX - touchEndX;

  // swipe gauche → image suivante
  if (diff > 50) nextImage();

  // swipe droite → image précédente
  if (diff < -50) prevImage();
}

/**
 * Empêcher clic image de fermer
 */
lightboxImg.addEventListener("click", (e) => {
  e.stopPropagation();
});

/**
 * Fermer si clic sur fond noir
 */
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});