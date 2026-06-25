// ============================================
// CORE LAB — File unico globale
// ============================================

var BIN_ID      = '6a3ad2d7da38895dfef34b4c';
var PRODUCTS_ID = '6a3b19cbf5f4af5e29261b00';
var API_KEY     = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL      = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
var PRODUCTS_URL = 'https://api.jsonbin.io/v3/b/' + PRODUCTS_ID + '/latest';
var RENDER_URL   = 'https://core-lab.onrender.com';

var mainData = null;
var siteSettings = {
    siteName: 'Core Lab',
    siteDesc: '',
    discordLink: ''
};


// ============================================
// 1. IMPOSTAZIONI SITO
// ============================================

async function loadSiteSettings() {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        var data = (await res.json()).record;
        
        // Salva i dati principali
        mainData = data;
        
        // Estrai impostazioni
        if (data.settings) {
            siteSettings.siteName = data.settings.siteName || 'Core Lab';
            siteSettings.siteDesc = data.settings.siteDesc || '';
            siteSettings.discordLink = data.settings.discordLink || '';
        }
        
        applySettings();
    } catch (e) {
        console.log('[Core] Errore caricamento impostazioni:', e);
        applySettings();
    }
}

function applySettings() {
    // Nome nel navbar
    document.querySelectorAll('.nav-logo span').forEach(function(span) {
        span.textContent = siteSettings.siteName;
    });
    
    // Titolo pagina
    document.title = document.title.replace('Core Lab', siteSettings.siteName);
    
    // Descrizione
    var descEl = document.getElementById('siteDescription');
    if (descEl && siteSettings.siteDesc) {
        descEl.textContent = siteSettings.siteDesc;
    }
    
    // Link Discord
    if (siteSettings.discordLink) {
        document.querySelectorAll('[data-discord-link]').forEach(function(el) {
            el.href = siteSettings.discordLink;
        });
    }
}


// ============================================
// 2. GESTIONE UTENTE
// ============================================

function initUser(requireAdmin) {
    var u = null;
    try {
        var d = localStorage.getItem('corelab_user');
        u = d ? JSON.parse(d) : null;
    } catch (e) { u = null; }

    if (!u) {
        var uid = getCookie('corelab_uid');
        if (uid) {
            loadUserFromBin(uid, requireAdmin);
            return true;
        }
        if (requireAdmin) {
            window.location.href = 'login.html';
            return false;
        }
        showUser(null);
        return true;
    }

    if (requireAdmin) {
        checkAdmin(u.id).then(function(isAdmin) {
            if (!isAdmin) {
                window.location.href = 'home.html';
                return;
            }
            showUser(u);
        });
    } else {
        showUser(u);
    }
    return true;
}

function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

async function loadUserFromBin(uid, requireAdmin) {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        var data = (await res.json()).record;
        var found = data.users.find(function(u) { return u.id === uid; });
        if (found) {
            localStorage.setItem('corelab_user', JSON.stringify(found));
            showUser(found);
        }
    } catch (e) {}
}

async function checkAdmin(userId) {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return false;
        var data = (await res.json()).record;
        return (data.admins || []).indexOf(userId) !== -1;
    } catch (e) { return false; }
}

function showUser(u) {
    var name = u ? (u.globalName || u.username || 'Utente') : '';
    var avatar = u ? (u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png') : '';
    
    [['navAvatar','navUsername'],['mobileAvatar','mobileUsername']].forEach(function(pair) {
        var av = document.getElementById(pair[0]);
        var nm = document.getElementById(pair[1]);
        if (av) av.src = avatar;
        if (nm) nm.textContent = name;
    });
    
    var nu = document.getElementById('navUser');
    var mu = document.getElementById('mobileUser');
    var lo = document.getElementById('logoutBtn');
    var ml = document.getElementById('mobileLogout');
    
    var show = u ? 'flex' : 'none';
    if (nu) nu.style.display = show;
    if (mu) mu.style.display = show;
    if (lo) lo.style.display = show;
    if (ml) ml.style.display = u ? 'block' : 'none';
    
    if (lo) lo.addEventListener('click', doLogout);
    if (ml) ml.addEventListener('click', doLogout);
}

function doLogout() {
    localStorage.removeItem('corelab_user');
    document.cookie = 'corelab_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = 'login.html';
}


// ============================================
// 3. MENU BURGER
// ============================================

function initBurger() {
    var burger = document.getElementById('burger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!burger || !mobileMenu) return;

    burger.addEventListener('click', function() {
        mobileMenu.classList.toggle('open');
        var s = burger.querySelectorAll('span');
        var o = mobileMenu.classList.contains('open');
        s[0].style.transform = o ? 'rotate(45deg) translate(4px,4px)' : '';
        s[1].style.opacity = o ? '0' : '1';
        s[2].style.transform = o ? 'rotate(-45deg) translate(4px,-4px)' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            burger.querySelectorAll('span').forEach(function(s) { 
                s.style.transform = ''; 
                s.style.opacity = '1'; 
            });
        });
    });
}


// ============================================
// 4. UTILITÀ
// ============================================

function esc(s) { 
    var d = document.createElement('div'); 
    d.textContent = s || ''; 
    return d.innerHTML; 
}

function showToast(msg, type) {
    var toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast ' + (type || 'info') + ' show';
    setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

function timeAgo(ts) {
    var diff = Date.now() - ts;
    var s = Math.floor(diff / 1000);
    if (s < 60) return 'ora';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm fa';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h fa';
    var d = Math.floor(h / 24);
    if (d < 30) return d + 'g fa';
    var mo = Math.floor(d / 30);
    return mo + ' mesi fa';
}

async function saveBin() {
    var res = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
        method: 'PUT',
        headers: { 'X-Master-Key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(mainData)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function loadMainData() {
    if (mainData) return mainData;
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        mainData = (await res.json()).record;
        return mainData;
    } catch(e) {
        console.error('[Core] Errore:', e);
        return null;
    }
}


// ============================================
// 5. AVVIO AUTOMATICO
// ============================================

(function() {
    initBurger();
    loadSiteSettings();
})();
