// ========================================================
//  JSONBIN CONFIG
// ========================================================
var BIN_ID      = '6a3ad2d7da38895dfef34b4c';
var PRODUCTS_ID = '6a3b19cbf5f4af5e29261b00';
var API_KEY     = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL      = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
var PRODUCTS_URL = 'https://api.jsonbin.io/v3/b/' + PRODUCTS_ID + '/latest';


// ========================================================
//  UTENTE
// ========================================================
var currentUser = null;

function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function initUser() {
    var uid = getCookie('corelab_uid');

    if (uid) {
        loadUserAndStart(uid);
        return true;
    }

    try {
        var data = localStorage.getItem('corelab_user');
        if (data) {
            currentUser = JSON.parse(data);
            showUser(currentUser);
            checkAdmin(currentUser.id);
            loadData();
            return true;
        }
    } catch (e) {}

    window.location.href = 'login.html';
    return false;
}

async function loadUserAndStart(uid) {
    try {
        var res = await fetch(BIN_URL, {
            headers: { 'X-Master-Key': API_KEY }
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);

        var json = await res.json();
        var data = json.record;

        if (!data || !data.users) throw new Error('Nessun dato');

        var found = null;
        for (var i = 0; i < data.users.length; i++) {
            if (data.users[i].id === uid) {
                found = data.users[i];
                break;
            }
        }

        if (!found) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = found;
        localStorage.setItem('corelab_user', JSON.stringify(found));
        showUser(found);

        // settings
        if (data.settings) {
            if (data.settings.siteDesc) {
                var desc = document.getElementById('heroDesc');
                if (desc) desc.textContent = data.settings.siteDesc;
            }
        }

        // stats + attività recente
        renderStats(data);
        renderRecent(data);

        checkAdmin(found.id);
        loadData();

    } catch (e) {
        console.error('Errore caricamento utente:', e.message);
        try {
            var data = localStorage.getItem('corelab_user');
            if (data) {
                currentUser = JSON.parse(data);
                showUser(currentUser);
                checkAdmin(currentUser.id);
            }
        } catch (e2) {}
        loadData();
    }

    setTimeout(initScrollAnim, 50);
}


// ========================================================
//  ADMIN CHECK — injecta bottone nella nav
// ========================================================
async function checkAdmin(userId) {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return;
        var data = (await res.json()).record;
        var admins = data.admins || [];
        if (admins.indexOf(userId) !== -1) {
            // injecta nella nav desktop
            var navLinks = document.getElementById('navLinks');
            if (navLinks) {
                var adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-admin';
                adminLink.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
                navLinks.appendChild(adminLink);
            }

            // injecta nel mobile menu
            var mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                var mobileLogout = document.getElementById('mobileLogout');
                var mobileAdminLink = document.createElement('a');
                mobileAdminLink.href = 'admin.html';
                mobileAdminLink.className = 'mobile-admin';
                mobileAdminLink.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
                mobileMenu.insertBefore(mobileAdminLink, mobileLogout);
            }
        }
    } catch(e) {}
}


// ========================================================
//  MOSTRA UTENTE
// ========================================================
function showUser(u) {
    var name = u.globalName || u.username || 'Utente';
    var avatar = u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';

    var navUser = document.getElementById('navUser');
    var navAvatar = document.getElementById('navAvatar');
    var navUsername = document.getElementById('navUsername');
    var logoutBtn = document.getElementById('logoutBtn');

    if (navUser) navUser.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (navAvatar) navAvatar.src = avatar;
    if (navUsername) navUsername.textContent = name;

    var heroAvatar = document.getElementById('heroAvatar');
    var heroName = document.getElementById('heroName');
    if (heroAvatar) heroAvatar.src = avatar;
    if (heroName) heroName.textContent = name;

    var mobileUser = document.getElementById('mobileUser');
    var mobileAvatar = document.getElementById('mobileAvatar');
    var mobileUsername = document.getElementById('mobileUsername');
    var mobileLogout = document.getElementById('mobileLogout');

    if (mobileUser) mobileUser.style.display = 'flex';
    if (mobileLogout) mobileLogout.style.display = 'block';
    if (mobileAvatar) mobileAvatar.src = avatar;
    if (mobileUsername) mobileUsername.textContent = name;

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('corelab_user');
            document.cookie = 'corelab_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/logout';
        });
    }
}


// ========================================================
//  BURGER
// ========================================================
var burger = document.getElementById('burger');
var mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
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
            burger.querySelectorAll('span').forEach(function(s) { s.style.transform=''; s.style.opacity='1'; });
        });
    });
}


// ========================================================
//  UTILITIES
// ========================================================
function animateNum(el, target) {
    if (!el) return;
    var duration = 1200;
    var startTime = null;
    function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * ease).toLocaleString('it-IT');
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function esc(s) { var d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }

function timeAgo(ts) {
    var diff = Date.now() - ts;
    var sec = Math.floor(diff / 1000);
    if (sec < 60) return 'ora';
    var min = Math.floor(sec / 60);
    if (min < 60) return min + 'm';
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h';
    var day = Math.floor(hr / 24);
    return day + 'g';
}


// ========================================================
//  RENDER STATS
// ========================================================
function renderStats(data) {
    var s = data.stats || {};
    animateNum(document.getElementById('statUsers'), s.totalUsers || 0);
    animateNum(document.getElementById('statOnline'), s.onlineNow || 0);
    animateNum(document.getElementById('statSales'), s.totalSales || 0);
    animateNum(document.getElementById('statReviews'), s.totalReviews || 0);
}


// ========================================================
//  RENDER ATTIVITÀ RECENTE
// ========================================================
function renderRecent(data) {
    var list = document.getElementById('recentList');
    var items = data.recentActivity || [];
    if (!items.length) {
        list.innerHTML = '<div class="recent-empty">Nessuna attività recente</div>';
        return;
    }
    list.innerHTML = '';
    items.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'recent-item';
        div.style.animationDelay = (i * 0.06) + 's';
        div.innerHTML =
            '<img class="recent-av" src="' + esc(item.avatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
            '<span class="recent-name">' + esc(item.username) + '</span>' +
            '<span class="recent-action ' + (item.type || '') + '">' + esc(item.action) + '</span>' +
            '<span class="recent-time">' + timeAgo(item.timestamp) + '</span>';
        list.appendChild(div);
    });
}


// ========================================================
//  SCROLL ANIM
// ========================================================
function initScrollAnim() {
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.scroll-in').forEach(function(el, i) {
        el.style.transitionDelay = (i % 6) * 0.07 + 's';
        obs.observe(el);
    });
}


// ========================================================
//  FETCH STATS + RECENT
// ========================================================
async function loadData() {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var json = await res.json();
        var data = json.record;
        if (!data) throw new Error('Nessun dato');
        renderStats(data);
        renderRecent(data);
    } catch (e) {
        console.error('Errore JSONBin:', e.message);
    }
}

setInterval(loadData, 30000);


// ========================================================
//  START
// ========================================================
initUser();