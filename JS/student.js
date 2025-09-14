function showAlert(message) {
  document.getElementById("alertMessage").textContent = message;
  document.getElementById("customAlert").style.display = "flex";
}

function closeAlert() {
  document.getElementById("customAlert").style.display = "none";
}


const units = [
  { name: "Wood Basics", points: 20, correct: 1, answered: 1, assessments: 5, status: "in progress" },
  { name: "Wood Branching", points: null, correct: 0, answered: 0, assessments: 4, status: "ready to go" },
  { name: "Wood Loops", points: null, correct: 0, answered: 0, assessments: 8, status: "ready to go" },
  { name: "Joinery Playground (not a tutorial)", points: null, correct: 0, answered: 0, assessments: 0, status: "ready to go" }
];



const tbody = document.getElementById('units-tbody');
let quizAttempts = JSON.parse(localStorage.getItem("quizAttempts")) || {};



function createLockIcon(locked) {
  return locked
    ? `<svg class="lock-icon locked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7h-1V7a5 5 0 0 0-10 0v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 7a4 4 0 0 1 8 0v3H8V7z"/></svg>`
    : `<svg class="lock-icon unlocked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7h-8v-3a4 4 0 0 1 8 0v3zm-2 0v-3a2 2 0 0 0-4 0v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2z"/></svg>`;
}

