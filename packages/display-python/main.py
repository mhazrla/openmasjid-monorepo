import sys
import os
import requests
import time
from datetime import datetime, timedelta
from dateutil import parser
from PySide2.QtCore import (
    Qt, QTimer, QThread, Signal, QPropertyAnimation, 
    QEasingCurve, QRect, QPoint, QSize
)
from PySide2.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QStackedWidget, QGraphicsOpacityEffect, QGraphicsDropShadowEffect,
    QSizePolicy, QFrame, QGraphicsScene, QGraphicsView, QGraphicsProxyWidget
)
from PySide2.QtGui import QFont, QFontDatabase, QColor, QPalette, QTransform, QPainter

# --- CONSTANTS ---
API_BASE_URL = os.getenv('API_BASE_URL', 'http://192.168.1.7:3000/api')
REFRESH_INTERVAL_MS = 30000       # Poll API every 30s as requested
SLIDE_DURATION_MS   = 15000       # Carousel rotation every 15s
BASE_WIDTH  = 1920
BASE_HEIGHT = 1080

# --- THEME STYLES (QSS) ---
# Emulate the CSS utility classes from the web version
STYLESHEET = """
QWidget {
    font-family: 'Inter', sans-serif;
}
"""

def hex_to_rgba(hex_color, alpha_pct):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    else:
        r, g, b = 16, 185, 129 # default emerald
    return f"rgba({r}, {g}, {b}, {alpha_pct})"

# --- BACKGROUND DATA FETCHER THREAD ---
class DataFetcherThread(QThread):
    data_fetched = Signal(dict)
    
    def run(self):
        while True:
            try:
                endpoints = {
                    'profile': f"{API_BASE_URL}/mosque-profile",
                    'config': f"{API_BASE_URL}/display-config",
                    'prayer': f"{API_BASE_URL}/prayer-times?date={datetime.now().strftime('%Y-%m-%d')}",
                    'kajian': f"{API_BASE_URL}/kajian?status=active&upcoming=true",
                    'hadith': f"{API_BASE_URL}/hadis/display",
                }
                results = {}
                for key, url in endpoints.items():
                    try:
                        resp = requests.get(url, timeout=5)
                        if resp.status_code == 200:
                            data = resp.json()
                            results[key] = data.get('data', data)
                    except Exception as e:
                        print(f"Error fetching {key}: {e}")
                self.data_fetched.emit(results)
            except Exception as e:
                print(f"Critical Data Fetch Error: {e}")
                
            time.sleep(REFRESH_INTERVAL_MS / 1000.0)

# --- UTILITY COMPONENTS ---
class GlowingCard(QFrame):
    """A card with RGBA background representing the CSS 'glass' cards."""
    def __init__(self, bg_color="#0f172a", border_color="#1e293b", alpha=0.8, glow_color="#000000"):
        super().__init__()
        # Inner border effect via border-top
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {hex_to_rgba(bg_color, alpha)};
                border: 1px solid {border_color};
                border-top: 1px solid rgba(255,255,255,0.1);
                border-radius: 24px;
            }}
        """)
        
        # Drop shadow effect (glow)
        self.shadow = QGraphicsDropShadowEffect(self)
        self.shadow.setBlurRadius(40)
        self.shadow.setXOffset(0)
        self.shadow.setYOffset(10)
        self.shadow.setColor(QColor(glow_color))
        self.setGraphicsEffect(self.shadow)

class GradientLine(QFrame):
    """A vertical separator using QLinearGradient."""
    def __init__(self):
        super().__init__()
        self.setFixedWidth(2)
        self.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1, 
                                            stop:0 rgba(255,255,255,0), 
                                            stop:0.5 rgba(255,255,255,0.2), 
                                            stop:1 rgba(255,255,255,0));
                border: none;
            }
        """)

