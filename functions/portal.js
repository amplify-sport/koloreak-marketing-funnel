/**
 * Portail Web Mobile Privé pour le Salon Koloreak
 * Permet à l'équipe du salon d'ajouter des photos réelles depuis leur tablette Samsung ou smartphone,
 * de choisir le thème de la réalisation, d'ajouter une note et de suivre les photos en réserve.
 */

const SALON_PIN_DEFAULT = process.env.SALON_PIN || "64100";
const BUCKET_NAME = process.env.PHOTOS_BUCKET_NAME || "koloreak-photos-926050795047";

function getPortalHtml() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Koloreak Photos • Studio Instagram</title>
    <meta name="theme-color" content="#435B47">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Koloreak">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌿</text></svg>">
    <style>
        :root {
            --primary: #435B47;
            --primary-dark: #2D3E30;
            --primary-light: #EEF3EE;
            --accent: #C87A58;
            --gold: #DDB377;
            --bg: #F8F5EE;
            --card-bg: #FFFFFF;
            --text: #2A332B;
            --text-muted: #6B776D;
            --border: #E3DDD1;
            --radius: 18px;
            --shadow: 0 8px 24px rgba(45, 62, 48, 0.08);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.5;
            padding-bottom: 60px;
        }

        /* Top Header */
        header {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            padding: 24px 20px 20px;
            border-bottom-left-radius: 24px;
            border-bottom-right-radius: 24px;
            box-shadow: 0 4px 20px rgba(45, 62, 48, 0.15);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .header-content {
            max-width: 680px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .brand-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-icon {
            font-size: 32px;
            line-height: 1;
            background: rgba(255, 255, 255, 0.15);
            padding: 8px;
            border-radius: 14px;
        }

        .brand-name {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .brand-subtitle {
            font-size: 13px;
            color: #D3E0D5;
            font-weight: 400;
        }

        .badge-insta {
            background: rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(8px);
            padding: 6px 12px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            border: 1px solid rgba(255, 255, 255, 0.25);
        }

        /* Container */
        .container {
            max-width: 680px;
            margin: 20px auto 0;
            padding: 0 16px;
        }

        /* Stats banner */
        .stats-banner {
            background: var(--card-bg);
            border-radius: var(--radius);
            padding: 16px 20px;
            margin-bottom: 20px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .stats-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .stats-pill {
            background: var(--primary-light);
            color: var(--primary);
            font-size: 22px;
            font-weight: 800;
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stats-text h3 {
            font-size: 15px;
            font-weight: 700;
            color: var(--text);
        }

        .stats-text p {
            font-size: 12px;
            color: var(--text-muted);
        }

        .btn-quick-view {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--primary);
            font-weight: 600;
            font-size: 13px;
            padding: 8px 14px;
            border-radius: 20px;
            cursor: pointer;
        }

        /* Card Section */
        .form-card {
            background: var(--card-bg);
            border-radius: var(--radius);
            padding: 24px 20px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
            margin-bottom: 24px;
        }

        .step-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 700;
            color: var(--primary-dark);
            margin-bottom: 14px;
        }

        .step-num {
            background: var(--primary);
            color: white;
            font-size: 12px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        /* Themes Grid */
        .themes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 24px;
        }

        @media (max-width: 420px) {
            .themes-grid {
                grid-template-columns: 1fr;
            }
        }

        .theme-btn {
            background: var(--bg);
            border: 2px solid transparent;
            border-radius: 14px;
            padding: 12px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .theme-btn:active {
            transform: scale(0.98);
        }

        .theme-btn.active {
            background: var(--primary-light);
            border-color: var(--primary);
            box-shadow: 0 4px 12px rgba(67, 91, 71, 0.15);
        }

        .theme-emoji {
            font-size: 24px;
            line-height: 1;
        }

        .theme-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 2px;
        }

        .theme-desc {
            font-size: 11px;
            color: var(--text-muted);
            line-height: 1.3;
        }

        /* Photo Upload Area */
        .upload-zone {
            border: 2.5px dashed var(--border);
            border-radius: 16px;
            padding: 30px 16px;
            text-align: center;
            cursor: pointer;
            background: #FAFAF7;
            transition: all 0.2s ease;
            position: relative;
            margin-bottom: 20px;
        }

        .upload-zone.has-photo {
            padding: 10px;
            border-style: solid;
            border-color: var(--primary);
            background: #FFFFFF;
        }

        .upload-icon-box {
            font-size: 48px;
            margin-bottom: 8px;
            display: block;
        }

        .upload-btn-fake {
            display: inline-block;
            background: var(--primary);
            color: white;
            font-weight: 700;
            font-size: 15px;
            padding: 12px 24px;
            border-radius: 30px;
            margin-top: 8px;
            box-shadow: 0 4px 14px rgba(67, 91, 71, 0.25);
        }

        .upload-hint {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 8px;
        }

        #fileInput {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        /* Image Preview */
        .preview-wrapper {
            display: none;
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            max-height: 380px;
        }

        .preview-img {
            width: 100%;
            height: auto;
            max-height: 380px;
            object-fit: cover;
            display: block;
            border-radius: 12px;
        }

        .preview-change-btn {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(6px);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        /* Note Input */
        .note-input {
            width: 100%;
            border: 1.5px solid var(--border);
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 14px;
            color: var(--text);
            background: var(--bg);
            resize: none;
            height: 72px;
            font-family: inherit;
            margin-bottom: 6px;
        }

        .note-input:focus {
            outline: none;
            border-color: var(--primary);
            background: white;
        }

        .note-hint {
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 24px;
        }

        /* Submit Button */
        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, var(--accent), #B36846);
            color: white;
            border: none;
            border-radius: 16px;
            padding: 16px 20px;
            font-size: 17px;
            font-weight: 700;
            letter-spacing: 0.3px;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(200, 122, 88, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: transform 0.15s ease;
        }

        .btn-submit:active {
            transform: scale(0.98);
        }

        .btn-submit:disabled {
            background: #CCC;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Spinner */
        .spinner {
            display: none;
            width: 22px;
            height: 22px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Notification Toast */
        .toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #2D3E30;
            color: white;
            padding: 14px 24px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
            z-index: 100;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 90%;
            text-align: center;
        }

        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        /* Gallery Section */
        .gallery-section {
            margin-top: 30px;
        }

        .gallery-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .gallery-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--primary-dark);
        }

        .photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
        }

        .photo-card {
            background: white;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .photo-thumb {
            width: 100%;
            height: 140px;
            object-fit: cover;
            display: block;
            background: #EEE;
        }

        .photo-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            color: white;
            backdrop-filter: blur(4px);
        }

        .photo-badge.pending {
            background: rgba(67, 91, 71, 0.9);
        }

        .photo-badge.used {
            background: rgba(100, 100, 100, 0.8);
        }

        .photo-meta {
            padding: 8px 10px;
            font-size: 11px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .photo-note {
            color: var(--text);
            font-weight: 500;
            margin-bottom: 6px;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }

        .photo-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 4px;
        }

        .btn-post-now {
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
        }

        .btn-delete-photo {
            background: transparent;
            color: #C00;
            border: none;
            font-size: 14px;
            cursor: pointer;
            padding: 2px 4px;
        }

        /* How-to Card */
        .install-guide {
            background: linear-gradient(135deg, #FFF9F0, #FDF3E7);
            border: 1.5px dashed var(--gold);
            border-radius: var(--radius);
            padding: 18px 20px;
            margin-top: 30px;
        }

        .install-guide h4 {
            color: #8C581A;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .install-guide ol {
            padding-left: 20px;
            font-size: 13px;
            color: #6E4919;
            line-height: 1.6;
        }

        /* PIN Modal */
        #pinModal {
            position: fixed;
            inset: 0;
            background: rgba(45, 62, 48, 0.85);
            backdrop-filter: blur(8px);
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .pin-box {
            background: white;
            border-radius: 24px;
            padding: 30px 24px;
            max-width: 360px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .pin-icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .pin-title {
            font-size: 20px;
            font-weight: 800;
            color: var(--primary-dark);
            margin-bottom: 6px;
        }

        .pin-desc {
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 20px;
        }

        .pin-input {
            width: 100%;
            font-size: 24px;
            letter-spacing: 8px;
            text-align: center;
            padding: 12px;
            border: 2px solid var(--border);
            border-radius: 14px;
            margin-bottom: 16px;
            font-weight: 700;
        }

        .pin-input:focus {
            outline: none;
            border-color: var(--primary);
        }

        .btn-pin {
            width: 100%;
            background: var(--primary);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <!-- PIN Screen -->
    <div id="pinModal" style="display: none;">
        <div class="pin-box">
            <div class="pin-icon">🔐</div>
            <h2 class="pin-title">Espace Salon Koloreak</h2>
            <p class="pin-desc">Entrez le code d'accès du salon (code postal de Bayonne : 64100)</p>
            <input type="password" id="pinInput" class="pin-input" placeholder="•••••" maxlength="10" inputmode="numeric">
            <button class="btn-pin" onclick="verifyPin()">Déverrouiller</button>
            <div id="pinError" style="color: #C00; font-size: 12px; margin-top: 10px; display: none;">Code incorrect, réessayez.</div>
        </div>
    </div>

    <!-- Header -->
    <header>
        <div class="header-content">
            <div class="brand-title">
                <div class="brand-icon">🌿</div>
                <div>
                    <h1 class="brand-name">KOLOREAK</h1>
                    <div class="brand-subtitle">Studio Photos • 37 Rue Maubec</div>
                </div>
            </div>
            <div class="badge-insta">
                <span>📸</span>
                <span>@koloreakshopping</span>
            </div>
        </div>
    </header>

    <div class="container">
        <!-- Live Stats -->
        <div class="stats-banner">
            <div class="stats-info">
                <div class="stats-pill" id="statsCount">0</div>
                <div class="stats-text">
                    <h3>Photos prêtes au salon</h3>
                    <p id="statsSub">Pour les prochaines publications automatiques</p>
                </div>
            </div>
            <button class="btn-quick-view" onclick="scrollToGallery()">Voir la réserve ↓</button>
        </div>

        <!-- Form Card -->
        <div class="form-card">
            <!-- Step 1 -->
            <div class="step-label">
                <span class="step-num">1</span>
                <span>Quel est le thème de cette réalisation ?</span>
            </div>
            <div class="themes-grid" id="themesGrid">
                <button type="button" class="theme-btn active" data-theme="balayage_signature">
                    <span class="theme-emoji">✨</span>
                    <div>
                        <div class="theme-title">Balayage & Gloss</div>
                        <div class="theme-desc">Blond, reflets lumineux, fondu</div>
                    </div>
                </button>
                <button type="button" class="theme-btn" data-theme="coloration_vegetale">
                    <span class="theme-emoji">🌿</span>
                    <div>
                        <div class="theme-title">Coloration Végétale</div>
                        <div class="theme-desc">100% plantes, brillance & soin</div>
                    </div>
                </button>
                <button type="button" class="theme-btn" data-theme="spa_bien_etre">
                    <span class="theme-emoji">💆‍♀️</span>
                    <div>
                        <div class="theme-title">Soin Spa & Massage</div>
                        <div class="theme-desc">Rituel détente, massage crânien</div>
                    </div>
                </button>
                <button type="button" class="theme-btn" data-theme="avant_apres">
                    <span class="theme-emoji">✂️</span>
                    <div>
                        <div class="theme-title">Avant / Après</div>
                        <div class="theme-desc">Transformation, nouvelle coupe</div>
                    </div>
                </button>
                <button type="button" class="theme-btn" data-theme="salon_ambiance" style="grid-column: span 2;">
                    <span class="theme-emoji">🏠</span>
                    <div>
                        <div class="theme-title">Salon, Équipe & Ambiance</div>
                        <div class="theme-desc">Le salon, l'équipe au travail, détails déco, coin tisane</div>
                    </div>
                </button>
            </div>

            <!-- Step 2 -->
            <div class="step-label">
                <span class="step-num">2</span>
                <span>Prendre ou choisir la photo</span>
            </div>
            
            <div class="upload-zone" id="uploadZone">
                <input type="file" id="fileInput" accept="image/*">
                <div id="uploadPrompt">
                    <span class="upload-icon-box">📷</span>
                    <div style="font-weight: 700; font-size: 16px; color: var(--primary);">Toucher pour prendre une photo</div>
                    <div class="upload-btn-fake">Appareil photo / Galerie</div>
                    <div class="upload-hint">Sur la tablette Samsung, choisissez directement l'appareil photo ou la galerie</div>
                </div>

                <div class="preview-wrapper" id="previewWrapper">
                    <img id="previewImg" class="preview-img" alt="Aperçu">
                    <button type="button" class="preview-change-btn" onclick="triggerFileInput(event)">Changer</button>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-label">
                <span class="step-num">3</span>
                <span>Un détail pour Instagram ? <span style="font-weight: normal; font-size: 13px; color: var(--text-muted);">(facultatif)</span></span>
            </div>
            <textarea id="noteInput" class="note-input" placeholder="Ex: Balayage miel doré sur brune naturelle, ou rituel ayurvédique aux poudres..."></textarea>
            <div class="note-hint">💡 L'intelligence artificielle s'inspirera de votre mot pour rédiger un texte Instagram personnalisé et professionnel !</div>

            <!-- Submit Button -->
            <button type="button" class="btn-submit" id="submitBtn" onclick="uploadPhoto()">
                <span class="spinner" id="spinner"></span>
                <span id="btnText">✨ Enregistrer la photo pour Instagram</span>
            </button>
        </div>

        <!-- How to install on tablet -->
        <div class="install-guide">
            <h4>📲 Comment avoir cette page comme une application sur la tablette ?</h4>
            <ol>
                <li>Touchez les <strong>3 petits points ⋮</strong> en haut à droite de Google Chrome (ou le bouton Partager sur iPad).</li>
                <li>Appuyez sur <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
                <li>Validez : l'icône 🌿 <strong>Koloreak</strong> apparaît sur votre écran d'accueil comme une vraie application !</li>
            </ol>
        </div>

        <!-- Gallery / Reserve -->
        <div class="gallery-section" id="gallerySection">
            <div class="gallery-header">
                <h2 class="gallery-title">📸 Réserve de photos du salon</h2>
                <button class="btn-quick-view" onclick="loadPhotos()">Actualiser 🔄</button>
            </div>
            <div class="photos-grid" id="photosGrid">
                <!-- Dynamically loaded -->
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toast">Photo enregistrée avec succès !</div>

    <script>
        let selectedTheme = "balayage_signature";
        let currentPhotoBase64 = null;
        const DEFAULT_PIN = "64100";

        // Check PIN on load
        function getSavedPin() {
            return localStorage.getItem("koloreak_salon_pin") || "";
        }

        function checkAuth() {
            const pin = getSavedPin();
            if (!pin) {
                document.getElementById("pinModal").style.display = "flex";
            } else {
                document.getElementById("pinModal").style.display = "none";
                loadPhotos();
            }
        }

        function verifyPin() {
            const entered = document.getElementById("pinInput").value.trim();
            if (entered === DEFAULT_PIN || entered === "koloreak") {
                localStorage.setItem("koloreak_salon_pin", entered);
                document.getElementById("pinModal").style.display = "none";
                loadPhotos();
            } else {
                document.getElementById("pinError").style.display = "block";
            }
        }

        // Theme selection
        document.querySelectorAll(".theme-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedTheme = btn.dataset.theme;
            });
        });

        // Photo Handling & Downscaling
        const fileInput = document.getElementById("fileInput");
        const uploadZone = document.getElementById("uploadZone");
        const uploadPrompt = document.getElementById("uploadPrompt");
        const previewWrapper = document.getElementById("previewWrapper");
        const previewImg = document.getElementById("previewImg");

        function triggerFileInput(e) {
            e.stopPropagation();
            fileInput.click();
        }

        fileInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    // Resize to max 1400px to ensure fast upload and perfect Instagram quality
                    const maxDim = 1400;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            maxDim;
                            width = Math.round((width * maxDim) / img.height);
                            height = maxDim;
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    currentPhotoBase64 = canvas.toDataURL("image/jpeg", 0.85);
                    previewImg.src = currentPhotoBase64;
                    uploadPrompt.style.display = "none";
                    previewWrapper.style.display = "block";
                    uploadZone.classList.add("has-photo");
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });

        // Upload to server
        async function uploadPhoto() {
            if (!currentPhotoBase64) {
                showToast("⚠️ Veuillez d'abord prendre ou choisir une photo !");
                return;
            }

            const btn = document.getElementById("submitBtn");
            const spinner = document.getElementById("spinner");
            const btnText = document.getElementById("btnText");
            const note = document.getElementById("noteInput").value.trim();
            const pin = getSavedPin() || DEFAULT_PIN;

            btn.disabled = true;
            spinner.style.display = "inline-block";
            btnText.textContent = "Envoi au salon en cours...";

            try {
                const res = await fetch("api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pin: pin,
                        themeId: selectedTheme,
                        photoBase64: currentPhotoBase64,
                        note: note
                    })
                });

                const data = await res.json();
                if (data.success) {
                    showToast("🎉 Photo enregistrée ! Prête pour Instagram.");
                    // Reset
                    currentPhotoBase64 = null;
                    previewImg.src = "";
                    previewWrapper.style.display = "none";
                    uploadPrompt.style.display = "block";
                    uploadZone.classList.remove("has-photo");
                    document.getElementById("noteInput").value = "";
                    fileInput.value = "";
                    loadPhotos();
                } else {
                    showToast("❌ Erreur : " + (data.error || "Impossible d'envoyer la photo"));
                }
            } catch (err) {
                showToast("❌ Erreur réseau. Vérifiez votre connexion.");
            } finally {
                btn.disabled = false;
                spinner.style.display = "none";
                btnText.textContent = "✨ Enregistrer la photo pour Instagram";
            }
        }

        // Load recent photos
        async function loadPhotos() {
            const pin = getSavedPin() || DEFAULT_PIN;
            try {
                const res = await fetch("api/photos?pin=" + encodeURIComponent(pin));
                const data = await res.json();
                if (data.success && data.photos) {
                    renderGallery(data.photos);
                }
            } catch (e) {
                console.error("Erreur chargement photos :", e);
            }
        }

        function renderGallery(photos) {
            const grid = document.getElementById("photosGrid");
            const pendingCount = photos.filter(p => !p.used).length;
            document.getElementById("statsCount").textContent = pendingCount;
            document.getElementById("statsSub").textContent = pendingCount > 1 
                ? pendingCount + " photos en réserve prêtes à être publiées" 
                : pendingCount === 1 ? "1 photo en réserve prête à être publiée" : "Ajoutez une photo pour alimenter les prochains posts";

            if (photos.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px;">Aucune photo encore enregistrée. Prenez la première photo ci-dessus ! 🌿</div>';
                return;
            }

            const themeNames = {
                "balayage_signature": "✨ Balayage",
                "coloration_vegetale": "🌿 Végétale",
                "spa_bien_etre": "💆‍♀️ Spa",
                "avant_apres": "✂️ Avant/Après",
                "salon_ambiance": "🏠 Salon"
            };

            grid.innerHTML = photos.map(p => {
                const themeLabel = themeNames[p.themeId] || "📸 Salon";
                const isUsed = p.used;
                const statusBadge = isUsed 
                    ? '<span class="photo-badge used">Publiée sur Insta</span>'
                    : '<span class="photo-badge pending">En réserve</span>';

                const postNowBtn = !isUsed 
                    ? '<button class="btn-post-now" onclick="publierPhoto(\'' + p.id + '\')">Publier direct 🚀</button>'
                    : '<span style="font-size: 10px; color: #888;">Publiée</span>';

                return '<div class="photo-card">' +
                    statusBadge +
                    '<img class="photo-thumb" src="' + p.url + '" alt="Photo salon" loading="lazy">' +
                    '<div class="photo-meta">' +
                        '<div style="font-weight: 700; color: var(--primary); margin-bottom: 2px;">' + themeLabel + '</div>' +
                        (p.note ? '<div class="photo-note">« ' + escapeHtml(p.note) + ' »</div>' : '<div class="photo-note" style="color:#999;font-style:italic;">Sans note</div>') +
                        '<div class="photo-actions">' +
                            postNowBtn +
                            '<button class="btn-delete-photo" onclick="deletePhoto(\'' + p.id + '\')" title="Supprimer">🗑️</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join("");
        }

        async function publierPhoto(photoId) {
            if (!confirm("Voulez-vous générer et publier ce post MAINTENANT sur le compte Instagram @koloreakshopping ?")) {
                return;
            }
            showToast("⏳ Rédaction par l'IA et publication Instagram en cours...");
            const pin = getSavedPin() || DEFAULT_PIN;
            try {
                const res = await fetch("api/publier-maintenant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin, photoId })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("🎉 Post Instagram publié avec succès !");
                    loadPhotos();
                } else {
                    showToast("❌ Erreur : " + (data.error || "Échec publication"));
                }
            } catch (e) {
                showToast("❌ Erreur de connexion.");
            }
        }

        async function deletePhoto(photoId) {
            if (!confirm("Supprimer cette photo de la réserve ?")) return;
            const pin = getSavedPin() || DEFAULT_PIN;
            try {
                const res = await fetch("api/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin, photoId })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("Photo supprimée.");
                    loadPhotos();
                }
            } catch (e) {
                showToast("Erreur lors de la suppression.");
            }
        }

        function showToast(msg) {
            const toast = document.getElementById("toast");
            toast.textContent = msg;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 4000);
        }

        function scrollToGallery() {
            document.getElementById("gallerySection").scrollIntoView({ behavior: "smooth" });
        }

        function escapeHtml(text) {
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        }

        // Init
        checkAuth();
    </script>
</body>
</html>`;
}

module.exports = {
    getPortalHtml,
    SALON_PIN_DEFAULT,
    BUCKET_NAME
};
