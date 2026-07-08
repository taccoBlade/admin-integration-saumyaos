import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\styles.css"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "yield-card" in line.lower():
        print(f"{idx+1}: {line.strip()}")