# --- MARQUEE (SMOOTH TICKER) ---
class SmoothMarquee(QWidget):
    def __init__(self, text, parent=None):
        super().__init__(parent)
        self.text = text
        self.offset = 0
        
        # High frequency timer for smooth 60fps scrolling
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_offset)
        self.timer.start(16) # ~60fps
        
        self.font = QFont("Inter", 32, QFont.Bold)
        self.setFixedHeight(80)

    def set_text(self, text):
        self.text = text

    def update_offset(self):
        self.offset += 2 # speed
        self.update() # triggers paintEvent

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setFont(self.font)
        painter.setPen(QColor("white"))
        
        fm = painter.fontMetrics()
        text_width = fm.horizontalAdvance(self.text + " • ")
        
        # Reset offset to loop seamlessly
        if self.offset >= text_width:
            self.offset = 0
            
        x = -self.offset
        y = (self.height() + fm.ascent() - fm.descent()) // 2
        
        # Draw text repeatedly to fill the width
        while x < self.width():
            painter.drawText(x, y, self.text + " • ")
            x += text_width

# --- BOTTOM PRAYER CARDS ---
class PrayerCardsWidget(QFrame):
    def __init__(self):
        super().__init__()
        self.setFixedHeight(180)
        self.layout = QHBoxLayout(self)
        self.layout.setContentsMargins(40, 20, 40, 20)
        self.layout.setSpacing(20)
        self.setStyleSheet("background: transparent;")
        
        self.cards = {}
        # We need a stretchable layout to mimic grid-cols-5. 
        # Using QHBoxLayout with stretch factors works well.
        for pid, name in [('fajr','Subuh'), ('dhuhr','Dzuhur'), ('asr','Ashar'), ('maghrib','Maghrib'), ('isha','Isya')]:
            card = GlowingCard(bg_color="#000000", border_color="#334155", alpha=0.5)
            clayout = QVBoxLayout(card)
            clayout.setAlignment(Qt.AlignCenter)
            
            lbl_name = QLabel(name)
            lbl_name.setStyleSheet("font-size: 24px; color: #94a3b8; border: none; background: transparent;")
            lbl_name.setAlignment(Qt.AlignCenter)
            
            lbl_time = QLabel("--:--")
            lbl_time.setStyleSheet("font-size: 48px; font-weight: bold; color: white; border: none; background: transparent;")
            lbl_time.setAlignment(Qt.AlignCenter)
            
            clayout.addWidget(lbl_name)
            clayout.addWidget(lbl_time)
            
            # Equal stretch factor for grid-cols-5 mimicking
            self.layout.addWidget(card, stretch=1)
            self.cards[pid] = {'widget': card, 'name': lbl_name, 'time': lbl_time}

    def update_data(self, prayer_data, active_id, theme_color):
        if not prayer_data:
            return
            
        mapping = [
            ('fajr', prayer_data.get('subuh', '--:--')),
            ('dhuhr', prayer_data.get('dzuhur', '--:--')),
            ('asr', prayer_data.get('ashar', '--:--')),
            ('maghrib', prayer_data.get('maghrib', '--:--')),
            ('isha', prayer_data.get('isya', '--:--'))
        ]
        
        active_rgb = hex_to_rgba(theme_color, 0.4)
        active_border = theme_color
        
        for pid, time_str in mapping:
            if pid in self.cards:
                self.cards[pid]['time'].setText(time_str)
                if pid == active_id:
                    self.cards[pid]['widget'].setStyleSheet(f"""
                        QFrame {{
                            background-color: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 {active_rgb}, stop:1 rgba(0,0,0,0));
                            border: 1px solid {active_border};
                            border-radius: 24px;
                        }}
                    """)
                    self.cards[pid]['widget'].shadow.setColor(QColor(theme_color))
                    self.cards[pid]['widget'].shadow.setBlurRadius(60)
                    self.cards[pid]['name'].setStyleSheet("font-size: 24px; color: white; font-weight: bold; border: none; background: transparent;")
                else:
                    self.cards[pid]['widget'].setStyleSheet(f"""
                        QFrame {{
                            background-color: rgba(0,0,0,0.5);
                            border: 1px solid #334155;
                            border-top: 1px solid rgba(255,255,255,0.05);
                            border-radius: 24px;
                        }}
                    """)
                    self.cards[pid]['widget'].shadow.setColor(QColor("#000000"))
                    self.cards[pid]['widget'].shadow.setBlurRadius(40)
                    self.cards[pid]['name'].setStyleSheet("font-size: 24px; color: #94a3b8; border: none; background: transparent;")

