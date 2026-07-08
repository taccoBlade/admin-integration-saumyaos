import os

file_path = r"C:\Users\saumy\Downloads\projects\anti-concretemixdesign\templates\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's locate the unique end of the recommendation block
target_block = """    <div class="flex flex-col gap-xs" id="grade-rec-output">
      <div class="flex justify-between body-xs"><span class="text-dim">Minimum Grade</span><span class="data-tabular" id="rec-grade">--</span></div>
      <div class="flex justify-between body-xs"><span class="text-dim">Maximum W/C</span><span class="data-tabular" id="rec-wc">--</span></div>
      <div class="flex justify-between body-xs"><span class="text-dim">Minimum Binder</span><span class="data-tabular" id="rec-binder">--</span></div>
      <div class="flex justify-between body-xs"><span class="text-dim">Source</span><span class="data-tabular text-dim" id="rec-source">--</span></div>
    </div>"""

idx = content.find(target_block)
if idx == -1:
    print("Error: Target block not found!")
    exit(1)

# We want to keep everything before target_block, plus target_block itself
rest_of_file = """
    <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:4px">
      <div class="flex justify-between items-center mb-sm">
        <span class="label-caps text-dim">Benchmark Library</span>
        <div class="flex gap-xs">
          <select id="benchmark-select" style="padding:4px 8px; font-size:11px; width:200px" onchange="loadBenchmark()">
            <option value="">Select benchmark...</option>
          </select>
          <button class="btn btn-outline" id="btn-save-preset" onclick="saveCurrentPreset()" style="padding:4px 8px; font-size:11px;">+ Save</button>
        </div>
      </div>
      <div class="flex flex-col gap-xs" id="benchmark-output">
        <div class="text-dim body-xs" style="text-align:center">Select a benchmark to load</div>
      </div>
    </div>
  </div>

  <!-- BENTO 13: Step-by-Step Calculation Trail (Defensibility) -->
  <div class="bento-card col-span-12 flex flex-col gap-md trail-card">
    <div class="card-header">
      <span class="label-caps">AUTHORITATIVE CALCULATION TRAIL</span>
    </div>
    <div class="trail-content" id="calculation-trail">
      <!-- Dynamically filled with math symbols and equations -->
    </div>
  </div>

</div>

<script src="/static/app.js?v=7"></script>
</body>
</html>
"""

new_content = content[:idx + len(target_block)] + rest_of_file

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("HTML fixed successfully!")
