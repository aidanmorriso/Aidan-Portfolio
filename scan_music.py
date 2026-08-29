import os
import json

# Configuration
MUSIC_DIR = './music'
OUTPUT_FILE = 'library.json'

# Add or remove file extensions you want the player to support
ALLOWED_EXTENSIONS = {'.m4a', '.mp3', '.wav', '.flac', '.ogg'}

def generate_library():
    library = {}
    
    if not os.path.exists(MUSIC_DIR):
        print(f"Error: The directory '{MUSIC_DIR}' does not exist.")
        print("Please create it and add your music folders.")
        return

    # Scan the directory
    for item in os.listdir(MUSIC_DIR):
        item_path = os.path.join(MUSIC_DIR, item)
        
        # If it's a folder, scan inside it
        if os.path.isdir(item_path):
            files = [
                f for f in os.listdir(item_path) 
                if os.path.isfile(os.path.join(item_path, f)) and 
                os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS
            ]
            
            # Only add the folder to JSON if it actually contains audio files
            if files:
                library[item] = files
                
        # If it's a file sitting loose in the root of ./music
        elif os.path.isfile(item_path):
            ext = os.path.splitext(item)[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                if "Root_Directory" not in library:
                    library["Root_Directory"] = []
                library["Root_Directory"].append(item)

    # Export to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as json_file:
        json.dump(library, json_file, indent=4)
        
    print(f"Success! Scanned '{MUSIC_DIR}' and updated '{OUTPUT_FILE}'.")
    print(f"Found {len(library)} folders/categories.")

if __name__ == "__main__":
    generate_library()