let searchInput = document.getElementById("searchInput");
let btn = document.getElementById("btn");
let icon = document.getElementById("icon");
let resetBtn = document.getElementById("resetBtn");
let resultBox = document.getElementById("result") || document.querySelector(".container");

// Display date and time
const header = document.createElement("div");
header.id = "dateTime";
header.style.cssText = "text-align:center;margin-bottom:10px;color:var(--secondary-color);font-size:18px;";
document.body.insertBefore(header, document.body.firstChild);
function updateDateTime() {
  const now = new Date();
  const formatted = now.toLocaleString();
  header.innerText = `📅 ${formatted}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Theme toggle with localStorage support
icon.onclick = function () {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  icon.src = isDark ? "sun.png" : "moon.png";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// Apply saved theme and restore search input
window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    icon.src = "sun.png";
  } else {
    icon.src = "moon.png";
  }

  const lastWord = localStorage.getItem("lastSearch");
  if (lastWord) {
    searchInput.value = lastWord;
    getData(lastWord);
  }
};

// Function to speak the word
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(utterance);
}

const getData = async (searchValue) => {
  resultBox.innerHTML = "<div class='fade-in'>Loading...</div>";
  try {
    let data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchValue}`);
    let jsonData = await data.json();

    const word = jsonData[0].word;
    const meaning = jsonData[0].meanings[0];
    const def = meaning.definitions[0];
    const synonym = meaning.synonyms[0] || 'N/A';
    const antonym = meaning.antonyms[0] || 'N/A';
    const example = def.example || 'N/A';
    const partOfSpeech = meaning.partOfSpeech;

    resultBox.innerHTML = `
      <div class="fade-in">
        <h2 class="w">Word: <span>${word}</span> <button onclick="speakWord('${word}')">🔊</button></h2>
        <p class="pos"><strong>Part of Speech:</strong> ${partOfSpeech}</p>
        <p class="def"><strong>Meaning:</strong> ${def.definition}</p>
        <p class="exam"><strong>Example:</strong> ${example}</p>
        <p class="syn"><strong>Synonym:</strong> ${synonym}</p>
        <p class="ant"><strong>Antonym:</strong> ${antonym}</p>
        <a class="readmore" href="${jsonData[0].sourceUrls[0]}" target="_blank">Read More</a>
        <a class="submit" href="#" id="backBtn">Back</a>
      </div>
    `;

    localStorage.setItem("lastSearch", searchValue);

    // Back button functionality
    document.getElementById("backBtn").addEventListener("click", function (e) {
      e.preventDefault();
      resultBox.innerHTML = `
        <input type="text" placeholder="Enter the word" id="searchInput" value="${searchValue}" />
        <button id="btn">Search</button>
      `;
      document.getElementById("btn").addEventListener("click", function () {
        let newSearchValue = document.getElementById("searchInput").value.trim();
        if (newSearchValue === "") {
          alert("Please enter a word");
        } else {
          getData(newSearchValue);
        }
      });
    });
  } catch (error) {
    resultBox.innerHTML = `<p class='fade-in' style="color:red;">Word not found. Please try another word.</p>`;
  }
};

btn.addEventListener("click", function () {
  let searchValue = searchInput.value.trim();
  if (searchValue === "") {
    alert("Please enter a word");
  } else {
    getData(searchValue);
  }
});

// Reset everything
if (!resetBtn) {
  resetBtn = document.createElement("button");
  resetBtn.id = "resetBtn";
  resetBtn.innerText = "Reset All";
  resetBtn.style.cssText = "position:fixed;bottom:20px;right:20px;padding:10px;background:red;color:white;border:none;border-radius:8px;cursor:pointer;z-index:1000;";
  document.body.appendChild(resetBtn);
}
resetBtn.onclick = () => {
  localStorage.clear();
  window.location.reload();
};
