import os
import re
import json

def validate_all():
    wca_path = r"C:\Users\Sonny Saggar\.geminintigravity-ide\scratch\wca"
    html_files = [f for f in os.listdir(wca_path) if f.endswith(".html")]
    
    print(f"Validating schemas for {len(html_files)} HTML pages...")
    
    for filename in html_files:
        filepath = os.path.join(wca_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Match application/ld+json script tags
        matches = re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
        if not matches:
            # Check if this is a subpage that doesn't need schema
            if filename in ["index.html", "road.html", "course.html", "about.html"]:
                print(f"FAILED: Key page {filename} is missing JSON-LD schema!")
                return False
            continue
            
        for json_str in matches:
            try:
                json_data = json.loads(json_str.strip())
                print(f"OK: {filename} has valid JSON-LD schema (@context = {json_data.get('@context') or 'Graph'}).")
            except json.JSONDecodeError as e:
                print(f"FAILED: JSON-LD parse error in {filename}: {e}")
                return False
                
    print("
All JSON-LD schemas validated successfully!")
    return True

if __name__ == "__main__":
    validate_all()
