// Refait stars.js (et les photos 720 px de stars/) depuis l'écran « Retrouve la star » du 28-10.
// node outils/stars.mjs
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const DOSSIER = "/Users/joffrey/Desktop/Prod futur tournage/Retrouve la star";
const ICI = fileURLToPath(new URL("..", import.meta.url));
const g = {};
new Function("window", fs.readFileSync(DOSSIER + "/stars.js", "utf8"))(g);

// ce que la dictée peut écrire en plus du nom officiel (le reste est rattrapé par la tolérance aux fautes)
const VOIX = {
  "Squeezie": "squeezy, squizzy", "Rihanna": "rihana",
  "Inoxtag": "inox tag", "MrBeast": "mister beast", "Victor Wembanyama": "wenbanyama",
  "Orelsan": "orel san", "Antoine Griezmann": "griezman", "Cristiano Ronaldo": "cr 7",
  "Tibo InShape": "tibo in shape, thibault inshape", "Leonardo DiCaprio": "di caprio, leonardo", "Thomas Pesquet": "pesquet",
  // la forme courte que tout le monde dit (un prénom ou un nom seul ne suffit que s'il désigne vraiment la star)
  "Marilyn Monroe": "marilyn, monroe", "Céline Dion": "céline", "Ariana Grande": "ariana", "Lady Gaga": "gaga",
  "Billie Eilish": "billy eilish, billie, eilish", "Michael Jackson": "jackson", "Omar Sy": "omar si, omar",
  "Ed Sheeran": "ed shiran, sheeran", "Marion Cotillard": "cotillard", "Emma Watson": "watson", "Tony Parker": "parker",
  "Dwayne Johnson": "dwayne", "Johnny Hallyday": "hallyday", "Usain Bolt": "usain", "Kev Adams": "kevin adams",
};
const liste = s => (s || "").split(",").map(x => x.trim()).filter(Boolean);

fs.mkdirSync(ICI + "stars", { recursive: true });
const manches = g.MANCHES.filter(m => m.code !== "r").map(m => ({
  titre: m.titre,
  stars: m.stars.map(s => {
    const dest = ICI + "stars/" + s.photo + ".jpg";
    if (!fs.existsSync(dest))
      execFileSync("sips", ["-Z", "720", "-s", "formatOptions", "78", DOSSIER + "/photos/" + s.photo + ".jpg", "--out", dest]);
    return { nom: s.nom, ok: [...new Set([s.nom, ...liste(s.aussi), ...liste(VOIX[s.nom])])], photo: "stars/" + s.photo + ".jpg" };
  }),
}));
fs.writeFileSync(ICI + "stars.js",
  "// Retrouve la star : 3 manches × 12 (les stars de l'écran du 28-10). ok = ce qui valide quand on le dit à voix haute.\n" +
  "window.STARS = " + JSON.stringify(manches, null, 1) + ";\n");
fs.copyFileSync(DOSSIER + "/Crédits photos.txt", ICI + "credits-photos.txt");
console.log(manches.map(m => m.titre + " : " + m.stars.length).join(" · "));
