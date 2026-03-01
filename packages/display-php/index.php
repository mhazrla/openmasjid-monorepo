<?php
/**
 * ================================================
 * MASJID DISPLAY — Lightweight PHP Edition
 * Optimized for Chromium 65 / Raspberry Pi 3
 * ================================================
 *
 * This single file replicates the React StandbyView
 * using pure PHP for data fetching/rendering and
 * minimal vanilla JS for the live clock.
 */

// ── CONFIG ──────────────────────────────────────
$API_BASE = getenv('API_BASE_URL') ?: 'http://localhost:3000/api';
$REFRESH_INTERVAL = 600; // seconds — global hard refresh (10 mins)
$SLIDE_DURATION   = 15000; // ms — JS slider transition interval

// ── HELPER: Fetch JSON from API ─────────────────
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

// ── FETCH DATA ──────────────────────────────────
$now      = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
$todayStr = $now->format('Y-m-d');
$timeStr  = $now->format('H:i');

$profile   = api_get("{$API_BASE}/mosque-profile");
$config    = api_get("{$API_BASE}/display-config");
$prayer    = api_get("{$API_BASE}/prayer-times?date={$todayStr}");
$ramadan   = api_get("{$API_BASE}/ramadan");
$kajianAll = api_get("{$API_BASE}/kajian?status=active&upcoming=true");
$hadith    = api_get("{$API_BASE}/hadis/display");
$finance   = api_get("{$API_BASE}/finance/summary");

// ── THEME VARIABLES ─────────────────────────────
$themeColor   = $config['themeColor']   ?? '#10b981';
$accentColor  = $config['accentColor']  ?? '#fbbf24';
$labelColor   = $config['labelColor']   ?? '#cbd5e1';
$scaleLabel   = ($config['labelFontSize'] ?? 100) / 100;
$baseFontSize = $config['baseFontSize'] ?? 100;
$fontFamily   = $config['fontFamily']   ?? 'sans';
$runningText  = $config['runningText']  ?? 'MARI RAPATKAN BARISAN, LURUSKAN SHAF, DAN KHUSYUK DALAM BERIBADAH.';
$hijriDate    = $config['cachedHijriDate'] ?? '';

// Convert hex to RGB for RGBA usage
function hexToRgb(string $hex): string
{
    $hex = ltrim($hex, '#');
    if (strlen($hex) === 3) {
        $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
    }
    return hexdec(substr($hex,0,2)).', '.hexdec(substr($hex,2,2)).', '.hexdec(substr($hex,4,2));
}

$themePrimaryRgb = hexToRgb($themeColor);

// Font family mapping
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

// Determine next prayer (port of getNextPrayerId)
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

$activeId = getNextPrayerId($prayers, $timeStr);

// Get next prayer name and time for countdown
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

$nextPrayer = getNextPrayerInfo($prayers, $activeId);

// ── GREGORIAN DATE ──────────────────────────────
$dayNames   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
$monthNames = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
$dayName    = $dayNames[(int)$now->format('w')];
$dateFormatted = $dayName . ', ' . $now->format('d') . ' ' . $monthNames[(int)$now->format('n')] . ' ' . $now->format('Y');

// ── EFFECTIVE DATE (for Ramadan: shifts after Maghrib) ──
function getEffectiveDate(DateTime $now, ?string $maghribTime): DateTime
{
    if (!$maghribTime) return clone $now;
    $parts = explode(':', $maghribTime);
    $maghrib = clone $now;
    $maghrib->setTime((int)$parts[0], (int)$parts[1], 0);
    if ($now >= $maghrib) {
        $tomorrow = clone $now;
        $tomorrow->modify('+1 day');
        return $tomorrow;
    }
    return clone $now;
}

$effectiveDate    = getEffectiveDate($now, $prayer['maghrib'] ?? null);
$effectiveDateStr = $effectiveDate->format('Y-m-d');

// ── FORMAT HELPERS ──────────────────────────────
function formatCurrency(int $amount): string
{
    return 'Rp ' . number_format($amount, 0, ',', '.');
}

