import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\styles.css"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(219, min(250, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
