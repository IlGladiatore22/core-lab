// ===== BURGER MOBILE INFALLIBILE =====
document.addEventListener('click', function(e) {
    var burger = e.target.closest('#burger');
    if (burger) {
        e.preventDefault();
        var mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenu) return;
        mobileMenu.classList.toggle('open');
        var s = burger.querySelectorAll('span');
        var o = mobileMenu.classList.contains('open');
        s[0].style.transform = o ? 'rotate(45deg) translate(4px,4px)' : '';
        s[1].style.opacity = o ? '0' : '1';
        s[2].style.transform = o ? 'rotate(-45deg) translate(4px,-4px)' : '';
        return;
    }
    if (e.target.closest('#mobileMenu a')) {
        var mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenu) return;
        mobileMenu.classList.remove('open');
        var s = document.getElementById('burger').querySelectorAll('span');
        s[0].style.transform = ''; s[1].style.opacity = '1'; s[2].style.transform = '';
    }
});

var BIN_ID  = '6a3ad2d7da38895dfef34b4c';
var API_KEY = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';

var mainData = null;

// ===== UTENTE =====
function initUser() {
    var u = null;
    try { var d = localStorage.getItem('corelab_user'); u = d ? JSON.parse(d) : null; } catch(e) {}
    if (!u) {
        var uid = getCookie('corelab_uid');
        if (uid) { loadUserFromBin(uid); return true; }
        window.location.href = 'login.html';
        return false;
    }
    showUser(u);
    loadDevelopers();
    return true;
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
        var found = data.users.find(function(u) { return u.id === uid; });
        if (found) {
            localStorage.setItem('corelab_user', JSON.stringify(found));
            showUser(found);
            loadDevelopers();
        }
    } catch(e) {}
}

function showUser(u) {
    var name = u.globalName || u.username || 'Utente';
    var avatar = u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
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
    if (nu) nu.style.display = 'flex';
    if (mu) mu.style.display = 'flex';
    if (lo) lo.style.display = 'flex';
    if (ml) ml.style.display = 'block';
    if (lo) lo.addEventListener('click', function() {
        localStorage.removeItem('corelab_user');
        document.cookie = 'corelab_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/logout';
    });
}

function esc(s) { var d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }

// ===== CARICA DEVELOPERS =====
async function loadDevelopers() {
    var grid = document.getElementById('devGrid');
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        mainData = (await res.json()).record;
        
        var devs = mainData.developers || [];
        var reviews = mainData.reviews || []; 

        if (!devs.length) {
            grid.innerHTML = '<div class="recent-empty"><i class="fa-solid fa-user-slash" style="display:block;font-size:1.4rem;margin-bottom:10px;opacity:.4;"></i>Nessun developer nel team</div>';
            return;
        }

        grid.innerHTML = '';

        devs.forEach(function(dev, i) {
            var tags = (dev.tags || []).map(function(t) {
                return '<span class="dev-card-tag">' + esc(t) + '</span>';
            }).join('');

            var ratingHtml = '';
            var devReviews = reviews.filter(function(r) { return r.username === dev.name; });

            if (devReviews.length > 0) {
                var sum = 0;
                devReviews.forEach(function(r) { sum += Number(r.rating) || 0; });
                var avg = (sum / devReviews.length).toFixed(1);
                if (Number(avg) > 0) {
                    ratingHtml = '<span class="dev-card-rating"><i class="fa-solid fa-star"></i> ' + avg + '</span>';
                }
            }

            var card = document.createElement('div');
            card.className = 'dev-card scroll-in';
            card.style.transitionDelay = (i * 0.08) + 's';

            card.innerHTML =
                '<div class="dev-card-avatar-wrap">' +
                    '<img class="dev-card-avatar" src="' + esc(dev.avatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
                '</div>' +
                '<div class="dev-card-body">' +
                    '<div class="dev-card-name">' + esc(dev.name) + '</div>' +
                    '<div class="dev-card-role">' + esc(dev.role || 'Developer') + '</div>' +
                    '<div class="dev-card-tags">' + tags + '</div>' +
                '</div>' +
                '<div class="dev-card-footer">' + ratingHtml + '</div>';

            grid.appendChild(card);
        });

        setTimeout(function() {
            document.querySelectorAll('.dev-card.scroll-in').forEach(function(el) {
                el.classList.add('visible');
            });
        }, 50);

    } catch(e) {
        grid.innerHTML = '<div class="recent-empty">Errore caricamento</div>';
    }
}

// ===== START =====
initUser();
