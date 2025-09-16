import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAubnoJNXMp0eJ9A2bQM1FaOfMlk6X0Les",
  authDomain: "woodworks-dc7b3.firebaseapp.com",
  projectId: "woodworks-dc7b3",
  storageBucket: "woodworks-dc7b3.firebasestorage.app",
  messagingSenderId: "355879129478",
  appId: "1:355879129478:web:35abd92fa5ebb5c60d1c07"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUID = null;

const lessons = [
  { title: "Lesson 1: Understanding wood types for your crafts", file: "../Lessons/Lesson-1.pdf" },
  { title: "Lesson 2: Tools and Safety in the Wood Working shop", file: "../Lessons/Lesson-2.pdf" },
  { title: "Lesson 3: Saws Used in Woodworking", file: "../Lessons/Lesson-3.pdf" },
  { title: "Lesson 4: Types Of Planes", file: "../Lessons/Lesson-4.pdf" },
  { title: "Lesson 5: Understanding Chisels in Woodworking", file: "../Lessons/Lesson-5.pdf" },
  { title: "Lesson 6: Measuring and Marking Tools", file: "../Lessons/Lesson-6.pdf" },
  { title: "Lesson 7: Squares and Directional Tools", file: "../Lessons/Lesson-7.pdf" },
  { title: "Lesson 8: ------------------", file: "../Lessons/Lesson-8.pdf" },
  { title: "Lesson 9: Wood Preparation for Wood Joinery", file: "../Lessons/Lesson-9.pdf" },
  { title: "Lesson 10: Wood Joinery for Construction", file: "../Lessons/Lesson-10.pdf" }
];

const quizzes = lessons.map((lesson, index) => ({
  title: `Quiz ${index + 1}`,
  file: `quiz${index + 1}`
}));

onAuthStateChanged(auth, user => {
  if (user) {
    currentUID = user.uid;
    document.getElementById("displayName").textContent = user.displayName || "(Student)";
    renderLessons();
    renderQuizzes();
    renderTaskTable();
    renderProgressReport();
  } else {
    window.location.href = "login.html";
  }
});

window.showAlert = function(message) {
  const customAlert = document.getElementById("customAlert");
  document.getElementById("alertMessage").textContent = message;
  customAlert.style.display = "flex";
};
window.closeAlert = function() {
  const customAlert = document.getElementById("customAlert");
  customAlert.style.display = "none";
};

async function renderLessons() {
  const lessonsList = document.querySelector(".lessons-list");
  if (!lessonsList) return;

  let html = `<h3>LECTURES</h3><ul>`;
  for (let i = 0; i < lessons.length; i++) {
    const lessonDoc = doc(db, `users/${currentUID}/lessons/${i}`);
    const lessonSnap = await getDoc(lessonDoc);
    const opened = lessonSnap.exists() ? lessonSnap.data().opened : false;

    html += `<li>
      ${lessons[i].title} 
      <a href="${lessons[i].file}" target="_blank" rel="noopener" data-index="${i}" class="lesson-link">[Open Lesson]</a>
      <span id="lesson-status-${i}" style="margin-left:10px;color:${opened ? 'green' : 'gray'};">
        ${opened ? "Opened" : ""}
      </span>
    </li>`;
  }
  html += `</ul>`;
  lessonsList.innerHTML = html;

  document.querySelectorAll(".lesson-link").forEach(link => {
    link.addEventListener("click", async e => {
      const index = +e.currentTarget.getAttribute("data-index");
      const lessonRef = doc(db, `users/${currentUID}/lessons/${index}`);
      await setDoc(lessonRef, { opened: true }, { merge: true });

      document.getElementById(`lesson-status-${index}`).textContent = "Opened";
      document.getElementById(`lesson-status-${index}`).style.color = "green";

      const quizRef = doc(db, `users/${currentUID}/quizzes/${quizzes[index].file}`);
      await setDoc(quizRef, { unlocked: true }, { merge: true });

      renderQuizzes();
      renderTaskTable();
    });
  });
}

async function renderQuizzes() {
  const container = document.getElementById("quiz-container");
  if (!container) return;

  let html = `<h3>Quizzes</h3><div id="quiz-buttons"><ul>`;
  for (let i = 0; i < quizzes.length; i++) {
    const quizRef = doc(db, `users/${currentUID}/quizzes/${quizzes[i].file}`);
    const quizSnap = await getDoc(quizRef);
    const quizData = quizSnap.exists() ? quizSnap.data() : { unlocked: false, score: 0, total: 0, percent: 0 };

    html += `<li>
      <button data-file="${quizzes[i].file}" ${!quizData.unlocked ? "disabled" : ""}>${quizzes[i].title}</button>
      ${quizData.score ? `<span class="quiz-score">Score: ${quizData.score}/${quizData.total} (${quizData.percent}%)</span>` : ""}
    </li>`;
  }
  html += `</ul></div>`;
  container.innerHTML = html;

  document.querySelectorAll("#quiz-buttons button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const quizFile = btn.getAttribute("data-file");
      const quizRef = doc(db, `users/${currentUID}/quizzes/${quizFile}`);
      const quizSnap = await getDoc(quizRef);
      const unlocked = quizSnap.exists() ? quizSnap.data().unlocked : false;

      if (!unlocked) {
        showAlert("This quiz is locked. Open the corresponding lesson first.");
        return;
      }
      startQuiz(quizFile);
    });
  });
}

