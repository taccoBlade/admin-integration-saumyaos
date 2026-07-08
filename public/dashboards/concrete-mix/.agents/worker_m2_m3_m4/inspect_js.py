import re

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\static\app.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all function declarations
functions = re.findall(r"function\s+(\w+)\s*\(", content)
print("Functions found:")
for func in functions:
    print(f"  - {func}")

# Print the first 150 lines
lines = content.splitlines()
print("\n--- First 150 lines of app.js ---")
for idx, line in enumerate(lines[:150]):
    print(f"{idx+1}: {line}")
