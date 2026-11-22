const appId = '1124944433858832';
const appSecret = '37b5d6c39b78a4ab2d3a582fff777af5';
const freshUserToken = process.argv[2];

if (!freshUserToken) {
    console.error("Usage: node get-permanent-token.js <FRESH_USER_TOKEN>");
    process.exit(1);
}

async function run() {
    try {
        console.log("1. Échange du jeton temporaire contre un jeton utilisateur longue durée (60 jours)...");
        const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${freshUserToken}`;
        const exRes = await fetch(exchangeUrl);
        const exData = await exRes.json();

        if (exData.error) {
            console.error("Erreur échange jeton :", exData.error);
            return;
        }

        const longLivedUserToken = exData.access_token;
        console.log("✅ Jeton utilisateur longue durée obtenu !");

        console.log("2. Récupération du jeton de Page permanent (Never Expire) pour Koloreak...");
        const accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedUserToken}`;
        const accRes = await fetch(accountsUrl);
        const accData = await accRes.json();

        if (accData.error) {
            console.error("Erreur récupération comptes :", accData.error);
            return;
        }

        console.log("Pages trouvées :", accData.data.map(p => ({ id: p.id, name: p.name })));

        const koloreakPage = accData.data.find(p => p.id === '103999685392716') || accData.data[0];

        if (!koloreakPage) {
            console.error("Aucune page trouvée !");
            return;
        }

        const permanentPageToken = koloreakPage.access_token;
        console.log(`\n🎉 JETON DE PAGE PERMANENT OBTENU POUR "${koloreakPage.name}" !`);
        console.log("--------------------------------------------------");
        console.log("TOKEN:", permanentPageToken);
        console.log("--------------------------------------------------");

        // Vérification de la durée de validité du jeton
        const debugUrl = `https://graph.facebook.com/debug_token?input_token=${permanentPageToken}&access_token=${appId}|${appSecret}`;
        const debugRes = await fetch(debugUrl);
        const debugData = await debugRes.json();
        console.log("Validité :", debugData.data && debugData.data.is_valid);
        console.log("Expire à :", debugData.data && (debugData.data.expires_at === 0 ? "JAMAIS (Permanent / Never)" : new Date(debugData.data.expires_at * 1000)));

        return permanentPageToken;
    } catch (err) {
        console.error("Exception :", err);
    }
}

run();
