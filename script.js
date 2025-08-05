let form = document.getElementById("age-form");
let nameInput = document.getElementById("name");
let monthSelect = document.getElementById("dob-month");
let daySelect = document.getElementById("dob-day");
let yearSelect = document.getElementById("dob-year");
let result = document.getElementById("result");
let toast = document.getElementById("toast");
let resetBtn = document.getElementById("reset");
let currentDate = document.getElementById("current-date");
let confetti = document.getElementById("confetti");
let themeSwitch = document.getElementById("theme-switch");
let themeIcon = document.getElementById("theme-icon");
let downloadBtn = document.getElementById("download");
let recalculateBtn = document.getElementById("recalculate");
let resultSound = document.getElementById("result-sound");
let visualCard = document.getElementById("visual-card");
let ageImage = document.getElementById("age-image");
let ageText = document.getElementById("age-text");
let loader = document.getElementById("loader");
let resultSection = document.getElementById("result-section");

currentDate.textContent = new Date().toDateString();

for (let y = new Date().getFullYear(); y >= 1100; y--) {
  let option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  yearSelect.appendChild(option);
}

let populateDays = () => {
  let year = parseInt(yearSelect.value);
  let month = parseInt(monthSelect.value);

  if (isNaN(year) || isNaN(month)) {
    daySelect.innerHTML = '<option value="" disabled selected>Day</option>';
    return;
  }

  let daysInMonth = new Date(year, month + 1, 0).getDate();
  let previouslySelected = parseInt(daySelect.value);
  daySelect.innerHTML = '<option value="" disabled selected>Day</option>';

  for (let d = 1; d <= daysInMonth; d++) {
    let option = document.createElement("option");
    option.value = d;
    option.textContent = d;
    daySelect.appendChild(option);
  }

  if (previouslySelected && previouslySelected <= daysInMonth) {
    daySelect.value = previouslySelected;
  }
};

daySelect.addEventListener("focus", () => {
  let year = parseInt(yearSelect.value);
  let month = parseInt(monthSelect.value);
  if (isNaN(year) && !isNaN(month)) {
    showToast("⚠️ Please select year first");
  }
  if (!isNaN(year) && isNaN(month)) {
    showToast("⚠️ Please select month first");
  }

});

monthSelect.addEventListener("change", populateDays);
yearSelect.addEventListener("change", populateDays);

nameInput.value = localStorage.getItem("name") || "";

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeSwitch.checked = true;
}

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  let theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});

["male", "female"].forEach(gender => {
  ["under10", "under20", "under30", "under40", "40to55", "60to65", "above65"].forEach(group => {
    for (let i = 1; i <= 15; i++) {
      let img = new Image();
      img.src = `img/${gender}/${group}/${i}.webp`;
    }
  });
});

let usedImages = {
  male: {},
  female: {}
};

let getRandomImage = (gender, ageGroup) => {
  if (!usedImages[gender][ageGroup]) {
    usedImages[gender][ageGroup] = shuffle([...Array(15).keys()].map(n => n + 1));
  }

  let currentQueue = usedImages[gender][ageGroup];

  if (currentQueue.length === 0) {
    usedImages[gender][ageGroup] = shuffle([...Array(15).keys()].map(n => n + 1));
  }

  return usedImages[gender][ageGroup].pop();
};

let shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let nameValue = nameInput.value.trim();
  let year = parseInt(yearSelect.value);
  let month = parseInt(monthSelect.value);
  let day = parseInt(daySelect.value);
  let gender = document.querySelector('input[name="gender"]:checked')?.value;

  if (!nameValue || isNaN(year) || isNaN(month) || isNaN(day) || !gender) {
    return showToast("Please fill all fields");
  }

  let birthDate = new Date(year, month, day);
  let today = new Date();
  if (birthDate > today) return showToast("DOB may be in the future");

  localStorage.setItem("name", nameValue);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let diffMs = today - birthDate;
  let totalSec = Math.floor(diffMs / 1000);
  let minutes = Math.floor(totalSec / 60);
  let hours = Math.floor(minutes / 60);

  form.style.display = "none";
  loader.style.display = "block";

  setTimeout(() => {
    loader.style.display = "none";
    resultSection.style.display = "flex";

    result.innerHTML = `
      <p class="typing-line">Hi <strong>${nameValue}</strong>,</p>
      <p class="typing-line">You are <strong>${years}</strong> years, <strong>${months}</strong> months, <strong>${days}</strong> days</p>
      <p class="typing-line">and <strong>${hours % 24}</strong> hours, <strong>${minutes % 60}</strong> minutes, <strong>${totalSec % 60}</strong> seconds old.</p>
    `;

    let isBirthday = today.getDate() === day && today.getMonth() === month;
    confetti.style.display = isBirthday ? "block" : "none";

    let ageGroup = "";
    if (years < 10) ageGroup = "under10";
    else if (years < 20) ageGroup = "under20";
    else if (years < 30) ageGroup = "under30";
    else if (years < 40) ageGroup = "under40";
    else if (years <= 55) ageGroup = "40to55";
    else if (years <= 65) ageGroup = "60to65";
    else ageGroup = "above65";

    let found = false;

    for (let i = 0; i < 10; i++) {
      let random = getRandomImage(gender, ageGroup);
      let imgPath = `img/${gender}/${ageGroup}/${random}.webp`;

      let img = new Image();
      img.onload = () => {
        if (!found) {
          ageImage.src = imgPath;
          ageText.textContent = `${nameValue} is ${years} years old.`;
          visualCard.style.display = "flex";
          found = true;
        }
      };
      img.src = imgPath;
    }

    setTimeout(() => {
      if (!found) {
        ageImage.src = "img/default.webp";
        ageText.textContent = `No image found for your age/gender.`;
        visualCard.style.display = "flex";
      }
    }, 500);

    resultSound.play().catch(() => {});
    downloadBtn.style.display = "block";
    recalculateBtn.style.display = "block";
  }, 800);
});
recalculateBtn.addEventListener("click", () => {
  result.innerHTML = "";
  confetti.style.display = "none";
  visualCard.style.display = "none";
  resultSection.style.display = "none";
  downloadBtn.style.display = "none";
  recalculateBtn.style.display = "none";
  form.style.display = "block";
  form.reset();
  localStorage.removeItem("name");
});

resetBtn.addEventListener("click", () => {
  nameInput.value = "";
  yearSelect.selectedIndex = 0;
  monthSelect.selectedIndex = 0;
  daySelect.selectedIndex = 0;
  result.innerHTML = "";
  toast.textContent = "";
  confetti.style.display = "none";
  visualCard.style.display = "none";
  resultSection.style.display = "none";
  form.style.display = "block";
  localStorage.removeItem("name");
});

downloadBtn.addEventListener("click", () => {
  html2canvas(document.querySelector(".container")).then(canvas => {
    let link = document.createElement("a");
    link.download = "age-result.webp";
    link.href = canvas.toDataURL();
    link.click();
  });
});

let showToast = (msg) => {
  toast.textContent = msg;
  setTimeout(() => {
    toast.textContent = "";
  }, 3000);
};

document.getElementById("year").textContent = new Date().getFullYear();
