#!/usr/bin/env python3

import argparse
import os
import shutil
import tempfile
import zipfile
import json


def extract_audio_from_apkg(apkg_path):
    print(f"Processing file: {apkg_path}")
    if not os.path.exists(apkg_path):
        print(f"Error: File {apkg_path} does not exist")
        return
        
    # Create a temporary directory to extract the .apkg contents
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"Created temporary directory: {temp_dir}")
        try:
            # Extract the .apkg file (which is a zip archive) into the temporary directory
            with zipfile.ZipFile(apkg_path, 'r') as zip_ref:
                print("Extracting archive contents...")
                print("\nFiles in archive:")
                for file_info in zip_ref.infolist():
                    print(f"- {file_info.filename}")
                zip_ref.extractall(temp_dir)
            
            # Read the media mapping
            media_path = os.path.join(temp_dir, 'media')
            if not os.path.exists(media_path):
                print("No media mapping file found.")
                return
            with open(media_path, 'r', encoding='utf-8') as f:
                media_map = json.load(f)
            
            audio_extensions = ('.mp3', '.ogg', '.wav', '.m4a')
            found_files = False
            
            for num_str, real_name in media_map.items():
                if real_name.lower().endswith(audio_extensions):
                    src_path = os.path.join(temp_dir, num_str)
                    dst_path = os.path.join(os.getcwd(), real_name)
                    if os.path.exists(src_path):
                        shutil.copy2(src_path, dst_path)
                        print(f"Extracted: {real_name}")
                        found_files = True
                    else:
                        print(f"Warning: File {num_str} listed in media mapping not found in archive.")
            
            if not found_files:
                print("\nNo audio files found in the archive (via media mapping)")
                
        except zipfile.BadZipFile:
            print(f"Error: {apkg_path} is not a valid zip file")
        except Exception as e:
            print(f"An error occurred: {str(e)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract audio files from an Anki .apkg file.")
    parser.add_argument("apkg_path", help="Path to the .apkg file")
    args = parser.parse_args()
    
    extract_audio_from_apkg(args.apkg_path) 