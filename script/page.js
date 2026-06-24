// ===== BIN CONFIG =====
var BIN_ID      = '6a3ad2d7da38895dfef34b4c'; // bin principale (utenti, stats, developer)
var PRODUCTS_ID = '6a3b19cbf5f4af5e29261b00'; // bin prodotti
var REVIEWS_ID  = '6a3b343bda38895dfef4de16'; // bin recensioni
var API_KEY     = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';

var BIN_URL      = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
var PRODUCTS_URL = 'https://api.jsonbin.io/v3/b/' + PRODUCTS_ID + '/latest';
var REVIEWS_URL  = 'https://api.jsonbin.io/v3/b/' + REVIEWS_ID + '/latest';


// ===== ICONE =====
var ICON_ROBUX  = '<img src="https://cdn.discordapp.com/emojis/1518427187894550588.png" class="price-icon">';
var ICON_PAYPAL = '<img src="https://cdn.discordapp.com/emojis/1518427263455068201.png" class="price-icon">';


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

    // Admin button injection
    checkAdmin(u.id).then(function(isAdmin) {
        if (!isAdmin) return;
        var navLinks = document.getElementById('navLinks');
        if (navLinks) {
            var btn = document.createElement('a');
            btn.href = 'admin.html';
            btn.className = 'nav-admin';
            btn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
            navLinks.appendChild(btn);
        }
        var mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            var mBtn = document.createElement('a');
            mBtn.href = 'admin.html';
            mBtn.className = 'mobile-admin';
            mBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Admin';
            mobileMenu.appendChild(mBtn);
        }
    });
}

async function checkAdmin(userId) {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return false;
        var data = (await res.json()).record;
        return (data.admins || []).indexOf(userId) !== -1;
    } catch(e) { return false; }
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