# --- SLIDE: DASHBOARD COUNTDOWN ---
class DashboardCountdownWidget(QWidget):
    def __init__(self):
        super().__init__()
        layout = QHBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(100)
        
        # Left: Next Prayer Info
        left_panel = QVBoxLayout()
        left_panel.setAlignment(Qt.AlignCenter)
        
        self.lbl_next_label = QLabel("NEXT PRAYER")
        self.lbl_next_label.setStyleSheet("color: #fbbf24; font-size: 32px; font-weight: bold; letter-spacing: 4px;")
        self.lbl_next_label.setAlignment(Qt.AlignCenter)
        
        self.lbl_prayer_name = QLabel("Subuh")
        self.lbl_prayer_name.setStyleSheet("color: white; font-size: 140px; font-weight: 900; margin: -20px 0;")
        self.lbl_prayer_name.setAlignment(Qt.AlignCenter)
        
        left_panel.addWidget(self.lbl_next_label)
        left_panel.addWidget(self.lbl_prayer_name)
        
        # Right: Digital Countdown digits
        right_panel = QVBoxLayout()
        right_panel.setAlignment(Qt.AlignCenter)
        
        lbl_cd_title = QLabel("COUNTDOWN")
        lbl_cd_title.setStyleSheet("color: #94a3b8; font-size: 24px; font-weight: bold;")
        lbl_cd_title.setAlignment(Qt.AlignCenter)
        
        cd_layout = QHBoxLayout()
        cd_layout.setSpacing(20)
        
        self.digits = {}
        for key in ['H', 'M', 'S']:
            box = GlowingCard(bg_color="#020617", border_color="#334155", alpha=0.9)
            box.setFixedSize(160, 180)
            box_lat = QVBoxLayout(box)
            lbl = QLabel("00")
            lbl.setStyleSheet("color: white; font-size: 96px; font-weight: bold; border: none; background: transparent;")
            lbl.setAlignment(Qt.AlignCenter)
            box_lat.addWidget(lbl)
            cd_layout.addWidget(box)
            self.digits[key] = lbl
            
        right_panel.addWidget(lbl_cd_title)
        right_panel.addLayout(cd_layout)
        
        layout.addLayout(left_panel)
        layout.addLayout(right_panel)

    def update_countdown(self, next_name, diff_seconds):
        self.lbl_prayer_name.setText(next_name)
        h = diff_seconds // 3600
        m = (diff_seconds % 3600) // 60
        s = diff_seconds % 60
        
        self.digits['H'].setText(f"{h:02d}")
        self.digits['M'].setText(f"{m:02d}")
        self.digits['S'].setText(f"{s:02d}")

# --- SLIDE: KAJIAN ---
class KajianWidget(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)
        
        self.card = GlowingCard(bg_color="#0f172a", border_color="#10b981", alpha=0.8)
        self.card.setFixedSize(1400, 600)
        card_layout = QVBoxLayout(self.card)
        card_layout.setAlignment(Qt.AlignCenter)
        card_layout.setSpacing(20)
        
        self.lbl_badge = QLabel("KAJIAN RUTIN")
        self.lbl_badge.setStyleSheet("color: #10b981; font-size: 28px; font-weight: bold; letter-spacing: 2px; border: none; background: transparent;")
        self.lbl_badge.setAlignment(Qt.AlignCenter)
        
        self.lbl_title = QLabel("Title")
        self.lbl_title.setStyleSheet("color: white; font-size: 72px; font-weight: 800; border: none; background: transparent;")
        self.lbl_title.setAlignment(Qt.AlignCenter)
        self.lbl_title.setWordWrap(True)
        
        self.lbl_speaker = QLabel("Speaker Name")
        self.lbl_speaker.setStyleSheet("color: #fbbf24; font-size: 48px; font-weight: bold; border: none; background: transparent;")
        self.lbl_speaker.setAlignment(Qt.AlignCenter)
        
        card_layout.addWidget(self.lbl_badge)
        card_layout.addWidget(self.lbl_title)
        card_layout.addWidget(self.lbl_speaker)
        
        layout.addWidget(self.card)

    def update_data(self, config, data):
        self.lbl_title.setText(data.get('title', 'Kajian'))
        speaker = data.get('speaker', 'Ust. Fulan')
        if isinstance(speaker, dict): speaker = speaker.get('name', 'Ust. Fulan')
        self.lbl_speaker.setText(speaker)
        
        t = data.get('type', 'kajian_rutin')
        if t == 'kajian_rutin':
            self.lbl_badge.setText("KAJIAN RUTIN")
        else:
            self.lbl_badge.setText(t.replace('_', ' ').upper())

