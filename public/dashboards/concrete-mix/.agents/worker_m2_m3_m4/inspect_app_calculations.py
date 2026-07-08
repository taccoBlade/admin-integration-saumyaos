import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\app.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find runCalculations function start index
idx = content.find("function runCalculations()")
if idx == -1:
    print("runCalculations not found")
else:
    # Print 150 lines from there
    lines = content[idx:].splitlines()
    for i in range(min(150, len(lines))):
        print(f"{i + 1}: {lines[i]}")
