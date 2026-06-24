var BIN_ID      = '6a3ad2d7da38895dfef34b4c';
var PRODUCTS_ID = '6a3b19cbf5f4af5e29261b00';
var API_KEY     = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL      = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
var PRODUCTS_URL = 'https://api.jsonbin.io/v3/b/' + PRODUCTS_ID + '/latest';

var mainData = null;
var developers = [];
var currentTags = [];


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

    checkAdmin(u.id).then(function(isAdmin) {
        if (!isAdmin) {
            window.location.href = 'home.html';
            return;
        }
        showUser(u);
        loadAll();
    });

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

async function checkAdmin(userId) {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) return false;
        var data = (await res.json()).record;
        var admins = data.admins || [];
        return admins.indexOf(userId) !== -1;
    } catch(e) { return false; }
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


// ===== TABS =====
document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});


// ===== LOAD ALL =====
async function loadAll() {
    try {
        var res = await fetch(BIN_URL, { headers: { 'X-Master-Key': API_KEY } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        mainData = (await res.json()).record;
        developers = mainData.developers || [];
        renderDevelopers();
        renderActivity();
        loadSettings();
    } catch(e) {
        console.error('Errore:', e.message);
        showToast('Errore caricamento dati', 'error');
    }
}


// ===== RENDER DEVELOPERS =====
function renderDevelopers() {
    var list = document.getElementById('devList');
    if (!developers.length) {
        list.innerHTML = '<div class="recent-empty">Nessun developer. Aggiungine uno!</div>';
        return;
    }
    list.innerHTML = '';
    developers.forEach(function(dev, i) {
        var tags = (dev.tags || []).map(function(t) { return '<span class="dev-row-tag">' + esc(t) + '</span>'; }).join('');
        var row = document.createElement('div');
        row.className = 'dev-row';
        row.innerHTML =
            '<img class="dev-row-av" src="' + esc(dev.avatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
            '<div class="dev-row-info">' +
                '<div class="dev-row-name">' + esc(dev.name) + '</div>' +
                '<div class="dev-row-role">' + esc(dev.role) + '</div>' +
                '<div class="dev-row-tags">' + tags + '</div>' +
            '</div>' +
            '<div class="dev-row-actions">' +
                '<button class="btn-icon edit-dev" data-idx="' + i + '" title="Modifica"><i class="fa-solid fa-pen"></i></button>' +
                '<button class="btn-icon danger delete-dev" data-idx="' + i + '" title="Elimina"><i class="fa-solid fa-trash"></i></button>' +
            '</div>';
        list.appendChild(row);
    });

    document.querySelectorAll('.edit-dev').forEach(function(btn) {
        btn.addEventListener('click', function() { openEditDev(parseInt(this.dataset.idx)); });
    });
    document.querySelectorAll('.delete-dev').forEach(function(btn) {
        btn.addEventListener('click', function() { deleteDev(parseInt(this.dataset.idx)); });
    });
}


// ===== RENDER ATTIVITÀ RECENTE =====
function renderActivity() {
    var list = document.getElementById('activityList');
    if (!list) return;

    var activities = mainData.recentActivity || [];

    if (!activities.length) {
        list.innerHTML = '<div class="activity-empty"><i class="fa-solid fa-inbox"></i>Nessuna attività recente</div>';
        return;
    }

    list.innerHTML = '';
    activities.forEach(function(act, i) {
        var item = document.createElement('div');
        item.className = 'activity-item';
        item.style.animationDelay = (i * 0.04) + 's';

        var actionClass = act.type || 'login';
        var actionLabel = esc(act.action || 'azione sconosciuta');

        var detail = '';
        if (act.product) {
            detail = '<div class="activity-detail">' + esc(act.product) + '</div>';
        }

        var timeStr = '';
        if (act.timestamp) {
            timeStr = timeAgo(act.timestamp);
        }

        item.innerHTML =
            '<img class="activity-av" src="' + esc(act.avatar) + '" alt="" onerror="this.src=\'https://cdn.discordapp.com/embed/avatars/0.png\'">' +
            '<div class="activity-info">' +
                '<div class="activity-top">' +
                    '<span class="activity-name">' + esc(act.username) + '</span>' +
                    '<span class="activity-action ' + actionClass + '">' + actionLabel + '</span>' +
                '</div>' +
                detail +
            '</div>' +
            '<span class="activity-time">' + timeStr + '</span>';

        list.appendChild(item);
    });
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
    return mo + 'mesi fa';
}


// ===== MODALE DEVELOPER =====
var devModal = document.getElementById('devModal');
var devModalClose = document.getElementById('devModalClose');
var tagInput = document.getElementById('tagInput');
var tagsList = document.getElementById('tagsList');

document.getElementById('addDevBtn').addEventListener('click', function() {
    openAddDev();
});

devModalClose.addEventListener('click', closeDevModal);
devModal.addEventListener('click', function(e) {
    if (e.target === devModal) closeDevModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDevModal();
});

function openAddDev() {
    document.getElementById('devModalTitle').textContent = 'Aggiungi Developer';
    document.getElementById('devName').value = '';
    document.getElementById('devRole').value = '';
    document.getElementById('devDiscordId').value = '';
    document.getElementById('devAvatar').value = '';
    document.getElementById('devEditIndex').value = '-1';
    currentTags = [];
    renderTags();
    hideDiscordPreview();
    devModal.classList.add('open');
}

function openEditDev(idx) {
    var dev = developers[idx];
    document.getElementById('devModalTitle').textContent = 'Modifica Developer';
    document.getElementById('devName').value = dev.name || '';
    document.getElementById('devRole').value = dev.role || '';
    document.getElementById('devDiscordId').value = dev.discordId || '';
    document.getElementById('devAvatar').value = dev.avatar || '';
    document.getElementById('devEditIndex').value = idx;
    currentTags = (dev.tags || []).slice();
    renderTags();
    hideDiscordPreview();
    devModal.classList.add('open');
}

function closeDevModal() {
    devModal.classList.remove('open');
}

// tags
tagInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        e.preventDefault();
        var tag = this.value.trim();
        if (currentTags.indexOf(tag) === -1) {
            currentTags.push(tag);
            renderTags();
        }
        this.value = '';
    }
    if (e.key === 'Backspace' && !this.value && currentTags.length) {
        currentTags.pop();
        renderTags();
    }
});

