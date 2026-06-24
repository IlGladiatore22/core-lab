(function () {
    var bar = document.getElementById('bar');
    var glow = document.getElementById('barGlow');
    var pct = document.getElementById('pct');
    var msg = document.getElementById('msg');
    var wrap = document.getElementById('loader');

    var steps = [
        { at: 0, text: 'Connessione...' },
        { at: 12, text: 'Verifica dei file.' },
        { at: 30, text: 'Caricamento dei moduli.' },
        { at: 52, text: "Costruzione dell'interfaccia." },
        { at: 74, text: 'Quasi pronto il tutto.' },
        { at: 91, text: 'Pronto.' }
    ];

    var progress = 0;
    var speed = 1;

    function tick() {
        if (progress < 25) speed = Math.random() * 1.6 + 0.4;
        else if (progress < 65) speed = Math.random() * 2.2 + 0.7;
        else if (progress < 88) speed = Math.random() * 1.0 + 0.3;
        else speed = Math.random() * 0.4 + 0.1;

        progress = Math.min(100, progress + speed);

        var rounded = Math.round(progress);
        bar.style.width = rounded + "%";
        glow.style.left = 'calc(' + rounded + '% - 4px)';
        pct.textContent = rounded + '%';

        for (var i = steps.length - 1; i >= 0; i--) {
            if (rounded >= steps[i].at) {
                msg.textContent = steps[i].text;
                break;
            }
        }

        if (progress >= 100) {
            setTimeout(function () {
                wrap.classList.add('out');
                setTimeout(function () {
                    window.location.href = 'html/login.html';
                }, 700);
            }, 500);
            return;
        }

        requestAnimationFrame(tick);
    }

    setTimeout(tick, 400);
})();