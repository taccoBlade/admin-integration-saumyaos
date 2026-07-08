import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\templates\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

def print_range(start, end):
    print(f"--- Range {start} to {end} ---")
    for i in range(max(0, start - 1), min(len(lines), end)):
         print(f"{i + 1}: {lines[i]}", end="")

print_range(620, 695)
