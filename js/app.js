/**
 * INITIALISATION DU SITE
 */
document.addEventListener("DOMContentLoaded", () => {

    // 1. Générer toutes les galeries
    initGalleries();
  
    // 2. Scroll fluide amélioré pour les ancres
    setupSmoothScroll();
  
    // 3. Petit effet navbar au scroll
    setupNavbarEffect();

    // 4. Bouton "retour en haut"
    setupToTopButton();

    // 5. Menu mobile
    setupMobileNav();

    // 6. Lien actif au scroll
    setupActiveNavLink();

    // 7. Barre de progression
    setupScrollProgress();
  
  });
  
  
  /**
   * SCROLL FLUIDE POUR LES LIENS
   */
  function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
  
    links.forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
  
        const target = document.querySelector(this.getAttribute("href"));
  
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  }
  
  
  /**
   * NAVBAR QUI CHANGE AU SCROLL
   */
  function setupNavbarEffect() {
    const nav = document.querySelector(".nav");
  
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        nav.style.background = "rgba(250, 248, 244, 0.95)";
        nav.style.boxShadow = "0 5px 20px rgba(0,0,0,0.05)";
      } else {
        nav.style.background = "rgba(250, 248, 244, 0.85)";
        nav.style.boxShadow = "none";
      }
    });
  }

  function downloadGallery(name, event) {
    const images = GALLERIES[name];

    if (!images || !images.length) {
      alert("Cette galerie est introuvable.");
      return;
    }

    const btn = event ? event.currentTarget : null;
    const originalText = btn ? btn.innerHTML : null;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "Préparation… 0%";
    }

    const zip = new JSZip();
    const folder = zip.folder(name);

    let done = 0;
    let hasError = false;

    const fetchOne = (url, i) =>
      fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} pour ${url}`);
          }
          return res.blob();
        })
        .then(blob => {
          folder.file(`photo-${i + 1}.jpg`, blob);
        })
        .catch(err => {
          hasError = true;
          console.error("Échec du téléchargement de l'image :", url, err);
        })
        .finally(() => {
          done++;
          if (btn) {
            btn.innerHTML = `Préparation… ${Math.round((done / images.length) * 100)}%`;
          }
        });

    Promise.all(images.map((url, i) => fetchOne(url, i))).then(() => {
      if (hasError) {
        alert(
          "Certaines photos n'ont pas pu être récupérées (voir la console pour le détail). " +
          "Le zip contiendra les photos disponibles.\n\n" +
          "Astuce : si le site est ouvert directement depuis un fichier (file://), " +
          "le téléchargement ne fonctionne pas — il faut un vrai serveur (http://)."
        );
      }

      zip.generateAsync({ type: "blob" }).then(content => {
        saveAs(content, `${name}.zip`);

        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    });
  }

  function setupToTopButton() {
    const toTop = document.getElementById("toTop");
    if (!toTop) return;

    window.addEventListener("scroll", () => {
      toTop.style.display = window.scrollY > 400 ? "block" : "none";
    });

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /**
   * MENU MOBILE
   */
  function setupMobileNav() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen);
    });

    links.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /**
   * LIEN ACTIF SELON LA SECTION VISIBLE
   */
  function setupActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    if (!navLinks.length) return;

    const targets = [];
    navLinks.forEach(link => {
      const id = link.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el && id !== "top") targets.push({ el, link });
    });

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const match = targets.find(t => t.el === entry.target);
          if (!match) return;

          if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove("active"));
            match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    targets.forEach(t => observer.observe(t.el));
  }

  /**
   * BARRE DE PROGRESSION DE LA PAGE
   */
  function setupScrollProgress() {
    const bar = document.getElementById("navProgressBar");
    if (!bar) return;

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    });
  }