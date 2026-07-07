/**
 * Toutes les galeries du mariage
 * Ajoute simplement tes fichiers dans /photos/ puis liste-les ici
 */

const GALLERIES = {
    // VENDREDI (19 juin)
    "vendredi-domaine": Array.from({ length: 47 }, (_, i) => `photos/vendredi-domaine/260619-${String(i + 1).padStart(2, "0")}.jpg`),

    "vendredi-repas": Array.from({ length: 75 }, (_, i) => `photos/vendredi-repas/260619-${String(i + 48).padStart(2, "0")}.jpg`),

    // SAMEDI (20 juin)
    "samedi-preparatifs": Array.from({ length: 37 }, (_, i) => `photos/samedi-preparatifs/260620-${String(i + 123).padStart(2, "0")}.jpg`),

    "mairie": Array.from({ length: 148 }, (_, i) => `photos/mairie/260620-${String(i + 160).padStart(2, "0")}.jpg`),

    "cocktail": Array.from({ length: 103 }, (_, i) => `photos/cocktail/260620-${String(i + 308).padStart(2, "0")}.jpg`),

    "ceremonie": Array.from({ length: 59 }, (_, i) => `photos/ceremonie/260620-${String(i + 411).padStart(2, "0")}.jpg`),

    "soiree": Array.from({ length: 120 }, (_, i) => {
      const num = i + 470;
      const prefix = num < 502 ? "260620" : "260621";
      return `photos/soiree/${prefix}-${String(num).padStart(2, "0")}.jpg`;
    })
  };