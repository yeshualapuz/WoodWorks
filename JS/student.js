const units = [
  { name: "Wood Basics", points: 20, correct: 1, answered: 1, assessments: 5, status: "in progress" },
  { name: "Wood Branching", points: null, correct: 0, answered: 0, assessments: 4, status: "ready to go" },
  { name: "Wood Loops", points: null, correct: 0, answered: 0, assessments: 8, status: "ready to go" },
  { name: "Joinery Playground (not a tutorial)", points: null, correct: 0, answered: 0, assessments: 0, status: "ready to go" }
];

const tbody = document.getElementById('units-tbody');

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
      alert(`Opening assessments for "${units[index].name}"`);
    });
  });
}

renderTable();

function logout() {
  alert('Logging out...');
}

const lessons = [
  { title: "Introduction to Woodworking", pdf: "../Lessons/Wood-Working.pdf" },
  //{ title: "Wood Types and Properties", pdf: "../Lessons/Wood-Working.pdf" },
  //{ title: "Basic Joinery Techniques", pdf: "../Lessons/Wood-Working.pdf" },
  //{ title: "Sanding and Finishing", pdf: "../Lessons/Wood-Working.pdf" }
];

const lessonStatus = lessons.map(() => false);

function renderLessons() {
  const lessonsList = document.querySelector('.lessons-list');
  if (!lessonsList) return;

  let html = `<h3>Lessons</h3><ul>`;
  lessons.forEach((lesson, index) => {
    html += `<li>
      ${lesson.title} 
      <a href="${lesson.pdf}" target="_blank" rel="noopener" data-index="${index}" class="lesson-link">[View PDF]</a>
      <span id="lesson-status-${index}" style="margin-left:10px;color:gray;">Not opened</span>
    </li>`;
  });
  html += `</ul>`;
  lessonsList.innerHTML = html;

  document.querySelectorAll('.lesson-link').forEach(link => {
    link.addEventListener('click', e => {
      const index = +e.currentTarget.getAttribute('data-index');
      lessonStatus[index] = true;
      document.getElementById(`lesson-status-${index}`).textContent = "Opened";
      document.getElementById(`lesson-status-${index}`).style.color = "green";
      updateQuizLocks();
    });
  });
}

const quizzes = [
  { title: "Wood Basics Quiz", file: "woodworking" },
  { title: "Joinery Quiz", file: "woodworking" },
  { title: "Finishing Quiz", file: "woodworking" }
];

function renderQuizzes() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  let html = `<h3>Quizzes</h3><div id="quiz-buttons"><ul>`;
  quizzes.forEach(q => {
    html += `<li><button data-file="${q.file}">${q.title}</button></li>`;
  });
  html += `</ul></div>`;
  container.innerHTML = html;

  document.querySelectorAll('#quiz-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!lessonStatus.every(status => status)) {
        alert("You must open all lessons before taking the quiz!");
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
      renderQuiz(quiz);
      showTab(null, 'courses');
    })
    .catch(err => {
      console.error(err);
      alert("Failed to load quiz.");
    });
}

function renderQuiz(quiz) {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  let html = `<h3>${quiz.title}</h3><form id="quiz-form">`;
  quiz.questions.forEach((q, index) => {
    html += `<fieldset><legend>Q${index + 1}. ${q.q}</legend>`;
    q.options.forEach(option => {
      html += `<label>
                 <input type="radio" name="question-${index}" value="${option}" required>
                 ${option}
               </label><br>`;
    });
    html += `</fieldset>`;
  });
  html += `<button type="submit">Submit Quiz</button></form>`;
  html += `<div id="quiz-result" style="margin-top:20px; font-weight:bold;"></div>`;
  container.innerHTML = html;

  document.getElementById('quiz-form').addEventListener('submit', e => {
    e.preventDefault();
    evaluateQuiz(quiz);
    renderQuizzes();
    updateQuizLocks();
  });
}

function evaluateQuiz(quiz) {
  let score = 0;
  quiz.questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="question-${index}"]:checked`);
    if (selected && selected.value === q.answer) score++;
  });
  const total = quiz.questions.length;
  document.getElementById('quiz-result').textContent = `You scored ${score} out of ${total} (${Math.round((score / total) * 100)}%)`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  renderLessons();
  renderQuizzes();
  updateQuizLocks();
});
