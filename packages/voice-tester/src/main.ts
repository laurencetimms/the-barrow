import { TAGS, TagCategory, Situation, emptySituation } from "@the-barrow/voice";
import { Fragment, STARTER_FRAGMENTS } from "@the-barrow/voice";
import { loadFragments, saveFragments, loadApiKey, saveApiKey, exportFragmentsJSON, importFragmentsJSON } from "@the-barrow/voice";
import { matchFragments } from "@the-barrow/voice";
import { generateVoice, getSystemPrompt } from "@the-barrow/voice";

// --- State ---
let fragments: Fragment[] = loadFragments();
let situation: Situation = emptySituation();
let currentTab: "add" | "browse" | "export" = "add";
let addFormTags: Partial<Record<TagCategory, string[]>> = {};

// --- Elements ---
const situationPanel = document.getElementById("situation-panel")!;
const voiceOutput = document.getElementById("voice-output")!;
const fragmentsUsed = document.getElementById("fragments-used")!;
const editorBody = document.getElementById("editor-body")!;
const editorCount = document.getElementById("editor-count")!;
const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
const apiStatus = document.getElementById("api-status")!;

// --- API key ---
apiKeyInput.value = loadApiKey();
updateApiStatus();

apiKeyInput.addEventListener("input", () => {
  saveApiKey(apiKeyInput.value.trim());
  updateApiStatus();
});

function updateApiStatus() {
  const hasKey = apiKeyInput.value.trim().length > 10;
  apiStatus.className = `status-dot ${hasKey ? "ok" : "missing"}`;
}

// --- Build situation panel ---
function buildSituationPanel() {
  situationPanel.innerHTML = "";

  const categories: { key: TagCategory; label: string }[] = [
    { key: "geology", label: "Geology" },
    { key: "weather", label: "Weather" },
    { key: "season", label: "Season" },
    { key: "time", label: "Time of Day" },
    { key: "altitude", label: "Altitude" },
    { key: "feature", label: "Features" },
    { key: "sense", label: "Senses" },
    { key: "state", label: "Player State" },
  ];

  for (const { key, label } of categories) {
    const group = document.createElement("div");
    group.className = "control-group";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    group.appendChild(lbl);

    const grid = document.createElement("div");
    grid.className = "tag-grid";

    for (const tag of TAGS[key]) {
      const btn = document.createElement("button");
      btn.className = `tag-btn${situation[key].includes(tag) ? " active" : ""}`;
      btn.textContent = tag;
      btn.addEventListener("click", () => {
        const arr = situation[key] as string[];
        const idx = arr.indexOf(tag);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(tag);
        btn.classList.toggle("active");
      });
      grid.appendChild(btn);
    }

    group.appendChild(grid);
    situationPanel.appendChild(group);
  }

  // Generate button
  const genBtn = document.createElement("button");
  genBtn.className = "generate-btn";
  genBtn.textContent = "Generate";
  genBtn.addEventListener("click", handleGenerate);
  situationPanel.appendChild(genBtn);
}

// --- Generate ---
async function handleGenerate() {
  const apiKey = apiKeyInput.value.trim();

  // Match fragments
  const matched = matchFragments(fragments, situation, 4);

  if (matched.length === 0) {
    voiceOutput.className = "voice-text empty";
    voiceOutput.textContent = "No fragments match this situation. Write some fragments first, or broaden the situation.";
    fragmentsUsed.innerHTML = "";
    return;
  }

  // Show fragments used
  fragmentsUsed.innerHTML = "";
  for (const m of matched) {
    const card = document.createElement("div");
    card.className = "fragment-card";
    card.innerHTML = `
      <div class="frag-text">${m.fragment.text}</div>
      <div class="frag-tags">${formatTags(m.fragment.tags)} · score: ${m.score.toFixed(1)}</div>
    `;
    fragmentsUsed.appendChild(card);
  }

  if (!apiKey) {
    // No API key — just show the raw fragments
    voiceOutput.className = "voice-text";
    voiceOutput.textContent = matched.map(m => m.fragment.text).join(" ");
    return;
  }

  // Generate with LLM
  voiceOutput.className = "voice-text";
  voiceOutput.innerHTML = '<span class="loading">Listening to the land...</span>';

  try {
    const text = await generateVoice(apiKey, situation, matched);
    voiceOutput.textContent = text;

    // Add the prompt to the details section
    const promptCard = document.createElement("div");
    promptCard.className = "fragment-card";
    promptCard.innerHTML = `<div class="frag-tags">System prompt: ${getSystemPrompt().substring(0, 120)}...</div>`;
    fragmentsUsed.appendChild(promptCard);
  } catch (err) {
    voiceOutput.textContent = `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// --- Editor tabs ---
document.querySelectorAll(".editor-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".editor-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = (tab as HTMLElement).dataset.tab as typeof currentTab;
    renderEditor();
  });
});

function renderEditor() {
  updateCount();
  if (currentTab === "add") renderAddForm();
  else if (currentTab === "browse") renderBrowse();
  else renderExport();
}

function updateCount() {
  editorCount.textContent = `${fragments.length}`;
}

// --- Add form ---
function renderAddForm() {
  editorBody.innerHTML = "";
  const form = document.createElement("div");
  form.className = "add-form";

  // Text area
  const textLabel = document.createElement("div");
  textLabel.className = "form-label";
  textLabel.textContent = "Fragment text";
  form.appendChild(textLabel);

  const textarea = document.createElement("textarea");
  textarea.placeholder = "The chalk is white underfoot...";
  form.appendChild(textarea);

  // Tag selectors for each category
  const categories: TagCategory[] = [
    "geology", "weather", "season", "time",
    "altitude", "feature", "sense", "state"
  ];

  addFormTags = {};

  for (const cat of categories) {
    const label = document.createElement("div");
    label.className = "form-label";
    label.textContent = cat;
    form.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "mini-tag-grid";

    for (const tag of TAGS[cat]) {
      const btn = document.createElement("button");
      btn.className = "mini-tag";
      btn.textContent = tag;
      btn.type = "button";
      btn.addEventListener("click", () => {
        if (!addFormTags[cat]) addFormTags[cat] = [];
        const arr = addFormTags[cat]!;
        const idx = arr.indexOf(tag);
        if (idx >= 0) { arr.splice(idx, 1); btn.classList.remove("active"); }
        else { arr.push(tag); btn.classList.add("active"); }
      });
      grid.appendChild(btn);
    }
    form.appendChild(grid);
  }

  // Add button
  const addBtn = document.createElement("button");
  addBtn.className = "add-btn";
  addBtn.textContent = "Add Fragment";
  addBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (!text) return;

    const id = `frag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cleanTags: Partial<Record<TagCategory, string[]>> = {};
    for (const [k, v] of Object.entries(addFormTags)) {
      if (v && v.length > 0) cleanTags[k as TagCategory] = [...v];
    }

    fragments.push({ id, text, tags: cleanTags });
    saveFragments(fragments);
    textarea.value = "";
    addFormTags = {};
    form.querySelectorAll(".mini-tag.active").forEach(b => b.classList.remove("active"));
    updateCount();
  });
  form.appendChild(addBtn);

  editorBody.appendChild(form);
}

