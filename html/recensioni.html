var BIN_KEY = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';

// Il nuovo bin dove il bot Discord salva le recensioni
var REVIEWS_BIN_URL = 'https://api.jsonbin.io/v3/b/6a3b343bda38895dfef4de16/latest';

// Il bin principale (serve per login/admin)
var MAIN_BIN_URL = 'https://api.jsonbin.io/v3/b/6a3ad2d7da38895dfef34b4c/latest';


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
    loadReviews();
    return true;
}

function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

async function loadUserFromBin(uid) {
    try {
        var res = await fetch(MAIN_BIN_URL, { headers: { 'X-Master-Key': BIN_KEY } });
        if (!res.ok) return;
        var data = (await res.json()).record;
        var found = data.users.find(function(u) { return u.id === uid; });
        if (found) {
            localStorage.setItem('corelab_user', JSON.stringify(found));
            showUser(found);
            loadReviews();
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
        window.location.href = 'login.html';
    });
}


// ===== BURGER =====
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


// ===== ESCAPE =====
function esc(s) { var d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }


// ===== GENERA STELLE =====
function starsHtml(rating) {
    var n = parseInt(rating, 10);
    if (isNaN(n) || n <= 0) n = 0;
    if (n > 5) n = 5;
    var out = '';
    for (var i = 1; i <= 5; i++) {
        if (i <= n) {
            out += '<i class="fa-solid fa-star"></i>';
        } else {
            out += '<i class="fa-regular fa-star"></i>';
        }
    }
    return out;
}


// ===== CARICA RECENSIONI =====
async function loadReviews() {
    var grid = document.getElementById('reviewsGrid');
    try {
        var res = await fetch(REVIEWS_BIN_URL, { headers: { 'X-Master-Key': BIN_KEY } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = (await res.json()).record;
        var reviews = data.reviews || [];

        if (!reviews.length) {
            grid.innerHTML = '<div class="recent-empty"><i class="fa-solid fa-comment-slash" style="display:block;font-size:1.4rem;margin-bottom:10px;opacity:.4;"></i>Nessuna recensione ancora</div>';
            return;
        }

        grid.innerHTML = '';

        reviews.forEach(function(rev, i) {
            var cardUsername = rev.username || 'Utente';
            var cardAvatar = rev.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
            var cardRating = rev.stars || 0; 
            
            var cardText = 'Prodotto: ' + esc(rev.product || 'N/A');
            if (rev.price) {
                cardText += ' • Prezzo: ' + esc(rev.price);
            }

            var card = document.createElement('div');
            card.className = 'review-card scroll-in';
            card.style.transitionDelay = (i * 0.08) + 's';

            card.innerHTML =
                '<img class="review-card-avatar" src="' + esc(cardAvatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
                '<div class="review-card-name">' + esc(cardUsername) + '</div>' +
                '<div class="review-card-text">' + cardText + '</div>' +
                '<div class="review-card-stars">' + starsHtml(cardRating) + '</div>';

            grid.appendChild(card);
        });

        setTimeout(function() {
            document.querySelectorAll('.review-card.scroll-in').forEach(function(el) {
                el.classList.add('visible');
            });
        }, 50);

    } catch(e) {
        grid.innerHTML = '<div class="recent-empty">Errore caricamento</div>';
    }
}


// ===== START =====
initUser();
