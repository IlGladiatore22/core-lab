// page.js — Solo logica pagina prodotti e recensioni

var ICON_ROBUX  = '<img src="https://cdn.discordapp.com/emojis/1518427187894550588.png" class="price-icon">';
var ICON_PAYPAL = '<img src="https://cdn.discordapp.com/emojis/1518427263455068201.png" class="price-icon">';

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
    if (product.priceRbx) pricesHtml += '<span class="modal-price-tag">' + ICON_ROBUX + ' ' + esc(product.priceRbx) + '</span>';
    if (product.price) pricesHtml += '<span class="modal-price-tag">' + ICON_PAYPAL + ' ' + esc(product.price) + '</span>';
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

function renderProducts(products) {
    var pg = document.getElementById('productsGrid');
    if (!pg) return;
    var prods = products.filter(function(p) { return p.active !== false; });
    if (!prods.length) { pg.innerHTML = '<div class="recent-empty">Nessun prodotto disponibile</div>'; return; }

    pg.innerHTML = '';
    prods.forEach(function(p) {
        var div = document.createElement('div');
        div.className = 'prod-card scroll-in';
        div.style.cursor = 'pointer';

        var pricesHtml = '<div class="prod-prices">';
        if (p.priceRbx) pricesHtml += '<span class="prod-price-tag">' + ICON_ROBUX + ' ' + esc(p.priceRbx) + '</span>';
        if (p.price) pricesHtml += '<span class="prod-price-tag">' + ICON_PAYPAL + ' ' + esc(p.price) + '</span>';
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

        div.addEventListener('click', function() { openModal(p); });
        pg.appendChild(div);
    });
}

function renderReviews(revs) {
    var rg = document.getElementById('reviewsGrid');
    if (!rg) return;
    if (!revs || !revs.length) { rg.innerHTML = '<div class="recent-empty">Nessuna recensione</div>'; return; }
    rg.innerHTML = '';
    revs.forEach(function(r) {
        var starsHtml = '';
        var stelle = parseInt(r.stars) || 0;
        for(var i = 1; i <= 5; i++) {
            if (i <= stelle) starsHtml += '<span class="rev-star rev-star-on">★</span>';
            else starsHtml += '<span class="rev-star rev-star-off">☆</span>';
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

function initScrollAnim() {
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-in').forEach(function(el,i) { el.style.transitionDelay=(i%6)*0.07+'s'; obs.observe(el); });
}

async function loadPage() {
    try {
        var [mainRes, prodRes, revRes] = await Promise.all([
            fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } }),
            fetch(PRODUCTS_URL, { headers: { 'X-Master-Key': API_KEY } }),
            fetch(REVIEWS_URL, { headers: { 'X-Master-Key': API_KEY } })
        ]);

        var dataMain = null;
        var products = [];
        var reviews = [];

        if (mainRes.ok) dataMain = (await mainRes.json()).record;
        if (prodRes.ok) products = (await prodRes.json()).record.products || [];
        if (revRes.ok) reviews = (await revRes.json()).record.reviews || [];

        renderProducts(products);
        renderReviews(reviews);
        if (dataMain) renderDeveloper(dataMain);

        setTimeout(initScrollAnim, 50);
    } catch(e) {
        console.error('Errore:', e.message);
    }
}

initUser(false, loadPage);