// --- Browse ---
function renderBrowse() {
  editorBody.innerHTML = "";
  const list = document.createElement("div");
  list.className = "fragment-list";

  // Show fragments matching current situation first, then the rest
  const matched = matchFragments(fragments, situation, fragments.length);
  const matchedIds = new Set(matched.map(m => m.fragment.id));
  const sorted = [
    ...matched.map(m => m.fragment),
    ...fragments.filter(f => !matchedIds.has(f.id))
  ];

  for (const frag of sorted) {
    const item = document.createElement("div");
    item.className = "frag-list-item";
    if (matchedIds.has(frag.id)) {
      item.style.borderColor = "#4a4030";
    }

    item.innerHTML = `
      ${frag.text}
      <div class="frag-list-tags">${formatTags(frag.tags)}</div>
    `;

    const del = document.createElement("button");
    del.className = "frag-delete";
    del.textContent = "×";
    del.addEventListener("click", () => {
      fragments = fragments.filter(f => f.id !== frag.id);
      saveFragments(fragments);
      renderBrowse();
    });
    item.appendChild(del);

    list.appendChild(item);
  }

  editorBody.appendChild(list);
}

// --- Export ---
function renderExport() {
  editorBody.innerHTML = "";
  const section = document.createElement("div");
  section.className = "export-section";

  // Export button
  const expBtn = document.createElement("button");
  expBtn.className = "export-btn";
  expBtn.textContent = "Copy JSON to clipboard";
  expBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(exportFragmentsJSON(fragments));
    expBtn.textContent = "Copied!";
    setTimeout(() => { expBtn.textContent = "Copy JSON to clipboard"; }, 2000);
  });
  section.appendChild(expBtn);

  // Download button
  const dlBtn = document.createElement("button");
  dlBtn.className = "export-btn";
  dlBtn.textContent = "Download fragments.json";
  dlBtn.addEventListener("click", () => {
    const blob = new Blob([exportFragmentsJSON(fragments)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fragments.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  section.appendChild(dlBtn);

  // Import
  const impLabel = document.createElement("div");
  impLabel.className = "form-label";
  impLabel.textContent = "Import JSON";
  impLabel.style.marginTop = "16px";
  section.appendChild(impLabel);

  const impArea = document.createElement("textarea");
  impArea.style.cssText = "width:100%;min-height:60px;background:#222018;border:1px solid #3a3630;color:#c4b9a8;padding:6px;font-size:11px;font-family:monospace;border-radius:3px;resize:vertical;";
  impArea.placeholder = "Paste fragments JSON here...";
  section.appendChild(impArea);

  const impBtn = document.createElement("button");
  impBtn.className = "export-btn";
  impBtn.textContent = "Import (replaces all fragments)";
  impBtn.addEventListener("click", () => {
    const imported = importFragmentsJSON(impArea.value);
    if (imported) {
      fragments = imported;
      saveFragments(fragments);
      updateCount();
      impBtn.textContent = `Imported ${imported.length} fragments`;
      setTimeout(() => { impBtn.textContent = "Import (replaces all fragments)"; }, 2000);
    } else {
      impBtn.textContent = "Invalid JSON";
      setTimeout(() => { impBtn.textContent = "Import (replaces all fragments)"; }, 2000);
    }
  });
  section.appendChild(impBtn);

  // Reset to starters
  const resetBtn = document.createElement("button");
  resetBtn.className = "export-btn";
  resetBtn.textContent = "Reset to starter fragments";
  resetBtn.style.marginTop = "12px";
  resetBtn.addEventListener("click", () => {
    if (confirm("This will replace all fragments with the starter set. Continue?")) {
      fragments = [...STARTER_FRAGMENTS];
      saveFragments(fragments);
      updateCount();
    }
  });
  section.appendChild(resetBtn);

  editorBody.appendChild(section);
}

// --- Helpers ---
function formatTags(tags: Partial<Record<TagCategory, string[]>>): string {
  return Object.entries(tags)
    .filter(([_, v]) => v && v.length > 0)
    .map(([k, v]) => `${k}: ${v!.join(", ")}`)
    .join(" · ");
}

// --- Init ---
buildSituationPanel();
renderEditor();