function renderTable() {
  tbody.innerHTML = '';
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const prevUnitCompleted = i === 0 || units[i - 1].correct > 0;
    const isUnlocked = prevUnitCompleted;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${unit.name}</td>
      <td>${unit.points !== null ? unit.points : ''}</td>
      <td>${unit.correct}</td>
      <td>${unit.answered}</td>
      <td>
        <span class="assessment ${isUnlocked ? 'unlocked' : 'locked'}" data-index="${i}">
          ${unit.assessments} Assessment${unit.assessments !== 1 ? 's' : ''} ${createLockIcon(!isUnlocked)}
        </span>
      </td>
      <td class="status ${unit.correct > 0 ? 'in-progress' : 'ready'}">${unit.correct > 0 ? 'in progress' : 'ready to go'}</td>
    `;
    tbody.appendChild(tr);
  }

  document.querySelectorAll('.assessment.unlocked').forEach(elem => {
    elem.addEventListener('click', () => {
      const index = +elem.getAttribute('data-index');
      showAlert(`Opening assessments for "${units[index].name}"`);
    });
  });
}

renderTable();



const lessons = [
  { title: "Lesson 1: Understanding wood types for your crafts", file: "../Lessons/Lesson-1.pdf", opened: false },
  { title: "Lesson 2: Tools and Safety in the Wood Working shop", file: "../Lessons/Lesson-2.pdf", opened: false },
  { title: "Lesson 3: Saws Used in Woodworking", file: "../Lessons/Lesson-3.pdf", opened: false },
  { title: "Lesson 4: Types Of Planes", file: "../Lessons/Lesson-4.pdf", opened: false },
  { title: "Lesson 5: Understanding Chisels in Woodworking", file: "../Lessons/Lesson-5.pdf", opened: false },
  { title: "Lesson 6: Measuring and Marking Tools", file: "../Lessons/Lesson-6.pdf", opened: false },
  { title: "Lesson 7: Squares and Directional Tools", file: "../Lessons/Lesson-7.pdf", opened: false },
  { title: "Lesson 8: ------------------", file: "../Lessons/Lesson-8.pdf", opened: false },
  { title: "Lesson 9: Wood Preparation for Wood Joinery", file: "../Lessons/Lesson-9.pdf", opened: false },
  { title: "Lesson 10: Wood Joinery for Construction", file: "../Lessons/Lesson-10.pdf", opened: false }
  
];

const quizzes = lessons.map((lesson, index) => ({
  title: `Quiz ${index + 1}`,
  file: `quiz${index + 1}`,
  unlocked: false
}));

const lessonStatus = lessons.map(() => false);

function renderLessons() {
  const lessonsList = document.querySelector('.lessons-list');
  if (!lessonsList) return;

  let html = `<h3>LECTURES</h3><ul>`;
  lessons.forEach((lesson, index) => {
    html += `<li>
      ${lesson.title} 
      <a href="./Lessons/${lesson.file}" target="_blank" rel="noopener" data-index="${index}" class="lesson-link">[Open Lesson]</a>
      <span id="lesson-status-${index}" style="margin-left:10px;color:${lesson.opened ? 'green' : 'gray'};">
    </li>`;
  });


  html += `</ul>`;
  lessonsList.innerHTML = html;

  document.querySelectorAll('.lesson-link').forEach(link => {
    link.addEventListener('click', e => {
      const index = +e.currentTarget.getAttribute('data-index');
      lessons[index].opened = true;
      localStorage.setItem("lessonsProgress", JSON.stringify(lessons));

      document.getElementById(`lesson-status-${index}`).textContent = "Opened";
      document.getElementById(`lesson-status-${index}`).style.color = "green";

      quizzes[index].unlocked = true;
      localStorage.setItem("quizzesProgress", JSON.stringify(quizzes));

      renderQuizzes();
    });
  });
}


function renderQuizzes() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  let html = `<h3>Quizzes</h3><div id="quiz-buttons"><ul>`;
  quizzes.forEach(q => {
    const taken = quizAttempts[q.file];
    const lessonsOpened = lessonStatus.every(status => status); // check lessons

    html += `<li>
      <button data-file="${q.file}" ${!lessonsOpened ? "disabled" : ""}>
        ${q.title}
      </button>
      ${taken && lessonsOpened ? `<span class="quiz-score">Score: ${taken.score}/${taken.total} (${taken.percent}%)</span>` : ""}
    </li>`;
  });
  html += `</ul></div>`;
  container.innerHTML = html;

  // bind click events
  document.querySelectorAll('#quiz-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!lessonStatus.every(status => status)) {
        showAlert("You must open all lessons before taking the quiz!");
        return;
      }
      startQuiz(btn.getAttribute('data-file'));
    });
  });
}


function updateQuizLocks() {
  const allOpened = lessonStatus.every(status => status);
  document.querySelectorAll('#quiz-buttons button').forEach(btn => {
    btn.disabled = !allOpened;
    btn.style.opacity = allOpened ? 1 : 0.5;
  });
}

function startQuiz(quizFile) {
  fetch(`../Quizzes/${quizFile}.json`)
    .then(res => {
      if (!res.ok) throw new Error("Quiz file not found");
      return res.json();
    })
    .then(quiz => {
      quiz.file = quizFile; // important para matukoy kung aling quiz
      renderQuiz(quiz);
      showTab(null, 'courses');
    })
    .catch(err => {
      console.error(err);
      showAlert("Failed to load quiz.");
    });
}

function renderQuiz(quiz) {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  let html = `
    <h3>${quiz.title}</h3>
    <div id="quiz-progress">
      <div id="quiz-progress-text">Question 1 of ${quiz.questions.length}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%;"></div>
      </div>
    </div>
    <form id="quiz-form">
  `;

  quiz.questions.forEach((q, index) => {
    html += `<fieldset data-index="${index}" ${index > 0 ? 'style="display:none;"' : ''}>
      <legend>Q${index + 1}. ${q.q}</legend>`;
    q.options.forEach(option => {
      html += `<label>
                 <input type="radio" name="question-${index}" value="${option}" required>
                 <span>${option}</span>
               </label>`;
    });
    html += `</fieldset>`;
  });

  html += `
    <div class="quiz-navigation">
      <button type="button" id="prev-btn" disabled>Previous</button>
      <button type="button" id="next-btn">Next</button>
      <button type="submit" id="submit-btn" style="display:none;">Submit Quiz</button>
    </div>
  </form>
  <div id="quiz-result"></div>`;
  
  container.innerHTML = html;

  setupQuizNavigation(quiz.questions.length);

  const form = document.getElementById("quiz-form");
  form.addEventListener("submit", e => {
    e.preventDefault(); // para hindi mag reset
    evaluateQuiz(quiz);
  });

}

function setupQuizNavigation(totalQuestions) {
  let current = 0;
  const fieldsets = document.querySelectorAll("#quiz-form fieldset");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const progressText = document.getElementById("quiz-progress-text");
  const progressFill = document.querySelector(".progress-fill");

  function updateUI() {
    fieldsets.forEach((fs, i) => {
      fs.style.display = i === current ? "block" : "none";
    });

    prevBtn.disabled = current === 0;
    nextBtn.style.display = current === totalQuestions - 1 ? "none" : "inline-block";
    submitBtn.style.display = current === totalQuestions - 1 ? "inline-block" : "none";

    // Disable next if no option selected
    const selected = fieldsets[current].querySelector('input[type="radio"]:checked');
    nextBtn.disabled = !selected;

    progressText.textContent = `Question ${current + 1} of ${totalQuestions}`;
    progressFill.style.width = `${((current + 1) / totalQuestions) * 100}%`;
  }

  prevBtn.addEventListener("click", () => {
    if (current > 0) {
      current--;
      updateUI();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (current < totalQuestions - 1) {
      current++;
      updateUI();
    }
  });

  // Add listener to radio buttons to enable Next
  fieldsets.forEach(fs => {
    fs.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        updateUI(); // enable Next when user selects
      });
    });
  });

  updateUI();
}



function evaluateQuiz(quiz) {

  let score = 0;
  quiz.questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="question-${index}"]:checked`);
    const correctAnswer = q.answer;

    if (selected && selected.value === correctAnswer) {
      score++;
    }

    // ipakita ang correct answer
    const options = document.querySelectorAll(`input[name="question-${index}"]`);
    options.forEach(opt => {
      if (opt.value === correctAnswer) {
        opt.parentElement.style.color = "green"; // highlight correct
        opt.parentElement.style.fontWeight = "bold";
      } else {
        opt.parentElement.style.color = "red";
      }
      opt.disabled = true; // disable lahat ng options
    });
  });

  const total = quiz.questions.length;
  const percent = Math.round((score / total) * 100);

  // Save attempt (lock quiz)
 quizAttempts[quiz.file] = { score, total, percent };
 localStorage.setItem("quizAttempts", JSON.stringify(quizAttempts));

  // Show result message
