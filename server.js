const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// ========================================================
//  CONFIGURAZIONE
// ========================================================
const DISCORD_CLIENT_ID     = '1518326560321573156';
const DISCORD_CLIENT_SECRET = 'TbXZiKc3IB875PgcCwONjW77c_l47UqK';

// ========================================================
//  ⬇️⬇️⬇️  METTI QUI IL TUO BOT TOKEN VERO  ⬇️⬇️⬇️
// ========================================================
const DISCORD_BOT_TOKEN      = 'MTUxODMyNjU2MDMyMTU3MzE1Ng.G9Xxso.pSNulD82bBUvappw3LxjbMF8KYPyifmE7lDnAM';
// ========================================================
//  ⬆️⬆️⬆️  DEVE INIZIARE CON MT E AVERE DUE PUNTI  ⬆️⬆️⬆️
// ========================================================

const REDIRECT_URI          = 'https://core-lab.onrender.com/callback';
const JSONBIN_ID            = '6a3ad2d7da38895dfef34b4c';
const JSONBIN_KEY           = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';
const DISCORD_GUILD_ID      = '1518317193698218035';


// ========================================================
//  CONNESSIONE BOT DISCORD
// ========================================================
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

discordClient.once('ready', () => {
    console.log('[BOT] Connesso a Discord come ' + discordClient.user.tag);
});

discordClient.login(DISCORD_BOT_TOKEN).catch(err => {
    console.error('[BOT] Errore connessione a Discord:', err.message);
});


// API — stato reale utente Discord
app.get('/api/discord-presence/:id', async (req, res) => {
    const userId = req.params.id;
    if (!discordClient.isReady()) return res.json({ status: 'offline' });

    try {
        const guild = discordClient.guilds.cache.get(DISCORD_GUILD_ID);
        if (!guild) return res.json({ status: 'offline' });
        const member = await guild.members.fetch(userId).catch(() => null);
        
        if (member && member.presence && member.presence.status) {
            return res.json({ status: member.presence.status });
        }
        return res.json({ status: 'offline' });
    } catch (e) {
        return res.json({ status: 'offline' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('https://ilgladiatore22.github.io/core-lab/html/login.html?error=1');

    try {
        const tokenRes = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: 'Bearer ' + tokenRes.data.access_token }
        });

        const u = userRes.data;
        const avatarUrl = u.avatar
            ? 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png'
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        const binRes = await axios.get('https://api.jsonbin.io/v3/b/' + JSONBIN_ID + '/latest', {
            headers: { 'X-Master-Key': JSONBIN_KEY }
        });

        const data = binRes.data.record;
        const idx = data.users.findIndex(function(user) { return user.id === u.id; });

        if (idx === -1) {
            data.users.push({
                id: u.id,
                username: u.username,
                globalName: u.global_name || u.username,
                avatar: avatarUrl,
                firstLogin: Date.now(),
                lastLogin: Date.now(),
                purchases: 0
            });
            data.stats.totalUsers = (data.stats.totalUsers || 0) + 1;
            data.recentActivity.unshift({
                username: u.global_name || u.username,
                avatar: avatarUrl,
                action: 'è entrato nel server',
                type: 'join',
                timestamp: Date.now()
            });
            if (data.recentActivity.length > 20) data.recentActivity = data.recentActivity.slice(0, 20);
        } else {
            data.users[idx].lastLogin = Date.now();
            data.users[idx].avatar = avatarUrl;
            data.users[idx].username = u.username;
            data.users[idx].globalName = u.global_name || u.username;
        }

        await axios.put('https://api.jsonbin.io/v3/b/' + JSONBIN_ID, data, {
            headers: { 'X-Master-Key': JSONBIN_KEY, 'Content-Type': 'application/json' }
        });

        res.cookie('corelab_uid', u.id, { maxAge: 7*24*60*60*1000, path: '/', sameSite: 'Lax' });
        res.redirect('https://ilgladiatore22.github.io/core-lab/index.html?uid=' + u.id);

    } catch (err) {
        console.error('Errore OAuth:', err.response ? err.response.data : err.message);
        res.redirect('https://ilgladiatore22.github.io/core-lab/html/login.html?error=1');
    }
});


// API — prende info utente Discord per ID
app.get('/api/discord-user/:id', async (req, res) => {
    const userId = req.params.id;

    if (DISCORD_BOT_TOKEN === 'METTI_QUI_IL_TOKEN_VERO') {
        return res.status(500).json({ error: 'Hai dimenticato di mettere il token nel server.js!' });
    }

    try {
        const userRes = await axios.get('https://discord.com/api/users/' + userId, {
            headers: { Authorization: 'Bot ' + DISCORD_BOT_TOKEN }
        });
        const u = userRes.data;
        res.json({
            id: u.id,
            username: u.username,
            globalName: u.global_name || u.username,
            avatar: u.avatar
                ? 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png'
                : 'https://cdn.discordapp.com/embed/avatars/0.png'
        });
    } catch (e) {
        var status = e.response ? e.response.status : 0;
        if (status === 404) {
            return res.status(404).json({ error: 'Utente Discord non trovato (ID errato?)' });
        }
        if (status === 401) {
            return res.status(500).json({ error: 'Bot Token invalido!' });
        }
        console.error('[Discord User Error]', status, e.message);
        res.status(500).json({ error: 'Errore Discord: ' + status + ' - ' + (e.message || 'sconosciuto') });
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('corelab_uid', { path: '/' });
    res.redirect('https://ilgladiatore22.github.io/core-lab/html/login.html');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server avviato sulla porta ' + PORT);
});
