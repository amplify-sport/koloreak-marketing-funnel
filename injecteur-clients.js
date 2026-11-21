/**
 * Injecteur de clientes en lot (CSV -> Firestore -> Relance / Fidélisation)
 * 
 * Usage :
 *   node injecteur-clients.js --dry-run                 # Prévisualisation sans écriture Firestore
 *   node injecteur-clients.js                           # Importe clients.csv (max 25)
 *   node injecteur-clients.js --file mon-fichier.csv    # Spécifier un autre fichier
 *   node injecteur-clients.js --limit 10                # Limiter à 10 clients
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

function getArgValue(flag, defaultValue) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("--")) {
        return args[idx + 1];
    }
    return defaultValue;
}

const csvFileArg = getArgValue("--file", "clients.csv");
let csvPath = path.resolve(process.cwd(), csvFileArg);

if (!fs.existsSync(csvPath) && fs.existsSync(path.resolve(process.cwd(), "clients.example.csv"))) {
    csvPath = path.resolve(process.cwd(), "clients.example.csv");
    console.log(`ℹ️ '${csvFileArg}' non trouvé, utilisation de 'clients.example.csv' par défaut.`);
}

const maxBatch = Math.max(1, parseInt(getArgValue("--limit", "25"), 10) || 25);

function detectDelimiter(headerLine) {
    const semicolons = (headerLine.match(/;/g) || []).length;
    const commas = (headerLine.match(/,/g) || []).length;
    return semicolons > commas ? ";" : ",";
}

function parseCsvLine(line, delimiter) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

function loadClientsFromCsv(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier introuvable : ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#"));

    if (lines.length < 2) return [];

    const delimiter = detectDelimiter(lines[0]);
    const headers = parseCsvLine(lines[0], delimiter).map(h => h.toLowerCase().trim());

    const clients = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i], delimiter);
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = (cols[idx] || "").trim();
        });

        if (row.nom || row.name) {
            clients.push({
                name: row.nom || row.name,
                email: row.email || null,
                phone: row.telephone || row.phone || null,
                lastVisit: row.dernier_passage || row.last_visit || null,
                serviceType: row.prestation || row.service || "Soin / Coiffure",
                notes: row.notes || ""
            });
        }
    }
    return clients;
}

async function run() {
    console.log("================================================================================");
    console.log("🌿 IMPORTATION & GESTION CLIENTS - SALON KOLOREAK");
    console.log("================================================================================\n");

    const clients = loadClientsFromCsv(csvPath);
    console.log(`📋 ${clients.length} client(s) détecté(s) dans le fichier.`);

    if (isDryRun) {
        console.log("🔍 MODE DRY-RUN ACTIF (Aucune écriture dans Firestore) :\n");
        clients.slice(0, maxBatch).forEach((c, idx) => {
            console.log(`[${idx + 1}] ${c.name} | Tél: ${c.phone || "N/A"} | Dernier passage: ${c.lastVisit || "N/A"} | Prestation: ${c.serviceType}`);
        });
        console.log(`\nPour injecter réellement dans Firebase, lancez : node injecteur-clients.js`);
        return;
    }

    // Initialisation Firebase Admin
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    const db = admin.firestore();

    console.log(`⏳ Injection en cours de ${Math.min(clients.length, maxBatch)} clients dans Firestore...\n`);

    let count = 0;
    for (const c of clients.slice(0, maxBatch)) {
        const docRef = db.collection("clients").doc();
        await docRef.set({
            name: c.name,
            email: c.email,
            phone: c.phone,
            lastVisit: c.lastVisit ? admin.firestore.Timestamp.fromDate(new Date(c.lastVisit)) : admin.firestore.FieldValue.serverTimestamp(),
            serviceType: c.serviceType,
            notes: c.notes,
            reminderStatus: "en_attente",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        count++;
        console.log(`✅ [${count}] Client ajouté : ${c.name} (Doc ID: ${docRef.id})`);
    }

    console.log(`\n🎉 Terminé ! ${count} client(s) ajouté(s) à la collection 'clients' de Firestore.`);
}

run().catch(err => {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
});
