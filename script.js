// Global variables
let currentText = "";
let currentDrawing = "";
let isDrawing = false;
let brushColor = "#000000";
let brushSize = 5;
let canvas, ctx;

// Initialize when the window loads
window.onload = function() {
  // Setup canvas
  canvas = document.getElementById("dreamCanvas");
  ctx = canvas.getContext("2d");
  
  // Set default canvas background to white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Setup drawing event listeners
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  
  // For touch devices
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", stopDrawing);
  
  // Setup color and brush size controls
  document.getElementById("colorPicker").addEventListener("input", updateColor);
  document.getElementById("brushSize").addEventListener("input", updateBrushSize);
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("entryDate").value = today;
};

// Drawing functions
function startDrawing(e) {
  isDrawing = true;
  draw(e); // Draw a dot where user clicked/touched
}

function draw(e) {
  if (!isDrawing) return;
  
  // Get coordinates relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor;
  
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function handleTouchStart(e) {
  e.preventDefault(); // Prevent scrolling
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  startDrawing(mouseEvent);
}

function handleTouchMove(e) {
  e.preventDefault(); // Prevent scrolling
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  draw(mouseEvent);
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath(); // Start a new path
}

function clearCanvas() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateColor(e) {
  brushColor = e.target.value;
}

function updateBrushSize(e) {
  brushSize = e.target.value;
  document.getElementById("brushSizeDisplay").textContent = `${brushSize}px`;
}

// Tab functions
function showTab(tabId) {
  // Hide all tabs
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("active");
  }
  
  // Deactivate all tab buttons
  const tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  
  // Show selected tab
  document.getElementById(tabId).classList.add("active");
  
  // Activate selected tab button
  const activeTabIndex = tabId === "textTab" ? 0 : 1;
  tabs[activeTabIndex].classList.add("active");
}

// Save text from textarea
function submitText() {
  const text = document.getElementById("dreamText").value.trim();
  if (text) {
    currentText = text;
    currentDrawing = ""; // Clear any existing drawing
    
    // In a real app, this would call your AI API for text-to-image
    document.getElementById("aiOutput").innerHTML = `
      <h3>Dream Text Processed</h3>
      <p>${text}</p>
      <p><em>In the full version, this would be converted to an AI-generated painting.</em></p>
    `;
  } else {
    alert("Please enter your dream text before submitting.");
  }
}

// Save drawing from canvas as image data
function submitDrawing() {
  const dataUrl = canvas.toDataURL("image/png");
  currentDrawing = dataUrl;
  currentText = ""; // Clear any existing text
  
  // In a real app, this would call your AI API for image-to-text
  document.getElementById("aiOutput").innerHTML = `
    <h3>Dream Drawing Processed</h3>
    <img src="${dataUrl}" alt="Your dream drawing" style="max-width: 300px; max-height: 200px;">
    <p><em>In the full version, this would be converted to an AI-generated poem.</em></p>
  `;
}

// Save full entry (text or drawing) with selected date
function saveToJournal() {
  const date = document.getElementById("entryDate").value;
  if (!date) {
    alert("Please select a date for your journal entry.");
    return;
  }
  if (!currentText && !currentDrawing) {
    alert("Please submit a dream text or drawing before saving.");
    return;
  }

  const entry = {
    id: Date.now(), // Unique ID for each entry
    date: date,
    text: currentText,
    drawing: currentDrawing,
    timestamp: new Date().toISOString()
  };

  let journal = JSON.parse(localStorage.getItem("dreamJournal")) || [];
  journal.push(entry);
  localStorage.setItem("dreamJournal", JSON.stringify(journal));

  // Clear temporary data
  currentText = "";
  currentDrawing = "";
  document.getElementById("dreamText").value = "";
  clearCanvas();
  
  document.getElementById("aiOutput").innerHTML = `
    <h3>Success!</h3>
    <p>Your dream has been saved to your journal.</p>
  `;
  
  // Show the user their journal
  viewJournal();
}

// Show all entries in the journal section
function viewJournal() {
  const journalSection = document.getElementById("journal");
  const entriesContainer = document.getElementById("journalEntries");
  const journal = JSON.parse(localStorage.getItem("dreamJournal")) || [];

  // First make sure the journal section is displayed
  journalSection.style.display = "block";
  
  // Sort entries by date (newest first)
  journal.sort((a, b) => new Date(b.date) - new Date(a.date));

  entriesContainer.innerHTML = "";

  if (journal.length === 0) {
    entriesContainer.innerHTML = "<p>No entries yet.</p>";
  }

  journal.forEach((entry) => {
    const entryDiv = document.createElement("div");
    
    const dateP = document.createElement("p");
    const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    dateP.innerHTML = `<strong>Date:</strong> ${formattedDate}`;
    entryDiv.appendChild(dateP);

    if (entry.text) {
      const textDiv = document.createElement("div");
      textDiv.className = "entry-container";
      textDiv.innerHTML = `<strong>Dream Text:</strong><br>${entry.text}`;
      entryDiv.appendChild(textDiv);
    }

    if (entry.drawing) {
      const drawingDiv = document.createElement("div");
      drawingDiv.className = "entry-container";
      drawingDiv.innerHTML = `
        <strong>Dream Drawing:</strong><br>
        <img src="${entry.drawing}" alt="Dream drawing" class="journal-image">
      `;
      entryDiv.appendChild(drawingDiv);
    }
    
    // Add delete button
    const actionDiv = document.createElement("div");
    actionDiv.className = "entry-actions";
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete Entry";
    deleteBtn.onclick = function() { deleteEntry(entry.id); };
    actionDiv.appendChild(deleteBtn);
    entryDiv.appendChild(actionDiv);

    entriesContainer.appendChild(entryDiv);
  });

  // Use a longer delay to ensure everything is rendered before scrolling
  setTimeout(() => {
    journalSection.scrollIntoView({ behavior: "smooth" });
  }, 300);
}

// Delete an entry from the journal
function deleteEntry(id) {
  if (confirm("Are you sure you want to delete this dream entry?")) {
    let journal = JSON.parse(localStorage.getItem("dreamJournal")) || [];
    journal = journal.filter(entry => entry.id !== id);
    localStorage.setItem("dreamJournal", JSON.stringify(journal));
    viewJournal(); // Refresh the journal view
  }
}

// Scroll to a specific section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  
  // Make sure the section is visible before scrolling
  if (sectionId === "journal") {
    section.style.display = "block";
  }
  
  // Use a delay to ensure the section is displayed before scrolling
  setTimeout(() => {
    section.scrollIntoView({ behavior: "smooth" });
  }, 300);
}