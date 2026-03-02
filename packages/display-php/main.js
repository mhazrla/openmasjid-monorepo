// ============================================
// MASJID DISPLAY — Lightweight PHP Edition
// Pure Vanilla JS Logic
// ============================================

(function() {
    var nextPrayerTime = window.MASJID_DATA.nextPrayerTime;
    var nextPrayerId   = window.MASJID_DATA.nextPrayerId;
    var slideDuration  = window.MASJID_DATA.slideDuration;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    var dayNames   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    var monthNames = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    // --- 1. CLOCK & COUNTDOWN ---
    function updateClock() {
        var now = new Date();
        var hm  = pad(now.getHours()) + ':' + pad(now.getMinutes());
        var ss  = ':' + pad(now.getSeconds());
        
        var elHM = document.getElementById('clock-hm');
        var elSS = document.getElementById('clock-ss');
        if (elHM) elHM.textContent = hm;
        if (elSS) elSS.textContent = ss;

        var elDate = document.getElementById('date-gregorian');
        if (elDate) {
            var dn = dayNames[now.getDay()];
            elDate.textContent = dn + ', ' + pad(now.getDate()) + ' ' + monthNames[now.getMonth() + 1] + ' ' + now.getFullYear();
        }

        // Countdown Logic
        var elH = document.getElementById('cd-hours');
        var elM = document.getElementById('cd-minutes');
        var elS = document.getElementById('cd-seconds');
        if (elH && nextPrayerTime && nextPrayerTime !== '-') {
            var parts = nextPrayerTime.split(':');
            var target = new Date(now);
            target.setHours(parseInt(parts[0],10), parseInt(parts[1],10), 0, 0);
            
            // If it's night and next is Fajr, date is tomorrow
            if (nextPrayerId === 'fajr' && now.getHours() >= 19) {
                target.setDate(target.getDate() + 1);
            }
            
            var diff = Math.floor((target.getTime() - now.getTime()) / 1000);
            if (diff < 0) diff = 0;
            
            elH.textContent = pad(Math.floor(diff / 3600));
            elM.textContent = pad(Math.floor((diff % 3600) / 60));
            elS.textContent = pad(diff % 60);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // --- 2. LAYOUT SCALING (Fixed 1920x1080) ---
    function scaleLayout() {
        var canvas = document.querySelector('.display-canvas');
        if (!canvas) return;
        var scaleX = window.innerWidth / 1920;
        var scaleY = window.innerHeight / 1080;
        var scale = Math.min(scaleX, scaleY);
        canvas.style.webkitTransform = 'scale(' + scale + ')';
        canvas.style.transform = 'scale(' + scale + ')';
        canvas.style.webkitTransformOrigin = 'center center';
        canvas.style.transformOrigin = 'center center';
    }
    
    window.addEventListener('resize', scaleLayout);
    scaleLayout(); // Initial run

    // --- 3. HTMX WIDGET CHANGED EVENT ---
    document.body.addEventListener('widgetChanged', function(evt) {
        var hideBottom = evt.detail.hideBottom;
        var bottomSec = document.querySelector('.bottom-section');
        var topPill = document.getElementById('floating-pill');

        if (hideBottom) {
            if (bottomSec) { bottomSec.classList.remove('visible'); bottomSec.classList.add('hidden'); }
            if (topPill) { topPill.classList.add('pill-hidden'); }
        } else {
            if (bottomSec) { bottomSec.classList.remove('hidden'); bottomSec.classList.add('visible'); }
            if (topPill) { topPill.classList.remove('pill-hidden'); }
        }
    });

    // --- 4. RE-RUN SCALE AFTER HTMX SWAP ---
    // HTMX may change DOM layout, recalculate scale after each swap
    document.body.addEventListener('htmx:afterSwap', function() {
        scaleLayout();
    });
})();