# --- SLIDE: HADITH ---
class HadithWidget(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)
        
        self.card = GlowingCard(bg_color="#1e1b4b", border_color="#6366f1", alpha=0.8) # Deep purple tint
        self.card.setFixedSize(1500, 700)
        card_layout = QVBoxLayout(self.card)
        card_layout.setContentsMargins(60, 60, 60, 60)
        card_layout.setSpacing(40)
        card_layout.setAlignment(Qt.AlignCenter)
        
        self.lbl_arabic = QLabel("Arabic Text")
        # Ensure Amiri font is specified for RTL support
        self.lbl_arabic.setStyleSheet("font-family: 'Amiri', serif; font-size: 64px; font-weight: bold; color: white; border: none; background: transparent;")
        self.lbl_arabic.setAlignment(Qt.AlignCenter | Qt.AlignRight)
        self.lbl_arabic.setWordWrap(True)
        # Force Right-To-Left layout for this label
        self.lbl_arabic.setLayoutDirection(Qt.RightToLeft)
        
        self.lbl_indo = QLabel("Indo Text")
        self.lbl_indo.setStyleSheet("font-size: 36px; color: #cbd5e1; font-style: italic; border: none; background: transparent;")
        self.lbl_indo.setAlignment(Qt.AlignCenter)
        self.lbl_indo.setWordWrap(True)
        
        self.lbl_source = QLabel("Source")
        self.lbl_source.setStyleSheet("font-size: 28px; font-weight: bold; color: #fbbf24; border: none; background: transparent;")
        self.lbl_source.setAlignment(Qt.AlignCenter)
        
        card_layout.addWidget(self.lbl_arabic)
        card_layout.addWidget(self.lbl_indo)
        card_layout.addWidget(self.lbl_source)
        
        layout.addWidget(self.card)

    def update_data(self, config, data):
        self.lbl_arabic.setText(data.get('teksArab', ''))
        self.lbl_indo.setText(f"\"{data.get('teksIndo', '')}\"")
        self.lbl_source.setText(data.get('takhrij', 'Hadits'))