function formatDateIndo(string $dateStr): string
{
    $months = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    $days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    try {
        $dt = new DateTime($dateStr);
        return $days[(int)$dt->format('w')] . ', ' . $dt->format('d') . ' ' . $months[(int)$dt->format('n')] . ' ' . $dt->format('Y');
    } catch (Exception $e) {
        return '-';
    }
}

function formatDateShort(string $dateStr): string
{
    $months = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    try {
        $dt = new DateTime($dateStr);
        return $dt->format('d') . ' ' . $months[(int)$dt->format('n')];
    } catch (Exception $e) {
        return '-';
    }
}

// ── BUILD SLIDE LIST (port of useSlideData) ─────
$slides = [];

// 1. Kajian events — each gets a slide
if (!empty($kajianAll) && is_array($kajianAll)) {
    foreach ($kajianAll as $event) {
        if (!empty($event['posterUrl'])) {
            $posterUrl = $event['posterUrl'];
            if (!str_starts_with($posterUrl, 'http')) $posterUrl = $serverBase . $posterUrl;
            $slides[] = ['type' => 'poster', 'data' => $event, 'posterUrl' => $posterUrl];
        } else {
            $slides[] = ['type' => 'kajian_event', 'data' => $event];
        }
    }
}

// 2. Ramadan: tarawih_today / kajian_today
if (!empty($ramadan['schedules']) && is_array($ramadan['schedules'])) {
    foreach ($ramadan['schedules'] as $s) {
        $sDate = explode('T', $s['date'] ?? '')[0] ?? '';
        if ($sDate === $effectiveDateStr) {
            if (!empty($s['tarawihImam'])) {
                $s['badalImam'] = $ramadan['badalImamText'] ?? null;
                $slides[] = ['type' => 'tarawih_today', 'data' => $s];
            }
            if (!empty($s['iftarSpeaker'])) {
                $slides[] = ['type' => 'kajian_today', 'data' => $s];
            }
            break;
        }
    }
}

// 3. Finance summary
if (!empty($finance) && isset($finance['totalAssets'])) {
    $slides[] = ['type' => 'finance_summary', 'data' => $finance];
}

// 4. Ramadan schedule table (upcoming days)
if (!empty($ramadan['schedules']) && is_array($ramadan['schedules'])) {
    $upcoming = array_values(array_filter($ramadan['schedules'], function($s) use ($effectiveDateStr) {
        return (explode('T', $s['date'] ?? '')[0] ?? '') >= $effectiveDateStr;
    }));
    usort($upcoming, fn($a, $b) => $a['ramadanDay'] - $b['ramadanDay']);
    if (!empty($upcoming)) {
        $slides[] = ['type' => 'lelang_table', 'data' => $upcoming, 'config' => $ramadan];
    }
}

// 5. Bank info
if (!empty($profile['bankAccountNumber']) || !empty($profile['qrisUrl'])) {
    $qrisUrl = $profile['qrisUrl'] ?? null;
    if ($qrisUrl && !str_starts_with($qrisUrl, 'http')) $qrisUrl = $serverBase . $qrisUrl;
    $slides[] = ['type' => 'bank_info', 'data' => [
        'mosqueName'      => $mosqueName,
        'bankName'        => $profile['bankName'] ?? null,
        'bankAccountName' => $profile['bankAccountName'] ?? null,
        'accountNumber'   => $profile['bankAccountNumber'] ?? null,
        'qrisUrl'         => $qrisUrl,
    ]];
}

// 6. Hadith
if (!empty($hadith) && (!empty($hadith['teksIndo']) || !empty($hadith['teksArab']))) {
    $slides[] = ['type' => 'hadits', 'data' => $hadith];
}

// ── PAGE ROTATION LOGIC ─────────────────────────
$totalSlides = count($slides);
$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 0;
if ($currentPage < 0 || $currentPage >= $totalSlides) $currentPage = 0;
$currentSlide = $totalSlides > 0 ? $slides[$currentPage] : null;
$nextPage = ($totalSlides > 0) ? (($currentPage + 1) % $totalSlides) : 0;

