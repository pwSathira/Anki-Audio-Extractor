from aqt import mw
from aqt.qt import *
from aqt.utils import showInfo, qconnect
import os
import shutil
import tempfile
import zipfile
import json

def extract_audio_from_apkg(apkg_path, output_dir):
    if not os.path.exists(apkg_path):
        showInfo(f"Error: File {apkg_path} does not exist")
        return
        
    # Create a temporary directory to extract the .apkg contents
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # Extract the .apkg file (which is a zip archive) into the temporary directory
            with zipfile.ZipFile(apkg_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Read the media mapping
            media_path = os.path.join(temp_dir, 'media')
            if not os.path.exists(media_path):
                showInfo("No media mapping file found.")
                return
            with open(media_path, 'r', encoding='utf-8') as f:
                media_map = json.load(f)
            
            audio_extensions = ('.mp3', '.ogg', '.wav', '.m4a')
            found_files = False
            extracted_files = []
            
            # Create the output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            for num_str, real_name in media_map.items():
                if real_name.lower().endswith(audio_extensions):
                    src_path = os.path.join(temp_dir, num_str)
                    dst_path = os.path.join(output_dir, real_name)
                    if os.path.exists(src_path):
                        shutil.copy2(src_path, dst_path)
                        extracted_files.append(real_name)
                        found_files = True
            
            if found_files:
                showInfo(f"Successfully extracted {len(extracted_files)} audio files to:\n{output_dir}")
            else:
                showInfo("No audio files found in the archive.")
                
        except zipfile.BadZipFile:
            showInfo(f"Error: {apkg_path} is not a valid zip file")
        except Exception as e:
            showInfo(f"An error occurred: {str(e)}")

def select_apkg_file():
    file_path, _ = QFileDialog.getOpenFileName(
        mw,
        "Select Anki Package File",
        "",
        "Anki Package Files (*.apkg)"
    )
    if file_path:
        # Ask for output directory
        output_dir = QFileDialog.getExistingDirectory(
            mw,
            "Select Output Directory",
            os.path.expanduser("~")
        )
        if output_dir:
            extract_audio_from_apkg(file_path, output_dir)

# Add menu item
action = QAction("Extract Audio from Package", mw)
qconnect(action.triggered, select_apkg_file)
mw.form.menuTools.addAction(action) 