function esc(s) { var d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
function formatDate(ts) { if(!ts)return ''; var d=new Date(ts); return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear(); }


// ===== MODALE =====
var modalOverlay = null;

function createModal() {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'productModal';
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    document.body.appendChild(modalOverlay);
}

function openModal(product) {
    if (!modalOverlay) createModal();

    var pricesHtml = '<div class="modal-prices">';
    if (product.priceRbx) {
        pricesHtml += '<span class="modal-price-tag">' + ICON_ROBUX + ' ' + esc(product.priceRbx) + '</span>';
    }
    if (product.price) {
        pricesHtml += '<span class="modal-price-tag">' + ICON_PAYPAL + ' ' + esc(product.price) + '</span>';
    }
    pricesHtml += '</div>';

    var creatorHtml = '';
    if (product.creatorName) {
        var creatorAv = product.creatorAvatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
        creatorHtml =
            '<div class="modal-creator">' +
                '<img src="' + esc(creatorAv) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
                '<div class="modal-creator-info">' +
                    '<span class="modal-creator-name">' + esc(product.creatorName) + '</span>' +
                    '<span class="modal-creator-label">Creatore</span>' +
                '</div>' +
            '</div>';
    }

    modalOverlay.innerHTML =
        '<div class="modal-card">' +
            '<button class="modal-close" id="modalClose"><i class="fa-solid fa-xmark"></i></button>' +
            '<img class="modal-img" src="' + esc(product.image) + '" alt="" onerror="this.style.background=\'rgba(139,92,246,.05)\'">' +
            '<div class="modal-body">' +
                '<h2 class="modal-title">' + esc(product.name) + '</h2>' +
                '<p class="modal-desc">' + esc(product.description) + '</p>' +
                pricesHtml +
                creatorHtml +
                '<div class="modal-footer">' +
                    (product.sold ? '<span class="modal-sold">' + product.sold + ' venduti</span>' : '<span></span>') +
                    (product.addedAt ? '<span class="modal-date">' + formatDate(product.addedAt) + '</span>' : '<span></span>') +
                '</div>' +
            '</div>' +
        '</div>';

    document.getElementById('modalClose').addEventListener('click', closeModal);
    requestAnimationFrame(function() {
        modalOverlay.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}


// ===== RENDER PRODOTTI =====
function renderProducts(products) {
    var pg = document.getElementById('productsGrid');
    if (!pg) return;

    var prods = products.filter(function(p) { return p.active !== false; });

    if (!prods.length) {
        pg.innerHTML = '<div class="recent-empty">Nessun prodotto disponibile</div>';
        return;
    }

    pg.innerHTML = '';
    prods.forEach(function(p) {
        var div = document.createElement('div');
        div.className = 'prod-card scroll-in';
        div.style.cursor = 'pointer';

        var pricesHtml = '<div class="prod-prices">';
        if (p.priceRbx) {
            pricesHtml += '<span class="prod-price-tag">' + ICON_ROBUX + ' ' + esc(p.priceRbx) + '</span>';
        }
        if (p.price) {
            pricesHtml += '<span class="prod-price-tag">' + ICON_PAYPAL + ' ' + esc(p.price) + '</span>';
        }
        pricesHtml += '</div>';

        var creatorHtml = '';
        if (p.creatorName && p.creatorAvatar) {
            creatorHtml = '<div class="prod-creator"><img src="' + esc(p.creatorAvatar) + '" alt="" onerror="this.style.display=\'none\'"><span>' + esc(p.creatorName) + '</span></div>';
        } else if (p.creatorName) {
            creatorHtml = '<div class="prod-creator"><span>' + esc(p.creatorName) + '</span></div>';
        }

        div.innerHTML =
            '<img class="prod-img" src="' + esc(p.image) + '" alt="" onerror="this.style.background=\'rgba(139,92,246,.05)\';this.height=\'160px\'">' +
            '<div class="prod-body">' +
                '<h3>' + esc(p.name) + '</h3>' +
                '<p>' + esc(p.description) + '</p>' +
                pricesHtml +
                '<div class="prod-foot">' +
                    creatorHtml +
                    (p.sold ? '<span class="prod-sold">' + p.sold + ' venduti</span>' : '') +
                '</div>' +
            '</div>';

        div.addEventListener('click', function() {
            openModal(p);
        });

        pg.appendChild(div);
    });
}


// ===== RENDER RECENSIONI (Corretto con stelle precise) =====
function renderReviews(revs) {
    var rg = document.getElementById('reviewsGrid');
    if (!rg) return;
    if (!revs || !revs.length) { rg.innerHTML = '<div class="recent-empty">Nessuna recensione</div>'; return; }
    rg.innerHTML = '';
    revs.forEach(function(r) {
        var starsHtml = '';
        var stelle = parseInt(r.stars) || 0;
        for(var i = 1; i <= 5; i++) {
            if (i <= stelle) {
                starsHtml += '<span class="rev-star rev-star-on">★</span>';
            } else {
                starsHtml += '<span class="rev-star rev-star-off">☆</span>';
            }
        }

        var div = document.createElement('div');
        div.className = 'rev-card scroll-in';
        div.innerHTML = 
            '<div class="rev-top">' +
                '<img class="rev-av" src="' + esc(r.avatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
                '<span class="rev-name">' + esc(r.username) + '</span>' +
                '<span class="rev-stars">' + starsHtml + '</span>' +
            '</div>' +
            '<p class="rev-text">Prodotto: ' + esc(r.product) + '</p>' +
            '<div class="rev-product">' + formatDate(r.timestamp) + '</div>';
        rg.appendChild(div);
    });
}


// ===== RENDER DEVELOPER (Singolo) =====
function renderDeveloper(data) {
    var dc = document.getElementById('devContent');
    if (!dc || !data.developer) return;
    var d = data.developer;
    var tags = (d.tags||[]).map(function(t){return '<span class="dev-tag">'+esc(t)+'</span>';}).join('');
    dc.innerHTML =
        '<h1>Developer</h1><p class="page-desc">Chi c\'è dietro</p>' +
        '<div class="dev-card scroll-in">' +
            '<div class="dev-avatar-wrap">' +
                '<img class="dev-avatar" src="'+esc(d.avatar)+'" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/3.png\'">' +
                '<div class="dev-status"></div>' +
            '</div>' +
            '<div class="dev-info">' +
                '<h3>'+esc(d.name)+'</h3>' +
                '<p>'+esc(d.role)+'</p>' +
                '<div class="dev-tags">'+tags+'</div>' +
                '<div class="dev-stats">' +
                    '<div><strong>'+(data.products?data.products.length:0)+'</strong><span>prodotti</span></div>' +
                    '<div><strong>'+((data.stats&&data.stats.totalSales)||0).toLocaleString('it-IT')+'</strong><span>vendite</span></div>' +
                    '<div><strong>'+esc(d.rating||'—')+'</strong><span>rating</span></div>' +
                '</div>' +
            '</div>' +
        '</div>';
}


// ===== SCROLL ANIM =====
function initScrollAnim() {
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-in').forEach(function(el,i) { el.style.transitionDelay=(i%6)*0.07+'s'; obs.observe(el); });
}


// ===== LOAD — carica bin principale + bin prodotti + bin recensioni =====
async function loadPage() {
    try {
        var [mainRes, prodRes, revRes] = await Promise.all([
            fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } }),
            fetch(PRODUCTS_URL, { headers: { 'X-Master-Key': API_KEY } }),
            fetch(REVIEWS_URL, { headers: { 'X-Master-Key': API_KEY } })
        ]);

        var mainData = null;
        var products = [];
        var reviews = [];

        if (mainRes.ok) {
            mainData = (await mainRes.json()).record;
        }

        if (prodRes.ok) {
            products = (await prodRes.json()).record.products || [];
        }

        if (revRes.ok) {
            reviews = (await revRes.json()).record.reviews || [];
        }

        renderProducts(products);
        renderReviews(reviews);
        if (mainData) {
            renderDeveloper(mainData);
        }

        setTimeout(initScrollAnim, 50);
    } catch(e) {
        console.error('Errore:', e.message);
    }
}

if (initUser()) loadPage();