// ========== YOUR SKILLS (Customize here) ==========
let mySkills = [
  "JavaScript", "React", "Python", "Node.js", "HTML5", "CSS3",
  "Tailwind CSS", "Git", "REST APIs", "MongoDB", "SQL", "TypeScript",
  "Docker", "AWS", "Figma", "Problem Solving"
];

let currentFile = null;
let currentFileText = "";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// ========== Helper Functions ==========
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSkillsFromText(text) {
  const lowerText = text.toLowerCase();
  const found = [];
  for (let skill of mySkills) {
    const regex = new RegExp('\\b' + escapeRegex(skill.toLowerCase()) + '\\b', 'i');
    if (regex.test(lowerText)) {
      found.push(skill);
    }
  }
  return [...new Set(found)];
}

function computeMatchPercentage(matchedSkills) {
  if (mySkills.length === 0) return 0;
  return Math.round((matchedSkills.length / mySkills.length) * 100);
}

function generateTips(missingSkills) {
  const tips = [];
  if (missingSkills.length === 0) {
    tips.push("🎉 Perfect match! Your resume showcases all your core skills.");
    return tips;
  }
  
  if (missingSkills.length > 0) {
    tips.push(`📌 Add ${missingSkills.slice(0, 3).join(", ")}${missingSkills.length > 3 ? ' and others' : ''} to your skills section.`);
  }
  if (missingSkills.some(s => s.toLowerCase().includes('react') || s.toLowerCase().includes('javascript'))) {
    tips.push("⚛️ Include React/JS projects with specific achievements.");
  }
  if (missingSkills.some(s => s.toLowerCase().includes('python') || s.toLowerCase().includes('node'))) {
    tips.push("🐍 Mention backend development or scripting experience.");
  }
  if (missingSkills.some(s => s.toLowerCase().includes('docker') || s.toLowerCase().includes('aws'))) {
    tips.push("☁️ Add cloud/deployment experience to your work history.");
  }
  if (missingSkills.some(s => s.toLowerCase().includes('sql') || s.toLowerCase().includes('mongodb'))) {
    tips.push("🗄️ Highlight database design or query optimization.");
  }
  if (tips.length === 0 && missingSkills.length > 0) {
    tips.push("📝 Customize your resume's technical summary to include missing keywords.");
  }
  return tips.slice(0, 4);
}

// ========== File Parsing ==========
async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + " ";
  }
  return fullText;
}

async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return result.value;
}

async function parseResume(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'pdf') {
    return await parsePDF(file);
  } else if (extension === 'docx') {
    return await parseDOCX(file);
  } else {
    throw new Error("Unsupported file type");
  }
}

// ========== Analysis ==========
async function analyzeResume() {
  if (!currentFile) {
    alert("Please upload a resume file first (PDF or DOCX)");
    return;
  }

  const loadingDiv = document.getElementById('loadingOverlay');
  loadingDiv.classList.remove('hidden');

  try {
    const resumeText = await parseResume(currentFile);
    currentFileText = resumeText;
    
    const matched = extractSkillsFromText(resumeText);
    const matchedSet = new Set(matched.map(s => s.toLowerCase()));
    const missing = mySkills.filter(skill => !matchedSet.has(skill.toLowerCase()));
    const percent = computeMatchPercentage(matched);
    const tips = generateTips(missing);
    
    updateResultsUI(matched, missing, percent, tips);
  } catch (error) {
    console.error(error);
    alert("Error reading resume. Please ensure the file is valid (PDF/DOCX).");
  } finally {
    loadingDiv.classList.add('hidden');
  }
}

function updateResultsUI(matched, missing, percent, tips) {
  let feedbackMsg = "";
  if (percent >= 80) feedbackMsg = "🌟 Excellent! Your resume strongly aligns with your skills.";
  else if (percent >= 60) feedbackMsg = "👍 Good match. Add missing keywords to improve.";
  else if (percent >= 40) feedbackMsg = "📈 Moderate match. Highlight your skills more clearly.";
  else feedbackMsg = "🔍 Low match. Consider tailoring your resume significantly.";
  
  document.getElementById('matchPercent').innerText = percent;
  document.getElementById('matchFeedback').innerHTML = feedbackMsg;
  
  const matchedListEl = document.getElementById('matchedList');
  const missingListEl = document.getElementById('missingList');
  const tipsListEl = document.getElementById('tipsList');
  
  matchedListEl.innerHTML = '';
  if (matched.length === 0) {
    matchedListEl.innerHTML = '<li style="background: none; color: gray;">No skills matched</li>';
  } else {
    matched.forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      matchedListEl.appendChild(li);
    });
  }
  
  missingListEl.innerHTML = '';
  if (missing.length === 0) {
    missingListEl.innerHTML = '<li style="background: #d1fae5; color:#065f46;">🎯 All skills detected!</li>';
  } else {
    missing.forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      missingListEl.appendChild(li);
    });
  }
  
  tipsListEl.innerHTML = '';
  tips.forEach(tip => {
    const li = document.createElement('li');
    li.textContent = tip;
    tipsListEl.appendChild(li);
  });
  
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========== UI Helpers ==========
function renderSkillsCloud() {
  const container = document.getElementById('skillsContainer');
  if (!container) return;
  container.innerHTML = '';
  mySkills.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'skill-tag';
    span.textContent = skill;
    container.appendChild(span);
  });
}

function openEditModal() {
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-overlay';
  modalDiv.innerHTML = `
    <div class="modal">
      <h3>✏️ Edit Your Skills</h3>
      <p>Modify your personal skill set (comma or line separated)</p>
      <textarea id="skillsEditArea" placeholder="e.g., JavaScript, React, Python...">${mySkills.join(', ')}</textarea>
      <div class="modal-actions">
        <button id="cancelModalBtn" class="btn-secondary">Cancel</button>
        <button id="saveModalBtn" class="btn-primary">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);
  
  document.getElementById('cancelModalBtn').addEventListener('click', () => modalDiv.remove());
  document.getElementById('saveModalBtn').addEventListener('click', () => {
    const raw = document.getElementById('skillsEditArea').value;
    let newSkills = raw.split(/[,\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    if (newSkills.length === 0) {
      alert("Please add at least one skill.");
      return;
    }
    mySkills = newSkills;
    renderSkillsCloud();
    modalDiv.remove();
    document.getElementById('resultsSection').classList.add('hidden');
    showToast("✅ Skills updated! Upload a resume to analyze.");
  });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = '#1e293b';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '40px';
  toast.style.fontSize = '0.85rem';
  toast.style.zIndex = '1100';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function clearAll() {
  currentFile = null;
  currentFileText = "";
  document.getElementById('resumeFile').value = "";
  document.getElementById('fileNameDisplay').classList.add('hidden');
  document.getElementById('fileNameDisplay').innerHTML = "";
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('resultsSection').classList.add('hidden');
  showToast("Cleared. Upload a new resume.");
}

// ========== File Upload Handlers ==========
function setupFileUpload() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('resumeFile');
  
  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });
}

function handleFile(file) {
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type)) {
    alert("Please upload PDF or DOCX files only.");
    return;
  }
  
  currentFile = file;
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  fileNameDisplay.innerHTML = `📄 Selected: ${file.name}`;
  fileNameDisplay.classList.remove('hidden');
  document.getElementById('analyzeBtn').disabled = false;
  document.getElementById('resultsSection').classList.add('hidden');
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
  renderSkillsCloud();
  setupFileUpload();
  
  document.getElementById('analyzeBtn').addEventListener('click', analyzeResume);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('editSkillsBtn').addEventListener('click', openEditModal);
});