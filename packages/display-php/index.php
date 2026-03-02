<?php
/**
 * ================================================
 * MASJID DISPLAY — Lightweight PHP Edition
 * Optimized for Chromium 65 / Raspberry Pi 3
 * ================================================
 *
 * INSTANT LOAD SHELL
 * This file only fetches lightweight config data
 * (profile, config, prayer times) and renders the
 * shell immediately. Heavy widgets are loaded
 * asynchronously via HTMX from data_provider.php.
 */

// ── CONFIG ──────────────────────────────────────
$API_BASE = getenv('API_BASE_URL') ?: 'http://localhost:3000/api';
$REFRESH_INTERVAL = 600; // seconds — global hard refresh (10 mins)
$SLIDE_DURATION   = 15000; // ms — JS slider transition interval
$CACHE_DIR = __DIR__ . '/cache';
$CACHE_TTL = 300; // 5 minutes

// ── CACHE HELPERS ───────────────────────────────
if (!is_dir($CACHE_DIR)) {
    @mkdir($CACHE_DIR, 0755, true);
}

function cache_get(string $key): ?array
{
    global $CACHE_DIR, $CACHE_TTL;
    $file = $CACHE_DIR . '/' . md5($key) . '.json';
    if (!file_exists($file)) return null;
    $raw = @file_get_contents($file);
    if ($raw === false) return null;
    $data = json_decode($raw, true);
    return $data;
}

function cache_set(string $key, array $data): void
{
    global $CACHE_DIR;
    $file = $CACHE_DIR . '/' . md5($key) . '.json';
    @file_put_contents($file, json_encode($data), LOCK_EX);
}

// ── HELPER: Fetch JSON from API with Cache ──────
function api_get(string $url): ?array
{
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 5,
            'ignore_errors' => true,
            'header' => "Accept: application/json\r\n"
        ]
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) return null;
    $json = json_decode($raw, true);
    return $json['data'] ?? $json ?? null;
}

function api_get_cached(string $url, string $cacheKey): ?array
{
    $data = api_get($url);
    if ($data !== null) {
        cache_set($cacheKey, $data);
        return $data;
    }
    // Fallback to cached data
    return cache_get($cacheKey);
}

// ── FETCH ONLY LIGHTWEIGHT DATA ─────────────────
$now      = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
$todayStr = $now->format('Y-m-d');
$timeStr  = $now->format('H:i');

// Only fetch the 3 critical endpoints for instant shell
$profile   = api_get_cached("{$API_BASE}/mosque-profile", 'profile');
$config    = api_get_cached("{$API_BASE}/display-config", 'config');
$prayer    = api_get_cached("{$API_BASE}/prayer-times?date={$todayStr}", "prayer_{$todayStr}");

// ── THEME VARIABLES ─────────────────────────────
$themeColor   = $config['themeColor']   ?? '#10b981';
$accentColor  = $config['accentColor']  ?? '#fbbf24';
$labelColor   = $config['labelColor']   ?? '#cbd5e1';
$scaleLabel   = ($config['labelFontSize'] ?? 100) / 100;
$baseFontSize = $config['baseFontSize'] ?? 100;
$fontFamily   = $config['fontFamily']   ?? 'sans';
$runningText  = $config['runningText']  ?? 'MARI RAPATKAN BARISAN, LURUSKAN SHAF, DAN KHUSYUK DALAM BERIBADAH.';
$hijriDate    = $config['cachedHijriDate'] ?? '';

function hexToRgb(string $hex): string
{
    $hex = ltrim($hex, '#');
    if (strlen($hex) === 3) {
        $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    }
    return hexdec(substr($hex,0,2)).', '.hexdec(substr($hex,2,2)).', '.hexdec(substr($hex,4,2));
}

$themePrimaryRgb = hexToRgb($themeColor);

function getFontFamily(string $type): string
{
    if ($type === 'serif') return '"Playfair Display", Georgia, serif';
    if ($type === 'mono')  return 'monospace';
    return 'Inter, ui-sans-serif, system-ui, sans-serif';
}