# --- MAIN UI CONTAINER (The 1920x1080 fixed plane) ---
class MasterUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setFixedSize(BASE_WIDTH, BASE_HEIGHT)
        self.setStyleSheet("background-color: #030712;")
        
        # 0. Background gradient/image placeholder
        self.bg_label = QLabel(self)
        self.bg_label.setGeometry(0, 0, BASE_WIDTH, BASE_HEIGHT)
        self.bg_label.setStyleSheet("background: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #020617, stop:1 #0f172a);")
        
        full_layout = QVBoxLayout(self)
        full_layout.setContentsMargins(0, 0, 0, 0)
        full_layout.setSpacing(0)
        
        # 1. TOP BAR (Floating Pill Clock)
        top_bar = QWidget()
        top_bar.setFixedHeight(180)
        top_layout = QHBoxLayout(top_bar)
        top_layout.setContentsMargins(60, 40, 60, 0)
        
        pill = GlowingCard(bg_color="#000000", border_color="#334155", alpha=0.6)
        pill.setFixedHeight(100)
        pill_layout = QHBoxLayout(pill)
        pill_layout.setContentsMargins(40, 0, 40, 0)
        
        self.lbl_mosque_name = QLabel("NAMA MASJID")
        self.lbl_mosque_name.setStyleSheet("font-size: 32px; font-weight: bold; color: white; border: none; background: transparent;")
        
        self.lbl_clock = QLabel("00:00:00")
        self.lbl_clock.setStyleSheet("font-family: 'Inter'; font-size: 48px; font-weight: 900; color: #fbbf24; border: none; background: transparent;")
        self.lbl_clock.setAlignment(Qt.AlignCenter)
        
        self.lbl_date = QLabel("Senin, 1 Jan 2024")
        self.lbl_date.setStyleSheet("font-size: 24px; color: #94a3b8; border: none; background: transparent;")
        self.lbl_date.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
        
        pill_layout.addWidget(self.lbl_mosque_name)
        pill_layout.addWidget(GradientLine())
        pill_layout.addWidget(self.lbl_clock, 1)
        pill_layout.addWidget(GradientLine())
        pill_layout.addWidget(self.lbl_date)
        
        top_layout.addWidget(pill)
        full_layout.addWidget(top_bar)
        
        # 2. MAIN AREA (QStackedWidget)
        # We wrap it in another widget to allow opacity effects
        self.main_area_container = QWidget()
        main_layout = QVBoxLayout(self.main_area_container)
        main_layout.setContentsMargins(40, 0, 40, 0)
        
        self.slider = QStackedWidget()
        self.slider.setStyleSheet("background: transparent;")
        
        # Initialize Slides
        self.dashboard_slide = DashboardCountdownWidget()
        self.kajian_slide = KajianWidget()
        self.hadith_slide = HadithWidget()
        
        self.slider.addWidget(self.dashboard_slide) # Index 0
        self.slider.addWidget(self.kajian_slide)    # Index 1
        self.slider.addWidget(self.hadith_slide)    # Index 2
        
        main_layout.addWidget(self.slider)
        full_layout.addWidget(self.main_area_container, 1) # stretch 1
        
        # Set up Opacity Effect for cross-fading
        self.opacity_effect = QGraphicsOpacityEffect(self.slider)
        self.slider.setGraphicsEffect(self.opacity_effect)
        self.fade_anim = QPropertyAnimation(self.opacity_effect, b"opacity")
        self.fade_anim.setDuration(800) # 0.8s fade
        self.fade_anim.setEasingCurve(QEasingCurve.InOutQuad)
        
        # 3. BOTTOM SECTION
        self.bottom_section = QWidget()
        self.bottom_section.setFixedHeight(260)
        b_layout = QVBoxLayout(self.bottom_section)
        b_layout.setContentsMargins(0, 0, 0, 0)
        b_layout.setSpacing(0)
        
        self.prayer_cards = PrayerCardsWidget()
        
        marquee_container = QWidget()
        marquee_container.setStyleSheet("background-color: #0f172a; border-top: 1px solid #1e293b;")
        marquee_container.setFixedHeight(80)
        m_layout = QVBoxLayout(marquee_container)
        m_layout.setContentsMargins(0,0,0,0)
        
        self.marquee = SmoothMarquee("MARI RAPATKAN BARISAN, LURUSKAN SHAF, DAN KHUSYUK DALAM BERIBADAH.")
        m_layout.addWidget(self.marquee)
        
        b_layout.addWidget(self.prayer_cards)
        b_layout.addWidget(marquee_container)
        
        full_layout.addWidget(self.bottom_section)

