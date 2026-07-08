import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\app.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("function loadBenchmark")
if idx == -1:
    print("loadBenchmark not found")
else:
    # Print lines around it
    lines = content[idx:].splitlines()
    for i in range(min(100, len(lines))):
         print(f"{i + 1}: {lines[i]}")
