// settings.js — Applica le impostazioni globali a tutte le pagine

var SETTINGS_BIN_ID = '6a3ad2d7da38895dfef34b4c';
var SETTINGS_API_KEY = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var SETTINGS_URL = 'https://api.jsonbin.io/v3/b/' + SETTINGS_BIN_ID + '/latest';

var siteSettings = {
    siteName: 'Core Lab',
    siteDesc: 'Prodotti per Roblox, fatti bene.',
    discordLink: ''
};

// Carica le impostazioni dal database
async function loadSiteSettings() {
    try {
        var res = await fetch(SETTINGS_URL, {
            headers: { 'X-Master-Key': SETTINGS_API_KEY }
        });
        if (!res.ok) return;
        var data = (await res.json()).record;
        if (data.settings) {
            siteSettings.siteName = data.settings.siteName || 'Core Lab';
            siteSettings.siteDesc = data.settings.siteDesc || '';
            siteSettings.discordLink = data.settings.discordLink || '';
        }
        applySettings();
    } catch (e) {
        console.log('[Settings] Errore caricamento:', e);
        applySettings(); // applica comunque i default
    }
}

// Applica le impostazioni ai vari elementi della pagina
function applySettings() {
    // 1. Aggiorna il nome nel navbar logo
    var logoSpans = document.querySelectorAll('.nav-logo span');
    logoSpans.forEach(function(span) {
        span.textContent = siteSettings.siteName;
    });

    // 2. Aggiorna il titolo della pagina
    var currentTitle = document.title;
    var defaultName = 'Core Lab';
    if (currentTitle.startsWith(defaultName)) {
        var suffix = currentTitle.replace(defaultName, '');
        document.title = siteSettings.siteName + suffix;
    }

    // 3. Aggiorna la descrizione se esiste l'elemento
    var descEl = document.getElementById('siteDescription');
    if (descEl) {
        descEl.textContent = siteSettings.siteDesc;
    }

    // 4. Aggiorna i link Discord se presenti
    if (siteSettings.discordLink) {
        // Link Discord nel footer o assistenza
        var discordLinks = document.querySelectorAll('.discord-link, [data-discord-link]');
        discordLinks.forEach(function(link) {
            link.href = siteSettings.discordLink;
        });

        // Le card assistenza con link discord diretto
        var assistCards = document.querySelectorAll('.assist-card');
        assistCards.forEach(function(card) {
            var icon = card.querySelector('.fa-discord');
            if (icon && !card.dataset.custom) {
                card.href = siteSettings.discordLink;
            }
        });
    }

    // 5. Metadescription (SEO)
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && siteSettings.siteDesc) {
        metaDesc.setAttribute('content', siteSettings.siteDesc);
    }
}

// Avvia il caricamento
loadSiteSettings();