document.getElementById('tagsInput').addEventListener('click', function() {
    tagInput.focus();
});

document.querySelectorAll('.tag-sug').forEach(function(sug) {
    sug.addEventListener('click', function() {
        var tag = this.dataset.tag;
        if (currentTags.indexOf(tag) === -1) {
            currentTags.push(tag);
            renderTags();
        }
    });
});

function renderTags() {
    tagsList.innerHTML = '';
    currentTags.forEach(function(tag, i) {
        var span = document.createElement('span');
        span.className = 'tag-item';
        span.innerHTML = esc(tag) + ' <span class="tag-remove" data-idx="' + i + '"><i class="fa-solid fa-xmark"></i></span>';
        tagsList.appendChild(span);
    });
    document.querySelectorAll('.tag-remove').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            currentTags.splice(parseInt(this.dataset.idx), 1);
            renderTags();
            tagInput.focus();
        });
    });
}


// ===== DISCORD FETCH =====
var fetchBtn = document.getElementById('fetchDiscordBtn');

fetchBtn.addEventListener('click', async function() {
    var idField = document.getElementById('devDiscordId');
    var userId = idField.value.trim();

    if (!userId) {
        showToast('Inserisci un Discord ID', 'error');
        idField.focus();
        return;
    }

    hideDiscordPreview();
    fetchBtn.classList.add('loading');

    try {
        var res = await fetch('/api/discord-user/' + userId);
        var data = await res.json();

        if (data.error) {
            showDiscordError(data.error);
            return;
        }

        // compila i campi
        document.getElementById('devName').value = data.globalName || data.username;
        document.getElementById('devAvatar').value = data.avatar;

        // mostra anteprima
        var preview = document.getElementById('discordPreview');
        document.getElementById('discordPreviewAv').src = data.avatar;
        document.getElementById('discordPreviewName').textContent = data.globalName || data.username;
        document.getElementById('discordPreviewId').textContent = data.id;
        preview.style.display = 'flex';

    } catch(e) {
        showDiscordError('Errore di connessione al server');
    } finally {
        fetchBtn.classList.remove('loading');
    }
});

