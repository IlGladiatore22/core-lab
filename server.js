const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js'); // <-- AGGIUNTA

const app = express();
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// ========================================================
//  CONFIGURAZIONE
// ========================================================
const DISCORD_CLIENT_ID     = '1518326560321573156';
const DISCORD_CLIENT_SECRET = 'TbXZiKc3IB875PgcCwONjW77c_l47UqK';
const DISCORD_BOT_TOKEN      = 'MTUxODMyNjU2MDMyMTU3MzE1Ng.G8k5ld.tXw81nKXTjtTZzkOc_i9kvOJ0CzLvQe2dUyWqI';
const REDIRECT_URI          = 'http://localhost:3000/callback';
const JSONBIN_ID            = '6a3ad2d7da38895dfef34b4c';
const JSONBIN_KEY           = '$2a$10$qkZpapSrdLMpR4AnUmla1.9sAQsP1yExqViMJHxkzGZdj7ETMeO6S';

// Nella sezione CONFIGURAZIONE, aggiungi:
const DISCORD_GUILD_ID = '1518317193698218035';


// ========================================================
//  CONNESSIONE REALE BOT DISCORD (Per lo stato online)
// ========================================================
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences // Fondamentale per leggere lo stato
    ]
});

discordClient.once('ready', () => {
    console.log('[BOT] Connesso a Discord come ' + discordClient.user.tag);
});

discordClient.login(DISCORD_BOT_TOKEN).catch(err => {
    console.error('[BOT] Errore connessione a Discord:', err.message);
});
// ========================================================


// Nuovo endpoint — aggiungilo prima di app.listen
// API — stato reale utente Discord (online, idle, dnd, offline)
app.get('/api/discord-presence/:id', async (req, res) => {
    const userId = req.params.id;
    
    if (!discordClient.isReady()) {
        return res.json({ status: 'offline' });
    }

    try {
        // Prende lo stato direttamente dalla cache in tempo reale del bot
        const guild = discordClient.guilds.cache.get(DISCORD_GUILD_ID);
        if (!guild) {
            console.error('[PRESENCE] Bot non trovato nel server specificato');
            return res.json({ status: 'offline' });
        }

        // Cerca il membro (forza il fetch se non è in cache)
        const member = await guild.members.fetch(userId).catch(() => null);
        
        if (member && member.presence && member.presence.status) {
            console.log('[PRESENCE] Utente ' + userId + ' è ' + member.presence.status);
            return res.json({ status: member.presence.status });
        }
        
        console.log('[PRESENCE] Utente ' + userId + ' è offline');
        return res.json({ status: 'offline' });
        
    } catch (e) {
        console.error('[PRESENCE] Errore per ' + userId + ': ' + e.message);
        return res.json({ status: 'offline' });
    }
});
// ========================================================


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/html/login.html?error=1');

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
            : 'https://cdn.discordapp.com/embed/avatars/' + (parseInt(u.discriminator) % 5) + '.png';

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
        res.redirect('/html/home.html');

    } catch (err) {
        console.error('Errore OAuth:', err.response ? err.response.data : err.message);
        res.redirect('/html/login.html?error=1');
    }
});


// API — prende info utente Discord per ID
app.get('/api/discord-user/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId || !DISCORD_BOT_TOKEN) {
        return res.json({ error: 'Bot token non configurato' });
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
                : 'https://cdn.discordapp.com/embed/avatars/' + (parseInt(u.discriminator) % 5) + '.png'
        });
    } catch (e) {
        res.json({ error: 'Utente non trovato' });
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('corelab_uid', { path: '/' });
    res.redirect('/html/login.html');
});


app.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});