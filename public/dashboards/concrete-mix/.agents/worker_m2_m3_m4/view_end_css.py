import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\styles.css"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(max(0, len(lines) - 20), len(lines)):
    print(f"{idx+1}: {lines[idx]}", end="")