$hiddenOnSlides = ['lelang_table', 'bank_info', 'hadits', 'kajian_event', 'poster'];
$hideBottom = false;
if ($currentSlide) {
    $hideBottom = in_array($currentSlide['type'], $hiddenOnSlides);
}

$isMenuVisible = !$hideBottom;

// ── WIDGET RENDER FUNCTIONS ─────────────────────

function render_dashboard_countdown(array $nextPrayer): string
{
    $name = htmlspecialchars($nextPrayer['name']);
    return <<<HTML
    <div class="dashboard-countdown">
        <div class="decor-circle"></div>
        <div class="dashboard-left">
            <span class="label-next">Next Prayer</span>
            <h1 class="prayer-name">{$name}</h1>
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
HTML;
}

function render_kajian_event(array $data): string
{
    $title   = htmlspecialchars($data['title'] ?? 'Judul Kajian');
    $speaker = htmlspecialchars(is_array($data['speaker'] ?? null) ? ($data['speaker']['name'] ?? 'Belum Ditentukan') : ($data['speaker'] ?? 'Belum Ditentukan'));
    $type    = $data['type'] ?? 'kajian_rutin';
    $isRutin = ($type === 'kajian_rutin');
    $badgeClass = $isRutin ? 'badge-primary' : 'badge-secondary';
    $badgeText  = $isRutin ? 'KAJIAN RUTIN' : strtoupper(str_replace('_', ' ', $type));
    
    // Date
    $dateRaw = $data['date'] ?? $data['displayDate'] ?? $data['dateRaw'] ?? '';
    $dateStr = $dateRaw ? formatDateIndo($dateRaw) : '-';
    
    // Time
    $timeMode  = $data['timeMode'] ?? 'manual';
    $badaSholat = $data['badaSholat'] ?? '';
    $time       = $data['time'] ?? '';
    if ($timeMode === 'bada_sholat' && $badaSholat) {
        $timeStr = "Ba'da " . ucfirst(htmlspecialchars($badaSholat));
    } elseif ($time) {
        $timeStr = htmlspecialchars($time) . ' WIB';
    } elseif ($dateRaw) {
        try {
            $dt = new DateTime($dateRaw);
            $timeStr = $dt->format('H:i') . ' WIB';
        } catch (Exception $e) {
            $timeStr = '-';
        }
    } else {
        $timeStr = '-';
    }

    return <<<HTML
    <div class="widget-kajian-noposter">
        <div class="kajian-glow-tr"></div>
        <div class="kajian-glow-bl"></div>
        <div class="kajian-inner">
            <span class="kajian-badge {$badgeClass}">{$badgeText}</span>
            <h1 class="kajian-title">{$title}</h1>
            <div class="kajian-speaker-box">
                <div class="kajian-speaker-box-shine"></div>
                <div class="kajian-speaker-label-row">
                    <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--theme-accent)">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span class="kajian-speaker-label">Pemateri</span>
                </div>
                <p class="kajian-speaker-name">{$speaker}</p>
            </div>
            <div class="kajian-divider"></div>
            <div class="kajian-info-grid">
                <div class="kajian-info-card">
                    <div class="kajian-info-icon-row">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--theme-primary)">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span class="kajian-info-label">Tanggal</span>
                    </div>
                    <p class="kajian-info-value">{$dateStr}</p>
                </div>
                <div class="kajian-info-card">
                    <div class="kajian-info-icon-row">
                        <svg class="icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--theme-primary)">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span class="kajian-info-label">Waktu</span>
                    </div>
                    <p class="kajian-info-value">{$timeStr}</p>
                </div>
            </div>
        </div>
    </div>
HTML;
}

function render_poster(array $data, string $posterUrl): string
{
    $title = htmlspecialchars($data['title'] ?? '');
    $url   = htmlspecialchars($posterUrl);
    return <<<HTML
    <div class="widget-poster">
        <img src="{$url}" alt="{$title}" class="poster-img">
    </div>
HTML;
}

