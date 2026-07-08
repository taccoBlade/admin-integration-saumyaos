import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\app.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function loadBenchmark")
if idx == -1:
    print("loadBenchmark not found")
else:
    lines = content[idx:].splitlines()
    for i in range(min(120, len(lines))):
        print(f"{i + 1}: {lines[i]}")