document.getElementById('quiz-result').textContent =
  `You scored ${score} out of ${total} (${percent}%)`;

// Disable quiz form inputs after submit
const form = document.getElementById('quiz-form');
if (form) {
  form.querySelectorAll("input, button").forEach(el => el.disabled = true);
}

// Refresh quizzes list para lumabas score at ma-lock
renderQuizzes();
updateQuizLocks();


const allDone = quizzes.every(q => quizAttempts[q.file]);
if (allDone) {
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  showCertificate(`${firstName} ${lastName}`);
}

}

document.addEventListener('DOMContentLoaded', () => {
  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  document.getElementById("displayName").textContent = `${firstName} ${lastName}`;  renderTable();
  renderLessons();
  renderQuizzes();
  updateQuizLocks();
});


function logout() {
  window.location.href = 'index.html';
}

function showCertificate(studentName) {
  const container = document.getElementById("certificate-container");
  const canvas = document.getElementById("certificate-canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = "TemporaryCertificate.png"; // your certificate background image
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw background
    ctx.drawImage(img, 0, 0);

    // Add student name (adjust coordinates & font to fit your design)
    ctx.font = "48px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(studentName, canvas.width / 2, canvas.height / 2);

    // Show container
    container.style.display = "block";
  };

  // Download button
  document.getElementById("download-certificate").onclick = () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "TemporaryCertificate.png";
    link.click();
  };
}
