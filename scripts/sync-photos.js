/**
 * Script pour lister et synchroniser automatiquement les photos réelles du salon
 * 
 * Usage :
 *   node scripts/sync-photos.js
 */

const fs = require("fs");
const path = require("path");

const photosDir = path.resolve(__dirname, "../photos-salon");
const githubRawBase = "https://raw.githubusercontent.com/amplify-sport/koloreak-marketing-funnel/main/photos-salon";

const categories = [
    { folder: "balayage", themeId: "balayage_signature" },
    { folder: "coloration-vegetale", themeId: "coloration_vegetale" },
    { folder: "soins-spa", themeId: "spa_bien_etre" },
    { folder: "salon-interieur", themeId: "agenda_dispos" },
    { folder: "avant-apres", themeId: "avant_apres" }
];

const catalog = {};

categories.forEach(cat => {
    const dirPath = path.join(photosDir, cat.folder);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
        catalog[cat.themeId] = files.map(f => `${githubRawBase}/${cat.folder}/${encodeURIComponent(f)}`);
    } else {
        catalog[cat.themeId] = [];
    }
});

const outputPath = path.resolve(__dirname, "../functions/photos-catalog.json");
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));

console.log("📸 Catalogue des photos réelles mis à jour :");
console.log(JSON.stringify(catalog, null, 2));
