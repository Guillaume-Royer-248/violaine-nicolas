/**
 * Génère automatiquement les galeries dans le HTML
 */

/**
 * Génère automatiquement les galeries dans le HTML
 *
 * Optimisation : au lieu de créer les 589 <img> d'un coup au chargement
 * de la page, on ne construit une galerie que lorsqu'elle approche de
 * l'écran (IntersectionObserver), et on l'affiche par lots de
 * BATCH_SIZE images avec un bouton "Voir plus" pour révéler la suite.
 */

const BATCH_SIZE = 24;
const galleryState = {}; // { galleryName: { rendered: 0 } }

function initGalleries() {
  const containers = document.querySelectorAll(".thumbs");

  const sectionObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const container = entry.target;
        const galleryName = container.dataset.gallery;

        loadMoreImages(container, galleryName);
        obs.unobserve(container);
      });
    },
    { rootMargin: "400px 0px" } // commence à charger un peu avant que ça arrive à l'écran
  );

  containers.forEach(container => {
    if (!GALLERIES[container.dataset.gallery]) return;
    sectionObserver.observe(container);
  });
}

/**
 * Ajoute le prochain lot d'images dans une galerie donnée,
 * et met à jour le bouton "Voir plus" en conséquence.
 */
function loadMoreImages(container, galleryName) {
  const images = GALLERIES[galleryName];
  if (!images || !images.length) return;

  if (!galleryState[galleryName]) {
    galleryState[galleryName] = { rendered: 0 };
  }
  const state = galleryState[galleryName];

  const nextBatch = images.slice(state.rendered, state.rendered + BATCH_SIZE);
  const loadMoreBtn = container.querySelector(".load-more-btn");

  nextBatch.forEach((src, i) => {
    const index = state.rendered + i;
    const img = document.createElement("img");

    // effet de flou pendant le chargement
    img.style.filter = "blur(6px)";

    // miniature légère pour la grille — la version plein format
    // n'est chargée que si on ouvre la lightbox (voir openLightbox)
    img.src = getThumbUrl(src);
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

    container.insertBefore(img, loadMoreBtn || null);
  });

  state.rendered += nextBatch.length;

  updateLoadMoreButton(container, galleryName, images.length, state.rendered);
}

/**
 * Crée, met à jour, ou retire le bouton "Voir plus" d'une galerie
 * selon le nombre d'images déjà affichées.
 */
function updateLoadMoreButton(container, galleryName, total, rendered) {
  let btn = container.querySelector(".load-more-btn");

  if (rendered >= total) {
    if (btn) btn.remove();
    return;
  }

  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "load-more-btn";
    btn.addEventListener("click", () => loadMoreImages(container, galleryName));
    container.appendChild(btn);
  }

  btn.textContent = `Voir plus (${total - rendered} restantes)`;
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