#!/usr/bin/env node

/**
 * Concaténateur de rapport Markdown — générique.
 *
 * Fonctionne avec n'importe quel projet : aucune liste de chapitres n'est
 * écrite dans le script. Il suffit de déposer des fichiers .md dans le
 * dossier des chapitres, dans l'ordre souhaité.
 *
 * - Détecte automatiquement tous les fichiers Markdown du dossier
 * - Ordre naturel du nom de fichier (préfixe numérique, puis alphabet)
 * - Rédige la table des matières à l'emplacement du marqueur <!-- SOMMAIRE -->
 * - Génère le titre à partir du titre existant ou du nom du fichier
 * - Corrige les chemins d'images et signale les images manquantes
 * - Ignore README.md et les fichiers commençant par « _ » ou « . »
 *
 * Usage :
 *   node concat-chapitres.js
 *   node concat-chapitres.js --chapters chapitres --output rapport.md \
 *     --title "Rapport de Projet : Mon Application"
 *   node concat-chapitres.js --marp
 */

const fs = require('fs');
const path = require('path');

// ======================================
// 1. OPTIONS
// ======================================

const SCRIPT_DIR = __dirname;

function parseArgs(argv) {
    const options = {
        chapters: path.join(SCRIPT_DIR, 'chapitres'),
        output: path.join(SCRIPT_DIR, 'rapport.md'),
        title: 'Rapport de Projet',
        marp: false
    };

    for (let i = 0; i < argv.length; i++) {
        const rawArg = argv[i];
        const separator = rawArg.startsWith('--') ? rawArg.indexOf('=') : -1;
        const arg = separator === -1 ? rawArg : rawArg.slice(0, separator);
        const inlineValue = separator === -1 ? undefined : rawArg.slice(separator + 1);

        const next = () => {
            if (inlineValue) {
                return inlineValue;
            }
            const value = argv[++i];
            if (!value) {
                console.error(`Option ${arg} : valeur manquante.`);
                process.exit(1);
            }
            return value;
        };

        if (arg === '--chapters' || arg === '-c') {
            options.chapters = path.resolve(process.cwd(), next());
        } else if (arg === '--output' || arg === '-o') {
            options.output = path.resolve(process.cwd(), next());
        } else if (arg === '--title' || arg === '-t') {
            options.title = next();
        } else if (arg === '--marp') {
            options.marp = true;
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Usage : node concat-chapitres.js [options]

  -c, --chapters <dossier>  Dossier des chapitres (défaut : chapitres/)
  -o, --output <fichier>    Fichier généré (défaut : rapport.md)
  -t, --title <texte>       Titre du rapport (défaut : Rapport de Projet)
      --marp                Ajoute l'en-tête Marp au fichier généré
  -h, --help                Affiche cette aide
`);
            process.exit(0);
        } else {
            console.error(`Option inconnue : ${arg}`);
            process.exit(1);
        }
    }

    return options;
}

const OPTIONS = parseArgs(process.argv.slice(2));
const CHAPTERS_DIR = OPTIONS.chapters;
const OUTPUT_FILE = OPTIONS.output;
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

// Marqueur remplacé par la table des matières générée
const TOC_MARKER = /<!--\s*SOMMAIRE\s*-->/;

/**
 * Chemin affiché dans la console, toujours avec des séparateurs « / ».
 */
function affichage(chemin) {
    return path.relative(process.cwd(), chemin).split(path.sep).join('/') || '.';
}

// ======================================
// 2. VÉRIFICATION DES DOSSIERS
// ======================================

console.log('\n====================================');
console.log(' COMPILATION DU RAPPORT');
console.log('====================================\n');

if (!fs.existsSync(CHAPTERS_DIR) || !fs.statSync(CHAPTERS_DIR).isDirectory()) {
    console.error(`Erreur : dossier des chapitres introuvable (${CHAPTERS_DIR}).`);
    console.error('Utilisez --chapters <dossier> pour indiquer son emplacement.');
    process.exit(1);
}

if (path.resolve(OUTPUT_FILE) === path.resolve(CHAPTERS_DIR)) {
    console.error('Erreur : le fichier de sortie ne peut pas être le dossier des chapitres.');
    process.exit(1);
}

// ======================================
// 3. DÉTECTION AUTOMATIQUE DES CHAPITRES
// ======================================

/**
 * Repère un rapport déjà compilé laissé dans le dossier : il ne doit pas
 * être relu comme un chapitre, sinon le rapport s'auto-inclut à chaque
 * exécution.
 */
function estRapportGenere(filePath) {
    const debut = fs.readFileSync(filePath, 'utf-8').slice(0, 400);
    return debut.includes('Document consolidé généré automatiquement');
}

const chapters = fs.readdirSync(CHAPTERS_DIR, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(name =>
        name.toLowerCase().endsWith('.md') &&
        name.toLowerCase() !== 'readme.md' &&
        !name.startsWith('_') &&
        !name.startsWith('.') &&
        // Ne jamais relire le rapport généré s'il est placé dans ce dossier
        path.resolve(CHAPTERS_DIR, name) !== path.resolve(OUTPUT_FILE)
    )
    .filter(name => {
        const filePath = path.join(CHAPTERS_DIR, name);

        if (estRapportGenere(filePath)) {
            console.log(`  ⚠ ignoré : ${name} (rapport déjà généré)`);
            return false;
        }

        return true;
    })
    .sort((a, b) =>
        a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: 'base'
        })
    );

if (chapters.length === 0) {
    console.error(`Aucun chapitre Markdown trouvé dans ${CHAPTERS_DIR}.`);
    process.exit(1);
}

console.log(`Dossier des chapitres : ${affichage(CHAPTERS_DIR)}`);
console.log(`Fichiers détectés     : ${chapters.length}`);

// ======================================
// 4. TITRES DES CHAPITRES
// ======================================

/**
 * Retire un éventuel préfixe « Chapitre N : » déjà présent.
 */
function stripChapterPrefix(text) {
    return text.replace(/^(?:chapitre|chapter)\s+\d+\s*[:.\-–—]?\s*/i, '').trim();
}

/**
 * Lit un chapitre en normalisant l'encodage : BOM retiré et fins de
 * ligne converties en LF, pour que la détection du titre reste fiable.
 */
function readChapter(filePath) {
    return fs.readFileSync(filePath, 'utf-8')
        .replace(/^\uFEFF/, '')
        .replace(/\r\n?/g, '\n');
}

/**
 * Déduit un titre lisible à partir du nom de fichier :
 * « 03-contexte_du-projet.md » -> « Contexte du projet »
 * Un nom purement numérique (« 12.md ») ne fournit aucun titre :
 * le chapitre est alors seulement numéroté.
 */
function titleFromFilename(filename) {
    const name = path.basename(filename, path.extname(filename))
        .replace(/^\d+[\s._-]*/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!name) {
        return '';
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Extrait le titre de niveau 1 du chapitre, s'il existe, et renvoie le
 * contenu restant. Le titre précédent est remplacé par la numérotation
 * automatique pour éviter les doublons.
 */
function splitTitle(markdown, filename) {
    const lines = markdown.split('\n');
    const firstIndex = lines.findIndex(line => line.trim() !== '');

    if (firstIndex !== -1 && /^#\s+\S/.test(lines[firstIndex].trim())) {
        const heading = lines[firstIndex].trim().replace(/^#\s+/, '');
        const title = stripChapterPrefix(heading) || titleFromFilename(filename);
        const body = lines.slice(firstIndex + 1).join('\n').trim();

        return { title, body };
    }

    return { title: titleFromFilename(filename), body: markdown.trim() };
}

// ======================================
// 5. CHEMINS D'IMAGES
// ======================================

const imagesManquantes = [];

/**
 * Réécrit les chemins d'images relatifs au chapitre pour qu'ils restent
 * valides depuis l'emplacement du fichier généré.
 */
function rewriteImages(markdown, chapterFile) {
    const chapterDir = path.dirname(chapterFile);

    return markdown.replace(
        /(!\[[^\]]*\]\()(<[^>]+>|[^\s)]+)([^)]*\))/g,
        (match, prefix, rawTarget, suffix) => {
            if (/^(https?:|data:|mailto:)/i.test(rawTarget)) {
                return match;
            }

            const target = rawTarget.replace(/^<|>$/g, '');

            let decodedTarget = target;
            try {
                decodedTarget = decodeURI(target);
            } catch (error) {
                decodedTarget = target;
            }

            const absolutePath = path.resolve(chapterDir, decodedTarget);

            if (!fs.existsSync(absolutePath)) {
                imagesManquantes.push({
                    chapter: path.basename(chapterFile),
                    image: target
                });
                return match;
            }

            const relativePath = path.relative(OUTPUT_DIR, absolutePath)
                .split(path.sep)
                .join('/');

            const needsBrackets = /[\s()]/.test(relativePath);

            return `${prefix}${needsBrackets ? `<${relativePath}>` : relativePath}${suffix}`;
        }
    );
}

// ======================================
// 6. EN-TÊTE DU RAPPORT
// ======================================

const today = new Date().toISOString().split('T')[0];

let content = '';

if (OPTIONS.marp) {
    content += `---
marp: true
theme: default
size: 16:9
paginate: true
---

`;
}

content += `# ${OPTIONS.title}

> Document consolidé généré automatiquement.

> Date de génération : ${today}

---

`;

// ======================================
// 7. LECTURE ET NUMÉROTATION
// ======================================

const parsedChapters = chapters.map(file => {
    const filePath = path.join(CHAPTERS_DIR, file);
    const raw = readChapter(filePath);
    const { title, body } = splitTitle(raw, file);

    return {
        file,
        filePath,
        title,
        body,
        isToc: TOC_MARKER.test(body)
    };
});

// Le chapitre qui contient le sommaire ne figure pas dans sa propre liste
const summary = parsedChapters
    .filter(chapter => !chapter.isToc)
    .map(chapter => chapter.title || 'Sans titre');

const tableDesMatieres = summary
    .map(title => '- ' + title)
    .join('\n') || 'Aucun chapitre.';

// ======================================
// 8. COMPILATION DES CHAPITRES
// ======================================

let chapitresVides = 0;

parsedChapters.forEach((chapter, index) => {
    console.log(`\n[${index + 1}/${parsedChapters.length}] ${chapter.file}`);

    let body = chapter.body;

    if (chapter.isToc) {
        body = body.replace(TOC_MARKER, tableDesMatieres);
    } else if (!body) {
        console.log('  + Chapitre vide : titre seul, aucun contenu');
        chapitresVides++;
    }

    body = rewriteImages(body, chapter.filePath);

    // Titre seul, sans numérotation : « # Réalisation »
    const heading = `# ${chapter.title || (chapter.isToc ? 'Table des matières' : 'Sans titre')}`;

    content += body
        ? `${heading}\n\n${body}\n\n---\n\n`
        : `${heading}\n\n---\n\n`;
});

// ======================================
// 9. ÉCRITURE DU FICHIER FINAL
// ======================================

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

// ======================================
// 10. BILAN
// ======================================

console.log('\n====================================');
console.log('       COMPILATION TERMINÉE');
console.log('====================================');
console.log(`Fichiers ajoutés       : ${chapters.length}`);
console.log(`Chapitres listés       : ${summary.length}`);
console.log(`Chapitres vides        : ${chapitresVides}`);
console.log(`Images manquantes      : ${imagesManquantes.length}`);
console.log('\nSommaire :');
summary.forEach(line => console.log(`  ${line}`));

if (imagesManquantes.length > 0) {
    console.log('\n--- IMAGES MANQUANTES ---');
    imagesManquantes.forEach(item => {
        console.log(`- ${item.image} (chapitre : ${item.chapter})`);
    });
}

console.log(`\n✓ Rapport généré : ${affichage(OUTPUT_FILE)}`);
console.log('====================================\n');
