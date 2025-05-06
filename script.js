window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    document.querySelector('.cloud1').style.transform = `translateY(${scrollY * 0.3}px)`;
    document.querySelector('.cloud2').style.transform = `translateY(${scrollY * 0.5}px)`;
    document.querySelector('.cloud3').style.transform = `translateY(${scrollY * 0.2}px)`;
    document.querySelector('.cloud4').style.transform = `translateY(${scrollY * 0.4}px)`;
});
 
async function submitText() {
    const text = document.getElementById("dreamText").value.trim();
    if (!text) {
      alert("Please enter your dream description!");
      return;
    }
  
    document.getElementById("aiOutput").innerHTML = "<p>Generating image...</p>";
  
    try {
      const response = await fetch("https://api.deepai.org/api/text2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "api-key": "YOUR_API_KEY"  
        },
        body: `text=${encodeURIComponent(text)}`
      });
  
      const result = await response.json();

    if (result.output_url) {
        document.getElementById("aiOutput").innerHTML = `<img src="${result.output_url}" width="300">`;
    } else {
        document.getElementById("aiOutput").innerHTML = `Error: ${result.err || JSON.stringify(result)}`;
    }
      
  
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("aiOutput").innerHTML = "<p>Something went wrong. Please try again later.</p>";
    }
}
  

function submitDrawing() {
    const canvas = document.getElementById("dreamCanvas");
    const imageData = canvas.toDataURL();
    document.getElementById("aiOutput").innerHTML = `<p>AI generated painting (simulated):</p><img src="${imageData}" width="200">`;
}

function viewJournal() {
    const journalSection = document.getElementById("journal");
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    const container = document.getElementById("journalEntries");
    container.innerHTML = "";
  
    if (entries.length === 0) {
      container.innerHTML = "<p>No journal entries yet.</p>";
    } else {
      entries.reverse().forEach(entry => {
        const div = document.createElement("div");
        div.innerHTML = `<h4>${entry.date}</h4>${entry.content}<hr>`;
        container.appendChild(div);
      });
    }
  
    journalSection.style.display = "block";
    journalSection.scrollIntoView({ behavior: "smooth" });
}

const canvas = document.getElementById("dreamCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;
  
canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);
canvas.addEventListener("mousemove", draw);
  
function draw(e) {
    if (!drawing) return;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, 2, 0, Math.PI * 2);
    ctx.fill();
}