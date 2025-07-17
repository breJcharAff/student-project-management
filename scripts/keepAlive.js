// scripts/keepAlive.js
const axios = require("axios");
const URL = process.env.BASE_URL ||
    "https://student-project-management-render-service.onrender.com";

setInterval(() => {
    axios.get(URL)
        .then(() => console.log(`[PING] ${new Date().toISOString()}`))
        .catch(err => console.error("[PING ERROR]", err.message));
}, 300_000);          // 300 000 ms = 5 min

// Ping immédiat (optionnel)
axios.get(URL).catch(() => {});