function render_hadits(array $data): string
{
    $arabic  = htmlspecialchars($data['teksArab'] ?? '');
    $text    = htmlspecialchars($data['teksIndo'] ?? '');
    $source  = htmlspecialchars($data['takhrij'] ?? 'Hadits');
    $arabicHtml = $arabic ? '<h1 class="hadits-arabic" dir="rtl">' . $arabic . '</h1>' : '';
    return <<<HTML
    <div class="widget-hadits">
        <div class="hadits-quote-bg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="700" height="700">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
        </div>
        <div class="hadits-content">
            {$arabicHtml}
            <div class="hadits-text-section">
                <p class="hadits-text">"{$text}"</p>
                <div class="hadits-source">{$source}</div>
            </div>
        </div>
    </div>
HTML;
}

function render_finance(array $data): string
{
    $totalAssets  = (int)($data['totalAssets']  ?? 0);
    $totalIncome  = (int)($data['totalIncome']  ?? 0);
    $totalExpense = (int)($data['totalExpense'] ?? 0);
    $isNegative   = $totalAssets < 0;
    $lastUpdated  = $data['lastUpdated'] ?? null;
    $fmtDate = '-';
    if ($lastUpdated) {
        try {
            $months = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            $dt = new DateTime($lastUpdated);
            $fmtDate = $dt->format('d') . ' ' . $months[(int)$dt->format('n')] . ' ' . $dt->format('Y H:i');
        } catch (Exception $e) { /* skip */ }
    }
    $kasClass  = $isNegative ? 'kas-negative' : 'kas-positive';
    $kasAmount = formatCurrency($totalAssets);
    $incAmount = formatCurrency($totalIncome);
    $expAmount = formatCurrency($totalExpense);
    return <<<HTML
    <div class="widget-finance">
        <div class="finance-glow"></div>
        <div class="finance-header">
            <div class="finance-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-lg" style="color:var(--theme-primary)">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            </div>
            <div>
                <h2 class="finance-title">Laporan Keuangan <span style="color:var(--theme-primary)">Masjid</span></h2>
                <p class="finance-updated">Terakhir update: <span class="text-white">{$fmtDate}</span></p>
            </div>
        </div>
        <div class="finance-cards">
            <div class="finance-card">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="finance-card-icon icon-income">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
                <p class="finance-card-label">Pemasukan</p>
                <p class="finance-card-amount">{$incAmount}</p>
            </div>
            <div class="finance-card-center {$kasClass}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="finance-card-icon-lg" style="color:var(--theme-primary)">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                </svg>
                <p class="finance-center-label">Saldo Kas</p>
                <p class="finance-center-amount">{$kasAmount}</p>
            </div>
            <div class="finance-card">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="finance-card-icon icon-expense">
                    <line x1="17" y1="7" x2="7" y2="17"></line>
                    <polyline points="17 17 7 17 7 7"></polyline>
                </svg>
                <p class="finance-card-label">Pengeluaran</p>
                <p class="finance-card-amount">{$expAmount}</p>
            </div>
        </div>
    </div>
HTML;
}

function render_tarawih(array $data, ?array $ramadanConfig): string
{
    $imamName  = htmlspecialchars($data['tarawihImam']['name'] ?? 'Belum Ditentukan');
    $badalImam = htmlspecialchars($data['badalImam'] ?? 'Belum Ditentukan');
    $day       = (int)($data['ramadanDay'] ?? 0);
    $hijriYear = $ramadanConfig['hijriYear'] ?? '1447';
    $title     = htmlspecialchars($ramadanConfig['title'] ?? 'Tarawih');
    return <<<HTML
    <div class="widget-tarawih">
        <div class="tarawih-left">
            <div class="tarawih-pattern"></div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tarawih-moon-icon">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <h2 class="tarawih-title">{$title}</h2>
            <span class="tarawih-year">{$hijriYear} Hijriah</span>
        </div>
        <div class="tarawih-right">
            <div class="tarawih-meta">
                <span class="tarawih-tonight-badge">Malam Ini</span>
                <span class="tarawih-day-label">Ramadhan Ke-{$day}</span>
            </div>
            <h1 class="tarawih-imam-name">{$imamName}</h1>
            <div class="tarawih-badal-box">
                <span class="tarawih-badal-label">Badal Imam</span>
                <h3 class="tarawih-badal-name">{$badalImam}</h3>
            </div>
        </div>
    </div>
HTML;
}

