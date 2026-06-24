var BIN_ID  = '6a3ad2d7da38895dfef34b4c';
var API_KEY = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
var BIN_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';


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


// ===== START =====
initUser();