// anche premi Invio nel campo Discord ID lancia il fetch
document.getElementById('devDiscordId').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        fetchBtn.click();
    }
});

function showDiscordError(msg) {
    var err = document.getElementById('discordError');
    document.getElementById('discordErrorMsg').textContent = msg;
    err.style.display = 'flex';
}

function hideDiscordPreview() {
    document.getElementById('discordPreview').style.display = 'none';
    document.getElementById('discordError').style.display = 'none';
}


// ===== SAVE DEV =====
document.getElementById('saveDevBtn').addEventListener('click', async function() {
    var name = document.getElementById('devName').value.trim();
    var role = document.getElementById('devRole').value.trim();
    var discordId = document.getElementById('devDiscordId').value.trim();
    var avatar = document.getElementById('devAvatar').value.trim();
    var idx = parseInt(document.getElementById('devEditIndex').value);

    if (!name) {
        showToast('Inserisci il nome', 'error');
        return;
    }

    var devObj = {
        name: name,
        role: role || 'Developer',
        discordId: discordId || '',
        avatar: avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
        tags: currentTags.slice()
    };

    if (idx === -1) {
        developers.push(devObj);
    } else {
        developers[idx] = devObj;
    }

    mainData.developers = developers;

    try {
        await saveBin();
        renderDevelopers();
        closeDevModal();
        showToast(idx === -1 ? 'Developer aggiunto' : 'Developer aggiornato', 'success');
    } catch(e) {
        showToast('Errore salvataggio: ' + e.message, 'error');
    }
});

// delete dev
async function deleteDev(idx) {
    var name = developers[idx].name;
    if (!confirm('Eliminare ' + name + '?')) return;
    developers.splice(idx, 1);
    mainData.developers = developers;
    try {
        await saveBin();
        renderDevelopers();
        showToast('Developer eliminato', 'success');
    } catch(e) {
        showToast('Errore: ' + e.message, 'error');
    }
}


// ===== SETTINGS =====
function loadSettings() {
    if (!mainData) return;
    var s = mainData.settings || {};
    document.getElementById('setSiteName').value = s.siteName || '';
    document.getElementById('setSiteDesc').value = s.siteDesc || '';
    document.getElementById('setDiscordLink').value = s.discordLink || '';
    document.getElementById('setAdmins').value = (mainData.admins || []).join(', ');
}

document.getElementById('saveSettingsBtn').addEventListener('click', async function() {
    if (!mainData) return;
    if (!mainData.settings) mainData.settings = {};

    mainData.settings.siteName = document.getElementById('setSiteName').value.trim();
    mainData.settings.siteDesc = document.getElementById('setSiteDesc').value.trim();
    mainData.settings.discordLink = document.getElementById('setDiscordLink').value.trim();

    var adminsStr = document.getElementById('setAdmins').value.trim();
    mainData.admins = adminsStr ? adminsStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];

    try {
        await saveBin();
        showToast('Impostazioni salvate', 'success');
    } catch(e) {
        showToast('Errore: ' + e.message, 'error');
    }
});


// ===== SAVE BIN =====
async function saveBin() {
    var res = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID, {
        method: 'PUT',
        headers: {
            'X-Master-Key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mainData)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}


// ===== TOAST =====
function showToast(msg, type) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2500);
}


// ===== START =====
initUser();