function render_ramadan_table(array $upcoming, ?array $config, string $effectiveDateStr): string
{
    $displayed = array_slice($upcoming, 0, 2);
    $title = htmlspecialchars($config['title'] ?? 'PROGRAM RAMADHAN');
    $rows  = '';
    foreach ($displayed as $row) {
        $sDate     = explode('T', $row['date'] ?? '')[0] ?? '';
        $isToday   = ($sDate === $effectiveDateStr);
        $rowClass  = $isToday ? 'ramadan-row today' : 'ramadan-row';
        $day       = (int)($row['ramadanDay'] ?? 0);
        $dateShort = formatDateShort($row['date'] ?? '');
        $dayFont   = $isToday ? 'day-today' : 'day-normal';
        $dateColor = $isToday ? 'date-today' : 'date-normal';

        // Iftar badge
        $iftarHtml = render_auction_badge($row['iftarTarget'] ?? 0, $row['iftarCurrent'] ?? 0);
        // Itikaf badge — only show for last 10 days
        $isLast10  = ($day >= 21);
        $itikafHtml = render_auction_badge($row['itikafTarget'] ?? 0, $row['itikafCurrent'] ?? 0, !$isLast10);

        $rows .= <<<ROW
        <div class="{$rowClass}">
            <div class="ramadan-col-day">
                <span class="{$dayFont}">{$day}</span>
                <span class="{$dateColor}">{$dateShort}</span>
            </div>
            <div class="ramadan-col-badge">{$iftarHtml}</div>
            <div class="ramadan-col-badge">{$itikafHtml}</div>
        </div>
ROW;
    }

    return <<<HTML
    <div class="widget-ramadan-table">
        <div class="ramadan-header">
            <div class="ramadan-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-lg" style="color:var(--theme-primary)">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
            </div>
            <div>
                <h2 class="ramadan-table-title">{$title}</h2>
                <span class="ramadan-table-subtitle">LAPORAN KEBUTUHAN IFTHOR &amp; SAHUR</span>
            </div>
        </div>
        <div class="ramadan-col-header">
            <div class="ramadan-col-day-h">MALAM</div>
            <div class="ramadan-col-badge-h">PAKET BUKA PUASA</div>
            <div class="ramadan-col-badge-h">SAHUR I'TIKAF</div>
        </div>
        <div class="ramadan-rows">{$rows}</div>
    </div>
HTML;
}

function render_auction_badge(int $target, int $current, bool $disabled = false): string
{
    if ($disabled) {
        return '<div class="auction-badge disabled"><span class="auction-dash">-</span></div>';
    }
    $shortage = $target - $current;
    $isOpen = $current < $target;
    $cls = $isOpen ? 'auction-badge open' : 'auction-badge fulfilled';
    $statusText = $isOpen ? '❌ OPEN' : '✅ TERPENUHI';
    $shortageHtml = $isOpen ? '<div class="auction-shortage">KURANG: '.$shortage.'</div>' : '';
    return <<<HTML
    <div class="{$cls}">
        <span class="auction-status">{$statusText}</span>
        <div class="auction-count"><span class="auction-current">{$current}</span> <span class="auction-total">/ {$target}</span></div>
        {$shortageHtml}
    </div>
HTML;
}

function render_bank_info(array $data): string
{
    $accNum   = htmlspecialchars($data['accountNumber'] ?? '-');
    $bankName = htmlspecialchars($data['bankName'] ?? 'BANK');
    $accName  = htmlspecialchars($data['bankAccountName'] ?? $data['mosqueName'] ?? '');
    $qrisUrl  = $data['qrisUrl'] ?? null;

    $qrisHtml = '';
    if ($qrisUrl) {
        $qUrl = htmlspecialchars($qrisUrl);
        $qrisHtml = '<div class="bank-qris"><img src="'.$qUrl.'" alt="QRIS"></div>';
    }
    $infoClass = $qrisUrl ? 'bank-info-content has-qris' : 'bank-info-content full-width';

    return <<<HTML
    <div class="widget-bank-info">
        {$qrisHtml}
        <div class="{$infoClass}">
            <h2 class="bank-title">Infaq / Shodaqoh</h2>
            <div class="bank-details">
                <div class="bank-row">
                    <p class="bank-label">No. Rekening</p>
                    <p class="bank-account-number">{$accNum}</p>
                </div>
                <div class="bank-separator"></div>
                <div class="bank-row">
                    <p class="bank-name">{$bankName}</p>
                    <p class="bank-account-name">A.N {$accName}</p>
                </div>
            </div>
        </div>
    </div>
HTML;
}

