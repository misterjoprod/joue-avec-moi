// Refait mots.js : 3 manches × 12 mots, de plus en plus longs, mélangés UNE fois pour toutes
// en pseudo-mots prononçables (comme ses « MAREURUQ > MARQUEUR »), sans accents dans les tuiles.
// node outils/mots.mjs
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ICI = fileURLToPath(new URL("..", import.meta.url));
const MANCHES = [
  ["Manche 1", "PLAGE TIGRE CRAYON BANANE CHAISE LAPIN MOUTON ORANGE BOUGIE JARDIN PIRATE CAMION"],
  ["Manche 2", "FROMAGE GUITARE CHAPEAU VOITURE CUISINE POMPIER DAUPHIN CAROTTE PISCINE PINGOUIN TRACTEUR CHOCOLAT"],
  ["Manche 3", "PARAPLUIE TÉLÉPHONE CHAMPIGNON ORDINATEUR CROCODILE ASCENSEUR DINOSAURE TROTTINETTE ANNIVERSAIRE BIBLIOTHÈQUE HÉLICOPTÈRE CHAUSSETTE"],
];
const sans = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const VOY = new Set("AEIOUY");

// hasard reproductible : le même mot donne toujours le même mélange
function hasard(graine) { let s = graine; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
// paires qui se lisent en français ; tout le reste coûte des points
const DEUX_VOY = new Set("OU AI EU AU OI EI IE UI IO EA IA UE OE".split(" "));
const DEUX_CONS = new Set(("BR CR DR FR GR PR TR VR BL CL FL GL PL CH PH TH QU ST SP SC NT ND NG NC MB MP RT RD RN RS RC RM RP RL RG RB RV " +
  "LT LD LP LM LC LV CT PT SM SN SL SS TT PP NN MM RR LL FF CC").split(" "));
const DEBUT = new Set("BR CR DR FR GR PR TR VR BL CL FL GL PL CH PH TH QU ST SP SC".split(" "));
const FIN_OK = /([AEIOUY]|[AEIOUY][A-Z]|NT|ST|RT|RD|ND|RS|LT|CT|RN|RC|NC|SC)$/;
function note(m, vrai) {
  let n = 0;
  for (let i = 0; i + 1 < m.length; i++) {
    const a = VOY.has(m[i]), b = VOY.has(m[i + 1]), p = m[i] + m[i + 1];
    if (a !== b) n += 2;                                  // consonne / voyelle qui alternent = ça se prononce
    else if (a && !DEUX_VOY.has(p)) n -= 4;
    else if (!a && !DEUX_CONS.has(p)) n -= 4;
    if (i + 2 < m.length && VOY.has(m[i + 2]) === a && a === b) n -= 6;   // 3 voyelles ou 3 consonnes d'affilée
  }
  if (/Q(?!U)/.test(m)) n -= 8;
  if (!FIN_OK.test(m)) n -= 4;
  if (!VOY.has(m[0]) && !VOY.has(m[1]) && !DEBUT.has(m.slice(0, 2))) n -= 6;
  for (let i = 0; i < m.length; i++) if (m[i] === vrai[i]) n -= 1;                          // lettre restée à sa place
  for (let i = 0; i + 3 <= vrai.length; i++) if (m.includes(vrai.slice(i, i + 3))) n -= 5;   // morceau du vrai mot
  return n;
}
function melanger(mot) {
  const vrai = sans(mot), r = hasard([...vrai].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
  let mieux = null, meilleure = -1e9;
  for (let essai = 0; essai < 20000; essai++) {
    const l = [...vrai];
    for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    const m = l.join(""); if (m === vrai) continue;
    const n = note(m, vrai);
    if (n > meilleure) { meilleure = n; mieux = m; }
  }
  return mieux;
}

const sortie = MANCHES.map(([titre, liste]) => ({
  titre,
  mots: liste.split(" ").map(mot => {
    const m = melanger(mot);
    if ([...m].sort().join("") !== [...sans(mot)].sort().join("")) throw new Error("anagramme fausse : " + mot);
    return { mot, melange: m };
  }),
}));
fs.writeFileSync(ICI + "mots.js",
  "// Retrouve le mot : 3 manches × 12, mélangés par outils/mots.mjs (pseudo-mots prononçables, sans accents).\n" +
  "window.MOTS = " + JSON.stringify(sortie, null, 1) + ";\n");
for (const m of sortie) console.log(m.titre + " : " + m.mots.map(x => x.melange + ">" + x.mot).join("  "));
