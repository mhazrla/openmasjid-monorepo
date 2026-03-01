# Mosque Display Python Application
**Optimized for Raspberry Pi 3 (Python 3.7 & PySide2)**

This is a true Native Python Desktop Application using Qt5 (`PySide2`). It is designed to run ultra-smoothly on low-spec hardware like the Raspberry Pi 3 without the overhead of a Chromium browser.

## 1. Prerequisites (Raspberry Pi OS)

First, ensure you have Python 3.7+ and Qt5 installed. On Raspberry Pi OS (Debian Buster/Bullseye):

```bash
sudo apt update
sudo apt install python3 python3-pip python3-pyside2.qtwidgets python3-pyside2.qtgui python3-pyside2.qtcore 
```

*Note: On Raspberry Pi, it is highly recommended to install PySide2 via `apt` rather than `pip` because compiling Qt5 from source takes a very long time.*

## 2. Installing Dependencies

```bash
pip3 install requests python-dateutil
```

## 3. Installing Custom Fonts
The UI relies on **Inter** (for Latin text) and **Amiri** (for Arabic text). You must install these on the Raspberry Pi system globally.

1. Download the fonts (`.ttf` files) from Google Fonts:
   - [Inter](https://fonts.google.com/specimen/Inter)
   - [Amiri](https://fonts.google.com/specimen/Amiri)
2. Create a local fonts directory if it doesn't exist:
   ```bash
   mkdir -p ~/.local/share/fonts
   ```
3. Copy the extracted `.ttf` files into that directory:
   ```bash
   cp ~/Downloads/Inter-*.ttf ~/.local/share/fonts/
   cp ~/Downloads/Amiri-*.ttf ~/.local/share/fonts/
   ```
4. Rebuild the font cache:
   ```bash
   fc-cache -f -v
   ```
5. Verify they are installed:
   ```bash
   fc-match Inter
   fc-match Amiri
   ```

## 4. Running the Application

Set the API endpoint environment variable and run:

```bash
export API_BASE_URL="http://localhost:3000/api"
python3 main.py
```

## 5. Auto-start on Boot

To make the display launch automatically when the Raspberry Pi boots to the desktop:

1. Create a desktop launcher file:
   ```bash
   nano ~/.config/autostart/mosque_display.desktop
   ```
2. Paste the following:
   ```ini
   [Desktop Entry]
   Type=Application
   Name=Mosque Display
   Exec=/usr/bin/python3 /home/pi/masjid-display/packages/display-python/main.py
   Environment=API_BASE_URL=http://localhost:3000/api
   Hidden=false
   X-GNOME-Autostart-enabled=true
   ```
3. Reboot to test.
