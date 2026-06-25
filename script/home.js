var BIN_ID  = '6a3ad2d7da38895dfef34b4c';
var API_KEY = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';

var siteData = null;


// ===== UTENTE =====
function initUser() {
    var u = null;
    try {
        var d = localStorage.getItem('corelab_user');
        u = d ? JSON.parse(d) : null;
    } catch (e) { u = null; }

    if (!u) {
        var uid = getCookie('corelab_uid');
        if (uid) {
            loadUserFromBin(uid);
            return;
        }
        // Non redirectiamo su login dalla home, mostriamo dati generici
    }

    if (u) showUser(u);
}

function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

async function loadUserFromBin(uid) {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        var data = (await res.json()).record;
        var found = data.users.find(function (u) { return u.id === uid; });
        if (found) {
            localStorage.setItem('corelab_user', JSON.stringify(found));
            showUser(found);
        }
    } catch (e) {}
}

function showUser(u) {
    var name = u.globalName || u.username || 'Utente';
    var avatar = u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';

    var heroName = document.getElementById('heroName');
    var heroAvatar = document.getElementById('heroAvatar');
    if (heroName) heroName.textContent = name;
    if (heroAvatar) heroAvatar.src = avatar;

    var pairs = [
        ['navAvatar', 'navUsername'],
        ['mobileAvatar', 'mobileUsername']
    ];
    pairs.forEach(function (pair) {
        var av = document.getElementById(pair[0]);
        var nm = document.getElementById(pair[1]);
        if (av) av.src = avatar;
        if (nm) nm.textContent = name;
    });

    var nu = document.getElementById('navUser');
    var mu = document.getElementById('mobileUser');
    var lo = document.getElementById('logoutBtn');
    var ml = document.getElementById('mobileLogout');

    if (nu) nu.style.display = 'flex';
    if (mu) mu.style.display = 'flex';
    if (lo) lo.style.display = 'flex';
    if (ml) ml.style.display = 'block';

    if (lo) {
        lo.addEventListener('click', function () {
            localStorage.removeItem('corelab_user');
            document.cookie = 'corelab_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = 'login.html';
        });
    }
}


// ===== CARICA DATI E IMPOSTAZIONI =====
async function loadSiteData() {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        siteData = (await res.json()).record;

        // ===== APPLICA IMPOSTAZIONI =====
        var settings = siteData.settings || {};

        // Nome sito
        var siteName = settings.siteName || 'Core Lab';
        document.title = siteName + ' — Home';

        // Cambia il nome nel nav logo
        var navLogoSpan = document.querySelector('.nav-logo span');
        if (navLogoSpan) navLogoSpan.textContent = siteName;

        // Cambia il nome nel footer
        var footerSpan = document.querySelector('.footer-left span');
        if (footerSpan) footerSpan.textContent = siteName;

        // Descrizione
        var siteDesc = settings.siteDesc || 'Prodotti per Roblox, fatti bene. Niente scam, niente cazzate.';
        var heroDesc = document.getElementById('heroDesc');
        if (heroDesc) heroDesc.textContent = siteDesc;

        // ===== STATS =====
        var stats = siteData.stats || {};

        animateNum('statUsers', stats.totalUsers || 0);
        animateNum('statSales', stats.totalSales || 0);
        animateNum('statReviews', stats.totalReviews || 0);

        // Online — lo mettiamo a 1 come fallback
        var online = stats.onlineNow || 1;
        animateNum('statOnline', online);

    } catch (e) {
        console.error('Errore caricamento dati:', e.message);
    }
}


// ===== ANIMAZIONE NUMERI =====
function animateNum(id, target) {
    var el = document.getElementById(id);
    if (!el) return;
    var start = 0;
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // ease out
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(ease * target);
        el.textContent = current.toLocaleString('it-IT');
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target.toLocaleString('it-IT');
        }
    }

    requestAnimationFrame(step);
}


// ===== BURGER MENU =====
var burger = document.getElementById('burger');
var mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
        var s = burger.querySelectorAll('span');
        var o = mobileMenu.classList.contains('open');
        s[0].style.transform = o ? 'rotate(45deg) translate(4px,4px)' : '';
        s[1].style.opacity = o ? '0' : '1';
        s[2].style.transform = o ? 'rotate(-45deg) translate(4px,-4px)' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
            burger.querySelectorAll('span').forEach(function (s) {
                s.style.transform = '';
                s.style.opacity = '1';
            });
        });
    });
}


// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    var elements = document.querySelectorAll('.scroll-in');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(function (el) {
        observer.observe(el);
    });
}


// ===== START =====
initUser();
loadSiteData();
initScrollAnimations();
