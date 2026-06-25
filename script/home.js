var BIN_ID       = '6a3ad2d7da38895dfef34b4c';
var REVIEWS_ID   = '6a3b343bda38895dfef4de16';
var API_KEY      = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL      = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
var REVIEWS_URL  = 'https://api.jsonbin.io/v3/b/' + REVIEWS_ID + '/latest';
var RENDER_URL   = 'https://core-lab.onrender.com';

var siteData = null;
var currentUserId = null;


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
    currentUserId = u.id;

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


// ===== HEARTBEAT — Online in tempo reale =====
function sendHeartbeat() {
    if (!currentUserId) return;
    try {
        fetch(RENDER_URL + '/api/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId })
        }).catch(function() {});
    } catch (e) {}
}

async function fetchOnlineCount() {
    try {
        var res = await fetch(RENDER_URL + '/api/online-count');
        if (!res.ok) return;
        var data = await res.json();
        var el = document.getElementById('statOnline');
        if (el) {
            var current = parseInt(el.textContent) || 0;
            var target = data.online || 0;
            if (current !== target) {
                animateNum('statOnline', target);
            }
        }
    } catch (e) {}
}

setInterval(sendHeartbeat, 15000);
setInterval(fetchOnlineCount, 10000);


// ===== CARICA DATI PRINCIPALI =====
async function loadSiteData() {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        siteData = (await res.json()).record;

        var settings = siteData.settings || {};

        var siteName = settings.siteName || 'Core Lab';
        document.title = siteName + ' — Home';
        var navLogoSpan = document.querySelector('.nav-logo span');
        if (navLogoSpan) navLogoSpan.textContent = siteName;
        var footerSpan = document.querySelector('.footer-left span');
        if (footerSpan) footerSpan.textContent = siteName;

        var siteDesc = settings.siteDesc || 'Prodotti per Roblox, fatti bene. Niente scam, niente cazzate.';
        var heroDesc = document.getElementById('heroDesc');
        if (heroDesc) heroDesc.textContent = siteDesc;

        var stats = siteData.stats || {};
        animateNum('statUsers', stats.totalUsers || 0);
        animateNum('statSales', stats.totalSales || 0);

    } catch (e) {
        console.error('Errore caricamento dati:', e.message);
    }
}


// ===== CARICA RECENSIONI DAL BIN SEPARATO =====
async function loadReviews() {
    try {
        var res = await fetch(REVIEWS_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) {
            console.error('Errore caricamento recensioni: HTTP ' + res.status);
            return;
        }
        var json = await res.json();
        var record = json.record;

        // Gestisce tutte le strutture possibili del bin
        var reviews = null;

        if (Array.isArray(record)) {
            // Il bin è direttamente un array: [{...}, {...}]
            reviews = record;
        } else if (record && Array.isArray(record.reviews)) {
            // Il bin ha una proprietà reviews: { reviews: [{...}] }
            reviews = record.reviews;
        } else if (record && typeof record === 'object') {
            // Il bin è un oggetto ma senza proprietà reviews — cercha array dentro
            for (var key in record) {
                if (Array.isArray(record[key]) && record[key].length > 0 && record[key][0].text) {
                    reviews = record[key];
                    break;
                }
            }
        }

        if (!reviews) reviews = [];

        console.log('[Recensioni] Trovate ' + reviews.length + ' recensioni nel bin');
        renderHomeReviews(reviews);

    } catch (e) {
        console.error('Errore caricamento recensioni:', e.message);
    }
}


// ===== RENDER RECENSIONI =====
function renderHomeReviews(reviews) {
    var grid = document.getElementById('homeReviewsGrid');
    if (!grid) return;

    // Aggiorna contatore con il numero reale dal bin
    var revCount = document.getElementById('statReviews');
    if (revCount) {
        animateNum('statReviews', reviews.length);
    }

    if (!reviews.length) {
        grid.innerHTML = '<div class="reviews-empty"><i class="fa-solid fa-star"></i>Nessuna recensione ancora</div>';
        return;
    }

    // Mostra le ultime 3
    var latest = reviews.slice(0, 3);
    grid.innerHTML = '';

    latest.forEach(function (rev) {
        var stars = '';
        var starCount = parseInt(rev.stars) || 5;
        for (var i = 0; i < 5; i++) {
            if (i < starCount) {
                stars += '<i class="fa-solid fa-star"></i> ';
            } else {
                stars += '<i class="fa-regular fa-star"></i> ';
            }
        }

        var productTag = rev.product
            ? '<span class="review-card-product">' + esc(rev.product) + '</span>'
            : '';

        var card = document.createElement('div');
        card.className = 'review-card-home scroll-in';
        card.innerHTML =
            '<div class="review-card-top">' +
                '<img class="review-card-av" src="' + esc(rev.avatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
                '<div>' +
                    '<div class="review-card-name">' + esc(rev.username) + '</div>' +
                    '<div class="review-card-stars">' + stars + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="review-card-text">' + esc(rev.text) + '</div>' +
            productTag;

        grid.appendChild(card);
    });

    initScrollAnimations();
}


// ===== AGGIORNAMENTO PERIODICO RECENSIONI (ogni 30s) =====
async function refreshReviews() {
    try {
        var res = await fetch(REVIEWS_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        var json = await res.json();
        var record = json.record;

        var reviews = null;
        if (Array.isArray(record)) {
            reviews = record;
        } else if (record && Array.isArray(record.reviews)) {
            reviews = record.reviews;
        } else if (record && typeof record === 'object') {
            for (var key in record) {
                if (Array.isArray(record[key]) && record[key].length > 0 && record[key][0].text) {
                    reviews = record[key];
                    break;
                }
            }
        }

        if (!reviews) reviews = [];
        renderHomeReviews(reviews);

    } catch (e) {}
}

setInterval(refreshReviews, 30000);


// ===== ANIMAZIONE NUMERI =====
function animateNum(id, target) {
    var el = document.getElementById(id);
    if (!el) return;
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
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
    var elements = document.querySelectorAll('.scroll-in:not(.visible)');
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


// ===== UTILITY =====
function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}


// ===== START =====
initUser();
loadSiteData();
loadReviews().then(function() {
    sendHeartbeat();
    fetchOnlineCount();
});
initScrollAnimations();