// ── MOSQUE INFO ─────────────────────────────────
$mosqueName = $profile['name'] ?? 'NAMA MASJID';
$logoUrl    = $profile['logoUrl'] ?? null;
$serverBase = rtrim(str_replace('/api', '', $API_BASE), '/');
if ($logoUrl && !str_starts_with($logoUrl, 'http')) {
    $logoUrl = $serverBase . $logoUrl;
}

// ── PRAYER LOGIC ────────────────────────────────
$prayers = [
    ['name' => 'Shubuh',  'id' => 'fajr',    'time' => $prayer['fajr']    ?? $prayer['subuh']   ?? $prayer['shubuh'] ?? '-'],
    ['name' => 'Dzuhur',  'id' => 'dhuhr',   'time' => $prayer['dhuhr']   ?? $prayer['dzuhur']  ?? '-'],
    ['name' => 'Ashar',   'id' => 'asr',     'time' => $prayer['asr']     ?? $prayer['ashar']   ?? '-'],
    ['name' => 'Maghrib', 'id' => 'maghrib', 'time' => $prayer['maghrib'] ?? '-'],
    ['name' => 'Isya',    'id' => 'isha',    'time' => $prayer['isha']    ?? $prayer['isya']    ?? '-'],
];

function getNextPrayerId(array $prayers, string $currentTime): string
{
    $fajr    = $prayers[0]['time'] !== '-' ? $prayers[0]['time'] : '04:00';
    $dhuhr   = $prayers[1]['time'] !== '-' ? $prayers[1]['time'] : '12:00';
    $asr     = $prayers[2]['time'] !== '-' ? $prayers[2]['time'] : '15:00';
    $maghrib = $prayers[3]['time'] !== '-' ? $prayers[3]['time'] : '18:00';
    $isha    = $prayers[4]['time'] !== '-' ? $prayers[4]['time'] : '19:00';

    if ($currentTime >= $isha)    return 'fajr';
    if ($currentTime >= $maghrib) return 'isha';
    if ($currentTime >= $asr)     return 'maghrib';
    if ($currentTime >= $dhuhr)   return 'asr';
    if ($currentTime >= $fajr)    return 'dhuhr';
    return 'fajr';
}

function getNextPrayerInfo(array $prayers, string $activeId): array
{
    $prayerNames = [
        'fajr'    => 'Subuh',
        'dhuhr'   => 'Dzuhur',
        'asr'     => 'Ashar',
        'maghrib' => 'Maghrib',
        'isha'    => 'Isya',
    ];
    foreach ($prayers as $p) {
        if ($p['id'] === $activeId) {
            return ['name' => $prayerNames[$activeId] ?? $p['name'], 'time' => $p['time']];
        }
    }
    return ['name' => 'Subuh', 'time' => '04:00'];
}

$activeId = getNextPrayerId($prayers, $timeStr);
$nextPrayer = getNextPrayerInfo($prayers, $activeId);

// ── GREGORIAN DATE ──────────────────────────────
$dayNames   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
$monthNames = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
$dayName    = $dayNames[(int)$now->format('w')];
$dateFormatted = $dayName . ', ' . $now->format('d') . ' ' . $monthNames[(int)$now->format('n')] . ' ' . $now->format('Y');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="<?= $REFRESH_INTERVAL ?>">
    <meta name="viewport" content="width=1920">
    <title><?= htmlspecialchars($mosqueName) ?> — Display Masjid</title>
    <meta name="description" content="Tampilan display informasi masjid — jadwal shalat, pengumuman, dan informasi terkini.">
    <!-- HTMX -->
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>

<div
    class="display-canvas"
    style="
        font-family: <?= getFontFamily($fontFamily) ?>;
        font-size: <?= $baseFontSize ?>%;
        --theme-primary: <?= $themeColor ?>;
        --theme-accent: <?= $accentColor ?>;
        --theme-label: <?= $labelColor ?>;
        --scale-label: <?= $scaleLabel ?>;
        --theme-primary-rgb: <?= $themePrimaryRgb ?>;
    "