function renderQuiz(quiz) {
  const container = document.getElementById("quiz-container");
  if (!container) return;

  let html = `<h3>${quiz.title}</h3><form id="quiz-form">`;
  quiz.questions.forEach((q, index) => {
    html += `<fieldset data-index="${index}" ${index > 0 ? 'style="display:none;"' : ''}>
      <legend>Q${index + 1}. ${q.q}</legend>`;
    q.options.forEach(opt => {
      html += `<label>
        <input type="radio" name="question-${index}" value="${opt}" required>
        <span>${opt}</span>
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
  <div id="quiz-result"></div>
  `;
  container.innerHTML = html;

  setupQuizNavigation(quiz.questions.length);

  const form = document.getElementById("quiz-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    evaluateQuiz(quiz);
  });
}

async function startQuiz(quizFile) {
  try {
    const res = await fetch(`Quizzes/${quizFile}.json`);
    if (!res.ok) throw new Error("Quiz file not found");
    const quiz = await res.json();
    quiz.file = quizFile;
    renderQuiz(quiz);
    showTab(null, "courses");
  } catch (err) {
    console.error(err);
    showAlert("Failed to load quiz.");
  }
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
    fieldsets.forEach((fs, i) => fs.style.display = i === current ? "block" : "none");
    prevBtn.disabled = current === 0;
    nextBtn.style.display = current === totalQuestions - 1 ? "none" : "inline-block";
    submitBtn.style.display = current === totalQuestions - 1 ? "inline-block" : "none";
  }

  prevBtn.addEventListener("click", () => { if (current > 0) { current--; updateUI(); } });
  nextBtn.addEventListener("click", () => { if (current < totalQuestions - 1) { current++; updateUI(); } });
}

async function evaluateQuiz(quiz) {
  let score = 0;
  quiz.questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="question-${index}"]:checked`);
    if (selected && selected.value === q.answer) score++;
    const options = document.querySelectorAll(`input[name="question-${index}"]`);
    options.forEach(opt => {
      if (opt.value === q.answer) opt.parentElement.style.color = "green";
      else opt.parentElement.style.color = "red";
      opt.disabled = true;
    });
  });

  const total = quiz.questions.length;
  const percent = Math.round((score / total) * 100);

  const quizRef = doc(db, `users/${currentUID}/quizzes/${quiz.file}`);
  await setDoc(quizRef, { unlocked: true, score, total, percent }, { merge: true });

  setTimeout(() => {
    renderQuizzes();
    renderTaskTable();
  }, 100);

  document.getElementById("quiz-result").textContent =
    `You scored ${score} out of ${total} (${percent}%)`;

  const allDone = await Promise.all(quizzes.map(async q => {
    const snap = await getDoc(doc(db, `users/${currentUID}/quizzes/${q.file}`));
    return snap.exists() && snap.data().score !== undefined;
  }));
  if (allDone.every(v => v)) showCertificate(auth.currentUser.displayName);

  await evaluateQuiz(quiz);
  renderProgressReport();
}


async function renderTaskTable() {
  const tbody = document.getElementById("task-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (let i = 0; i < lessons.length; i++) {
    const lessonSnap = await getDoc(doc(db, `users/${currentUID}/lessons/${i}`));
    const opened = lessonSnap.exists() ? lessonSnap.data().opened : false;
    const status = opened ? "Completed" : "Unlocked";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Lesson ${i + 1}</td><td>${status}</td>`;
    tbody.appendChild(tr);
  }

  for (let i = 0; i < quizzes.length; i++) {
    const quizSnap = await getDoc(doc(db, `users/${currentUID}/quizzes/${quizzes[i].file}`));
    const quizData = quizSnap.exists() ? quizSnap.data() : { unlocked: false, score: null, percent: null };
    const status = quizData.score !== null ? `Completed (${quizData.percent}%)` : (quizData.unlocked ? "Unlocked" : "Locked");
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Quiz ${i + 1}</td><td>${status}</td>`;
    tbody.appendChild(tr);
  }
}

document.getElementById("submit-comment").addEventListener("click", async () => {
  const commentBox = document.getElementById("student-comment");
  const feedback = document.getElementById("comment-feedback");
  const comment = commentBox.value.trim();

  if (!comment) {
    feedback.style.color = "red";
    feedback.textContent = "Please write a comment before submitting.";
    return;
  }

  await addDoc(collection(db, `users/${currentUID}/comments`), { text: comment, date: new Date().toISOString() });
  feedback.style.color = "green";
  feedback.textContent = "Comment submitted!";
  commentBox.value = "";
});

function logout() {
  signOut(auth).then(() => window.location.href = "index.html");
}
document.getElementById("logout-btn").addEventListener("click", logout);

async function renderProgressReport() {
  const tbody = document.querySelector("#report-table tbody");
  const overallTd = document.getElementById("overall-average");
  if (!tbody || !overallTd) return;

  tbody.innerHTML = "";

  let totalPercent = 0;
  let completedCount = 0;

  for (let i = 0; i < quizzes.length; i++) {
    const quizSnap = await getDoc(doc(db, `users/${currentUID}/quizzes/${quizzes[i].file}`));
    const quizData = quizSnap.exists() ? quizSnap.data() : { score: null, total: null, percent: null };

    const scoreText = quizData.score !== null ? `${quizData.score}/${quizData.total}` : "-";
    
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${quizzes[i].title}</td><td>${scoreText}</td>`;
    tbody.appendChild(tr);

    if (quizData.percent !== null) {
      totalPercent += quizData.percent;
      completedCount++;
    }
  }

  const avgPercent = completedCount > 0 ? Math.round(totalPercent / completedCount) : 0;
  overallTd.textContent = `${avgPercent}%`;
}