// ── RENDER THE CURRENT WIDGET SLIDE ─────────────
$widgetInnerHtml = '';
if ($currentSlide === null) {
    $widgetInnerHtml = render_dashboard_countdown($nextPrayer);
} else {
    switch ($currentSlide['type']) {
        case 'kajian_event':    $widgetInnerHtml = render_kajian_event($currentSlide['data']); break;
        case 'poster':          $widgetInnerHtml = render_poster($currentSlide['data'], $currentSlide['posterUrl']); break;
        case 'hadits':          $widgetInnerHtml = render_hadits($currentSlide['data']); break;
        case 'finance_summary': $widgetInnerHtml = render_finance($currentSlide['data']); break;
        case 'tarawih_today':   $widgetInnerHtml = render_tarawih($currentSlide['data'], $ramadan); break;
        case 'kajian_today':    $widgetInnerHtml = render_kajian_event($currentSlide['data']); break;
        case 'lelang_table':    $widgetInnerHtml = render_ramadan_table($currentSlide['data'], $currentSlide['config'] ?? null, $effectiveDateStr); break;
        case 'bank_info':       $widgetInnerHtml = render_bank_info($currentSlide['data']); break;
        default:                $widgetInnerHtml = render_dashboard_countdown($nextPrayer);
    }
}

$widgetHtml = '<div class="widget-slide active" style="opacity:1; visibility:visible;">' . $widgetInnerHtml . '</div>';

// ── MAIN CONTENT PADDING (shrink for bottom bar) ──
$mainPadding = $isMenuVisible ? 'padding: 40px 40px 180px 40px;' : 'padding: 40px;';
$bottomClass = $isMenuVisible ? 'bottom-section visible' : 'bottom-section hidden';
$htmxUrl = "?page=" . $nextPage;

$isHtmx = isset($_SERVER['HTTP_HX_REQUEST']);

if ($isHtmx) {
    header('HX-Trigger: {"widgetChanged": {"hideBottom": ' . ($hideBottom ? 'true' : 'false') . '}}');
    
    echo <<<HTML
    <main id="main-content" class="main-content htmx-swapping-target" style="{$mainPadding}"
          hx-get="{$htmxUrl}"
          hx-trigger="every {$SLIDE_DURATION}ms"
          hx-swap="outerHTML swap:500ms settle:500ms">
        <div class="slides-container">{$widgetHtml}</div>
    </main>
HTML;
    exit;
}
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
    <?php if ($isMenuVisible): ?><div class="glow-bottom-bar"></div><?php endif; ?>

    <!-- ═══════════════════════════════════════════
         FLOATING PILL CLOCK
         ═══════════════════════════════════════════ -->
    <div class="floating-pill <?= $isMenuVisible ? '' : 'pill-hidden' ?>" id="floating-pill">
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
         MAIN CONTENT AREA (HTMX TARGET)
         ═══════════════════════════════════════════ -->
    <main id="main-content" class="main-content htmx-swapping-target" style="<?= $mainPadding ?>"
          hx-get="<?= $htmxUrl ?>"
          hx-trigger="every <?= $SLIDE_DURATION ?>ms delay:<?= $SLIDE_DURATION ?>ms"
          hx-swap="outerHTML swap:500ms settle:500ms">
        <div class="slides-container"><?= $widgetHtml ?></div>
    </main>

    <!-- ═══════════════════════════════════════════
         BOTTOM SECTION
         ═══════════════════════════════════════════ -->
    <div class="<?= $bottomClass ?>">
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