>
    <!-- Background Glows -->
    <div class="glow-top"></div>
    <div class="glow-bottom-right"></div>
    <div class="glow-bottom-bar"></div>

    <!-- ═══════════════════════════════════════════
         FLOATING PILL CLOCK
         ═══════════════════════════════════════════ -->
    <div class="floating-pill" id="floating-pill">
        <div class="pill-shine"></div>

        <!-- Logo + Mosque Name -->
        <div class="pill-identity">
            <div class="pill-logo-box">
                <?php if ($logoUrl): ?>
                    <img src="<?= htmlspecialchars($logoUrl) ?>" alt="Logo">
                <?php else: ?>
                    <img src="/images/logo1.webp" alt="Logo" onerror="this.style.display='none'">
                <?php endif; ?>
            </div>
            <div>
                <h1 class="pill-mosque-name"><?= htmlspecialchars($mosqueName) ?></h1>
            </div>
        </div>

        <!-- Digital Clock -->
        <div class="pill-clock">
            <span id="clock-hm"><?= $now->format('H:i') ?></span>
            <span class="pill-clock-seconds animate-pulse" id="clock-ss">:<?= $now->format('s') ?></span>
        </div>

        <!-- Dates -->
        <div class="pill-dates">
            <span class="pill-date-gregorian" id="date-gregorian"><?= $dateFormatted ?></span>
            <span class="pill-date-hijri"><?= htmlspecialchars($hijriDate ?: '-') ?></span>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════
         MAIN CONTENT AREA (HTMX ASYNC LOAD)
         ═══════════════════════════════════════════ -->
    <main id="main-content" class="main-content htmx-swapping-target"
          style="padding: 40px 40px 180px 40px;"
          hx-get="data_provider.php?page=0"
          hx-trigger="load"
          hx-swap="outerHTML swap:500ms settle:500ms">
        <!-- Instant placeholder: shows dashboard countdown shell -->
        <div class="slides-container">
            <div class="widget-slide active" style="opacity:1; visibility:visible;">
                <div class="dashboard-countdown">
                    <div class="decor-circle"></div>
                    <div class="dashboard-left">
                        <span class="label-next">Next Prayer</span>
                        <h1 class="prayer-name"><?= htmlspecialchars($nextPrayer['name']) ?></h1>
                        <div class="begins-in">
                            <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Begins in</span>
                        </div>
                    </div>
                    <div class="dashboard-right">
                        <div class="cd-header">
                            <span class="cd-label">Countdown</span>
                            <span class="cd-badge">Menuju Waktu</span>
                        </div>
                        <div class="cd-digits">
                            <div class="cd-digit-box"><div class="digit" id="cd-hours">--</div></div>
                            <div class="cd-digit-box"><div class="digit" id="cd-minutes">--</div></div>
                            <div class="cd-digit-box seconds"><div class="digit" id="cd-seconds">--</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- ═══════════════════════════════════════════
         BOTTOM SECTION
         ═══════════════════════════════════════════ -->
    <div class="bottom-section visible">
        <!-- Prayer Cards -->
        <div class="prayer-cards">
            <div class="glow-under"></div>
            <?php foreach ($prayers as $p): ?>
                <?php $isActive = ($activeId === $p['id']); ?>
                <div class="prayer-card <?= $isActive ? 'active' : '' ?>">
                    <?php if ($isActive): ?>
                        <div class="card-gradient"></div>
                        <div class="card-glow"></div>
                        <div class="card-dot"></div>
                    <?php endif; ?>
                    <h3 class="prayer-label"><?= $p['name'] ?></h3>
                    <p class="prayer-time"><?= htmlspecialchars($p['time']) ?></p>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Running Text Marquee -->
        <div class="marquee-bar">
            <div class="marquee-content">
                <?= htmlspecialchars($runningText) ?>
                <span class="marquee-dot">•</span>
                <?= htmlspecialchars($runningText) ?>
            </div>
        </div>
    </div>

</div>

<!-- ═══════════════════════════════════════════════
     JAVASCRIPT LOGIC
     ═══════════════════════════════════════════════ -->
<script>
    window.MASJID_DATA = {
        nextPrayerTime: "<?= addslashes($nextPrayer['time']) ?>",
        nextPrayerId: "<?= addslashes($activeId) ?>",
        slideDuration: <?= $SLIDE_DURATION ?>
    };
</script>
<script src="main.js"></script>

</body>
</html>
