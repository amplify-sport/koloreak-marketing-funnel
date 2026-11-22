const fs = require("fs");
const path = require("path");

const SALON_PIN_DEFAULT = process.env.SALON_PIN || "64100";
const BUCKET_NAME = process.env.PHOTOS_BUCKET_NAME || "koloreak-photos-926050795047";

function getPortalHtml() {
    return fs.readFileSync(path.join(__dirname, "portal.html"), "utf8");
}

module.exports = {
    getPortalHtml,
    SALON_PIN_DEFAULT,
    BUCKET_NAME
};