# --- MAIN WINDOW EXECUTOR ---
class MosqueDisplayApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Mosque Display - Native PySide2")
        self.setStyleSheet("background-color: #030712;")
        
        # --- QGraphicsView Trick for Perfect Scaling ---
        # Instead of manually scaling fonts and boxes, we draw the 1920x1080 UI 
        # inside a QGraphicsScene and let the View handle anti-aliased scaling.
        self.scene = QGraphicsScene(self)
        self.scene.setSceneRect(0, 0, BASE_WIDTH, BASE_HEIGHT)
        
        self.ui = MasterUI()
        self.proxy = self.scene.addWidget(self.ui)
        
        self.view = QGraphicsView(self.scene)
        self.view.setRenderHint(QPainter.Antialiasing)
        self.view.setRenderHint(QPainter.SmoothPixmapTransform)
        self.view.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.view.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.view.setFrameShape(QFrame.NoFrame)
        self.view.setContentsMargins(0, 0, 0, 0)
        self.view.setStyleSheet("background: #030712; border: none;")
        self.view.setAlignment(Qt.AlignCenter)
        
        self.setCentralWidget(self.view)
        # ---------------------------------------------

        # State Variables
        self.api_data = {}
        self.slides = []
        self.current_slide_index = 0
        self.active_prayer_id = 'fajr'
        self.next_prayer_name = 'Subuh'
        self.next_prayer_target = datetime.now()
        self.theme_color = "#10b981"
        self.running_text = "MARI RAPATKAN BARISAN."
        
        # Timers
        self.clock_timer = QTimer(self)
        self.clock_timer.timeout.connect(self.tick_clock)
        self.clock_timer.start(1000)
        
        self.slide_timer = QTimer(self)
        self.slide_timer.timeout.connect(self.next_slide)
        self.slide_timer.start(SLIDE_DURATION_MS)
        
        # Data Thread
        self.fetcher = DataFetcherThread()
        self.fetcher.data_fetched.connect(self.on_data_fetched)
        self.fetcher.start()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        # Auto-scale the QGraphicsView to fit the window while maintaining 16:9
        self.view.setGeometry(self.rect())
        self.view.fitInView(self.scene.sceneRect(), Qt.KeepAspectRatio)

    def tick_clock(self):
        now = datetime.now()
        # 1. Update Top Clock
        self.ui.lbl_clock.setText(now.strftime("%H:%M:%S"))
        
        months = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
        days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']
        day_str = days[now.weekday()]
        date_str = f"{day_str}, {now.day} {months[now.month]} {now.year}"
        self.ui.lbl_date.setText(date_str)
        
        # 2. Update Countdown
        diff = int((self.next_prayer_target - now).total_seconds())
        if diff < 0:
            diff = 0
            # Potentially refresh prayer logic here by calling logic
        self.ui.dashboard_slide.update_countdown(self.next_prayer_name, diff)

    def on_data_fetched(self, data):
        self.api_data = data
        
        # 1. Profile & Config
        profile = data.get('profile', {})
        config = data.get('config', {})
        
        if profile and 'name' in profile:
            self.ui.lbl_mosque_name.setText(profile['name'].upper())
            
        if config:
            self.theme_color = config.get('themeColor', '#10b981')
            self.running_text = config.get('runningText', self.running_text)
            self.ui.marquee.set_text(self.running_text)
            
        # 2. Extract Prayer Times
        prayer_data = data.get('prayer', {})
        self.calculate_next_prayer(prayer_data)
        
        # Update Bottom Cards
        self.ui.prayer_cards.update_data(prayer_data, self.active_prayer_id, self.theme_color)
        
        # 3. Assemble Carousel Slides
        self.slides = []
        
        # Always Kajian first if valid
        kajian_data = data.get('kajian', [])
        if kajian_data and isinstance(kajian_data, list) and len(kajian_data) > 0:
            self.slides.append({
                'type': 'kajian',
                'data': kajian_data[0]
            })
            
        # Hadith
        hadith_data = data.get('hadith', {})
        if hadith_data and ('teksArab' in hadith_data or 'teksIndo' in hadith_data):
            self.slides.append({
                'type': 'hadith',
                'data': hadith_data
            })
            
        # Update existing slide UI
        # We only have Dashboard, Kajian, Hadith in this demo version
        for slide in self.slides:
            if slide['type'] == 'kajian':
                self.ui.kajian_slide.update_data(config, slide['data'])
            elif slide['type'] == 'hadith':
                self.ui.hadith_slide.update_data(config, slide['data'])

        # Refresh slide logic
        if not self.slides:
            self.ui.slider.setCurrentWidget(self.ui.dashboard_slide)
            self.current_slide_index = -1
        else:
            # Re-trigger current slide view to update if changed
            pass

    def calculate_next_prayer(self, prayer_data):
        if not prayer_data:
            return
            
        now = datetime.now()
        c_time = now.strftime("%H:%M")
        
        # Fallback times if missing
        fajr_str = prayer_data.get('subuh', '04:30')
        dhuhr_str = prayer_data.get('dzuhur', '12:00')
        asr_str = prayer_data.get('ashar', '15:30')
        maghrib_str = prayer_data.get('maghrib', '18:00')
        isha_str = prayer_data.get('isya', '19:15')
        
        prayers = [
            ('fajr', 'Subuh', fajr_str),
            ('dhuhr', 'Dzuhur', dhuhr_str),
            ('asr', 'Ashar', asr_str),
            ('maghrib', 'Maghrib', maghrib_str),
            ('isha', 'Isya', isha_str)
        ]
        
        # Find next
        active_id = 'fajr'
        next_name = 'Subuh'
        target_time_str = fajr_str
        is_tomorrow = False
        
        if c_time >= isha_str:
            active_id, next_name, target_time_str = 'fajr', 'Subuh', fajr_str
            is_tomorrow = True
        elif c_time >= maghrib_str:
            active_id, next_name, target_time_str = 'isha', 'Isya', isha_str
        elif c_time >= asr_str:
            active_id, next_name, target_time_str = 'maghrib', 'Maghrib', maghrib_str
        elif c_time >= dhuhr_str:
            active_id, next_name, target_time_str = 'asr', 'Ashar', asr_str
        elif c_time >= fajr_str:
            active_id, next_name, target_time_str = 'dhuhr', 'Dzuhur', dhuhr_str
            
        self.active_prayer_id = active_id
        self.next_prayer_name = next_name
        
        # Parse target datetime
        try:
            h, m = map(int, target_time_str.split(':'))
            tgt = now.replace(hour=h, minute=m, second=0, microsecond=0)
            if is_tomorrow:
                tgt += timedelta(days=1)
            self.next_prayer_target = tgt
        except:
            pass

    def next_slide(self):
        if not self.slides:
            # Always show dashboard if nothing else
            if self.ui.slider.currentWidget() != self.ui.dashboard_slide:
                self.crossfade_to(self.ui.dashboard_slide)
            return
            
        # Cycle through slides, +1 for the Dashboard Countdown which is always injected at index -1 implicitly
        total_real_slides = len(self.slides)
        
        self.current_slide_index += 1
        if self.current_slide_index >= total_real_slides:
            self.current_slide_index = -1 # Go back to dashboard
            
        if self.current_slide_index == -1:
            target_widget = self.ui.dashboard_slide
        else:
            s_type = self.slides[self.current_slide_index]['type']
            if s_type == 'kajian':
                target_widget = self.ui.kajian_slide
            elif s_type == 'hadith':
                target_widget = self.ui.hadith_slide
            else:
                target_widget = self.ui.dashboard_slide
                
        # Trigger fade transition
        self.crossfade_to(target_widget)

    def crossfade_to(self, target_widget):
        if self.ui.slider.currentWidget() == target_widget:
            return
            
        # Fade out
        self.ui.fade_anim.setStartValue(1.0)
        self.ui.fade_anim.setEndValue(0.0)
        
        # When fade out finishes, swap widget and fade back in
        def on_fade_out():
            self.ui.slider.setCurrentWidget(target_widget)
            self.ui.fade_anim.disconnect()
            
            self.ui.fade_anim.setStartValue(0.0)
            self.ui.fade_anim.setEndValue(1.0)
            self.ui.fade_anim.start()
            
        self.ui.fade_anim.finished.connect(on_fade_out)
        self.ui.fade_anim.start()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)
    
    # Load fonts (Fallback if installed to OS previously)
    QFontDatabase.addApplicationFont("assets/fonts/Inter-Regular.ttf")
    QFontDatabase.addApplicationFont("assets/fonts/Inter-Bold.ttf")
    QFontDatabase.addApplicationFont("assets/fonts/Inter-Black.ttf")
    QFontDatabase.addApplicationFont("assets/fonts/Amiri-Bold.ttf")
    
    window = MosqueDisplayApp()
    window.showFullScreen()
    
    sys.exit(app.exec_())
