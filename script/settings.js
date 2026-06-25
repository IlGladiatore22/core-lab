var BIN_ID  = '6a3ad2d7da38895dfef34b4c';
var API_KEY = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';

async function loadSiteSettings() {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        var data = (await res.json()).record;
        var settings = data.settings || {};

        var siteName = settings.siteName || 'Core Lab';

        // Aggiorna il title — mantiene la parte dopo "—"
        var parts = document.title.split('—');
        if (parts.length > 1) {
            document.title = siteName + ' — ' + parts[1].trim();
        } else {
            document.title = siteName;
        }

        // Aggiorna nome nel nav
        var navSpan = document.querySelector('.nav-logo span');
        if (navSpan) navSpan.textContent = siteName;

        // Aggiorna nome nel footer
        var footerSpan = document.querySelector('.footer-left span');
        if (footerSpan) footerSpan.textContent = siteName;

    } catch (e) {}
}

loadSiteSettings();
