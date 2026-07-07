/**
 * Génère automatiquement les galeries dans le HTML
 */

function initGalleries() {
    const containers = document.querySelectorAll(".thumbs");

    containers.forEach(container => {
      const galleryName = container.dataset.gallery;

      if (!GALLERIES[galleryName]) return;

      const images = GALLERIES[galleryName];

      images.forEach((src, index) => {
        const img = document.createElement("img");

        // effet de flou pendant le chargement
        img.style.filter = "blur(6px)";

        img.src = src;
        img.alt = galleryName + " " + (index + 1);
        img.loading = "lazy";

        // suppression du flou une fois l'image chargée
        img.addEventListener("load", () => {
          img.style.filter = "blur(0px)";
        });

        // ouverture lightbox au clic
        img.addEventListener("click", () => {
          openLightbox(galleryName, index);
        });

        container.appendChild(img);
      });
    });
  }

  /**
   * Stockage global de la galerie courante
   */
  let currentGallery = [];
  let currentIndex = 0;

  /**
   * Ouvre une image en plein écran
   */
  function openLightbox(galleryName, index) {
    currentGallery = GALLERIES[galleryName];
    currentIndex = index;

    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");

    img.src = currentGallery[currentIndex];
    lightbox.classList.remove("hidden");

    preloadNeighbors();
  }

  /**
   * Image suivante
   */
  function nextImage() {
    if (!currentGallery.length) return;

    currentIndex = (currentIndex + 1) % currentGallery.length;
    document.getElementById("lightbox-img").src =
      currentGallery[currentIndex];

    preloadNeighbors();
  }

  /**
   * Image précédente
   */
  function prevImage() {
    if (!currentGallery.length) return;

    currentIndex =
      (currentIndex - 1 + currentGallery.length) % currentGallery.length;

    document.getElementById("lightbox-img").src =
      currentGallery[currentIndex];

    preloadNeighbors();
  }

  /**
   * Précharge la photo suivante et précédente dans la lightbox
   * pour une navigation plus fluide (clavier/flèches/swipe)
   */
  function preloadNeighbors() {
    if (!currentGallery.length) return;

    const nextIdx = (currentIndex + 1) % currentGallery.length;
    const prevIdx = (currentIndex - 1 + currentGallery.length) % currentGallery.length;

    preloadImage(currentGallery[nextIdx]);
    preloadImage(currentGallery[prevIdx]);
  }

  function preloadImage(src) {
    const img = new Image();
    img.src = src;
  }