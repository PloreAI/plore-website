@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
pip install customtkinter requests pillow

echo.
echo Starting Plore AI Desktop...
python plore_desktop.py