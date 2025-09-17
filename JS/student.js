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
  { title: "Lesson 2: Tools and Safety in the Wood Working shop", file: "../Lessons/Lesson-2.pdf" , link: "https://youtu.be/S8iLg2NkChI?si=-EmPW8SfcBD__nnd", icon: "../images/yt.png" },
  { title: "Lesson 3: Saws Used in Woodworking", file: "../Lessons/Lesson-3.pdf" , link: "https://youtu.be/S8iLg2NkChI?si=-EmPW8SfcBD__nnd", icon: "../images/yt.png"},
  { title: "Lesson 4: Types Of Planes", file: "../Lessons/Lesson-4.pdf", link: "https://youtu.be/S8iLg2NkChI?si=-EmPW8SfcBD__nnd", icon: "../images/yt.png" },
  { title: "Lesson 5: Understanding Chisels in Woodworking", file: "../Lessons/Lesson-5.pdf" },
  { title: "Lesson 6: Measuring and Marking Tools", file: "../Lessons/Lesson-6.pdf", link: "https://youtu.be/pxU40CA5id8?si=yLMOfxPux7DUxyt-", icon: "../images/yt.png" },
  { title: "Lesson 7: Squares and Directional Tools", file: "../Lessons/Lesson-7.pdf" },
  { title: "Lesson 8: ------------------------------------", file: "../Lessons/Lesson-12.pdf" },
  { title: "Lesson 9: Wood Preparation for Wood Joinery", file: "../Lessons/Lesson-9.pdf" },
  { title: "Lesson 10: Wood Joinery for Construction", file: "../Lessons/Lesson-10.pdf" , link: "https://youtu.be/IcILLtJUnXY?si=t1MASfYEwy2GB_RD", icon: "../images/yt.png"  },
  { title: "Lesson 11: More Joineries in Woodworking", file: "../Lessons/Lesson-11.pdf" },
  { title: "Lesson 12: Glueing and Clamping", file: "../Lessons/Lesson-12.pdf" },
  { title: "Lesson 13: Drills and Fasteners", file: "../Lessons/Lesson-13.pdf" },
  { title: "Lesson 14: Finishing Techniques", file: "../Lessons/Lesson-14.pdf" },
  { title: "Lesson 15: Sealing, Staining and Finishing", file: "../Lessons/Lesson-15.pdf" }
];

const quizzes = lessons.map((lesson, index) => ({
  title: `Quiz ${index + 1}`,
  file: `Quiz ${index + 1}`
}));

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUID = user.uid;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    let studentName = "(Student)";
    if (userDoc.exists()) {
      const data = userDoc.data();
      const first = capitalize(data.firstName);
      const last = capitalize(data.lastName);
      studentName = `${first} ${last}`.trim();
    }

    document.getElementById("displayName").textContent = studentName || "(Student)";

    renderLessons();
    renderQuizzes();
    renderTaskTable();
    renderProgressReport();
    renderAnnouncement();
  } else {
    window.location.href = "login.html";
  }
await loadActivities();   // populate activity textareas if previously submitted
initActivityListeners();  // attach submit buttons

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
      ${lessons[i].link && lessons[i].icon ? `<img src="${lessons[i].icon}" class="yt-icon" style="width:25px;cursor:pointer;" onclick="window.open('${lessons[i].link}', '_blank')">` : ""}
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
      await setDoc(lessonRef, { opened: true, startDate: new Date() }, { merge: true });

      document.getElementById(`lesson-status-${index}`).textContent = "Opened";
      document.getElementById(`lesson-status-${index}`).style.color = "green";

      const quizRef = doc(db, `users/${currentUID}/quizzes/${quizzes[index].file}`);
      await setDoc(quizRef, { unlocked: true }, { merge: true });

      renderQuizzes();
      renderTaskTable();
    });
  });
}

// ============ ACTIVITIES: load/save & listeners ============
async function loadActivities() {
  const activities = ["activity1", "activity2", "activity3"];
  for (const act of activities) {
    const snap = await getDoc(doc(db, `users/${currentUID}/activities/${act}`));
    if (snap.exists()) {
      const data = snap.data();
      const ta = document.getElementById(`${act}-text`);
      if (ta) ta.value = data.answer || "";
    }
  }
}

async function saveActivity(activityId, answer) {
  // save to Firestore (merge)
  await setDoc(doc(db, `users/${currentUID}/activities/${activityId}`), {
    answer,
    submittedAt: new Date()
  }, { merge: true });

  const feedback = document.getElementById(`${activityId}-feedback`);
  if (feedback) {
    feedback.textContent = "✅ Your answer was saved!";
    setTimeout(() => feedback.textContent = "", 3000);
  }

  // ✅ Hide the activity card after saving
  const activityCard = document.getElementById(activityId);
  if (activityCard) activityCard.classList.remove("active");

  // update UI/progress
  await renderQuizzes();      // refresh activity buttons / checkmarks
  await renderTaskTable();
  await renderProgressReport();
}

function initActivityListeners() {
  document.querySelectorAll(".submit-activity").forEach(btn => {
    btn.addEventListener("click", async () => {
      const activityId = btn.getAttribute("data-activity");
      const textarea = document.getElementById(`${activityId}-text`);
      if (!textarea || !textarea.value.trim()) {
        showAlert("Please write your answer before submitting.");
        return;
      }
      btn.disabled = true;
      await saveActivity(activityId, textarea.value.trim());
      btn.disabled = false;
    });
  });
}


async function renderQuizzes() {
  const container = document.getElementById("quiz-container");
  if (!container) return;

  // 1) prefetch quiz docs
  const quizResults = [];
  for (let i = 0; i < quizzes.length; i++) {
    const snap = await getDoc(doc(db, `users/${currentUID}/quizzes/${quizzes[i].file}`));
    quizResults.push(snap.exists() ? snap.data() : { unlocked: false, score: null, total: null, percent: null });
  }

  // 2) prefetch activities
  const activityIds = ["activity1", "activity2", "activity3"];
  const activitiesData = {};
  for (const act of activityIds) {
    const snap = await getDoc(doc(db, `users/${currentUID}/activities/${act}`));
    activitiesData[act] = snap.exists() ? snap.data() : null;
  }

  // 3) build HTML (insert activity buttons at desired indexes)
  let html = `<h3>Quizzes</h3><div id="quiz-buttons"><ul>`;
  for (let i = 0; i < quizzes.length; i++) {
    // insert Activity 1 before Quiz 6 (i === 5)
    if (i === 5) {
      const unlocked = quizResults.slice(0, 5).every(q => q && q.score !== null && q.score > 0);
      const completed = activitiesData.activity1 && activitiesData.activity1.answer?.trim();
      html += `<li><button class="activity-btn" data-target="activity1" data-activity="activity1" ${unlocked ? "" : "disabled"}>${completed ? '<span class="activity-done">✓</span>' : ''}--- Activity 1 ---</button></li>`;
    }
    // insert Activity 2 before Quiz 11 (i === 10)
    if (i === 10) {
      const unlocked = quizResults.slice(5, 10).every(q => q && q.score !== null && q.score > 0);
      const completed = activitiesData.activity2 && activitiesData.activity2.answer?.trim();
      html += `<li><button class="activity-btn" data-target="activity2" data-activity="activity2" ${unlocked ? "" : "disabled"}>${completed ? '<span class="activity-done">✓</span>' : ''}--- Activity 2 ---</button></li>`;
    }
    
    const qData = quizResults[i];
    html += `<li>
      <button data-file="${quizzes[i].file}" ${!qData.unlocked ? "disabled" : ""}>${quizzes[i].title}</button>
      ${qData.score ? `<span class="quiz-score">Score: ${qData.score}/${qData.total} (${qData.percent}%)</span>` : ""}
    </li>`;
  }
      // Activity 3 after Quiz 15
    const unlocked3 = quizResults.slice(10, 15).every(q => q && q.score !== null);
    const completed3 = activitiesData.activity3 && activitiesData.activity3.answer?.trim();
    html += `<li>
      <button class="activity-btn" data-target="activity3" data-activity="activity3" ${unlocked3 ? "" : "disabled"}> ${completed3 ? '<span class="activity-done">✓</span>' : ''}--- Activity 3 --- </button>
    </li>`;

  html += `</ul></div>`;
  container.innerHTML = html;

  // 4) attach quiz button listeners (same behavior as before)
  document.querySelectorAll("#quiz-buttons button[data-file]").forEach(btn => {
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

  // 5) attach activity button listeners (scroll or locked alert)
  document.querySelectorAll(".activity-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) {
        showAlert("Complete the required quizzes first to unlock this activity.");
        return;
      }

        // ✅ Prevent reopening if already completed
      if (btn.classList.contains("completed")) {
        showAlert("You've already submitted this activity. ✅");
        return;
      }

      const targetId = btn.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (target) {
      // ✅ Hide all activity cards first
      document.querySelectorAll(".activity-card").forEach(c => c.classList.remove("active"));
      
      // ✅ Show only the clicked one
      target.classList.add("active");
      
      // ✅ Smooth scroll to it
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
  const quizSnap = await getDoc(quizRef);

  if (!quizSnap.exists()) {
    await setDoc(quizRef, { unlocked: true, score, total, percent, timestamp: new Date() }, { merge: true });
  } else {
    const previousPercent = quizSnap.data().percent || 0;
    if (percent > previousPercent) {
      await setDoc(quizRef, { score, total, percent, timestamp: new Date() }, { merge: true });
    } else {
      await setDoc(quizRef, { unlocked: true }, { merge: true });
    }
  }

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

  renderProgressReport();
}

async function renderTaskTable() {
  const tbody = document.getElementById("task-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (let i = 0; i < lessons.length; i++) {
    const lessonSnap = await getDoc(doc(db, `users/${currentUID}/lessons/${i}`));
    const opened = lessonSnap.exists() ? lessonSnap.data().opened : false;
    const status = opened ? '<b style="color:green;">Completed</b>' : "Unlocked";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Lesson ${i + 1}</td><td>${status}</td>`;
    tbody.appendChild(tr);
  }

  for (let i = 0; i < quizzes.length; i++) {
    const quizSnap = await getDoc(doc(db, `users/${currentUID}/quizzes/${quizzes[i].file}`));
    const quizData = quizSnap.exists() ? quizSnap.data() : { unlocked: false, score: null, percent: null };
    const status = quizData.score !== null ? `<b style="color:green;">Completed</b> (${quizData.percent}%)`  : (quizData.unlocked ? "Unlocked" : "Locked");
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Quiz ${i + 1}</td><td>${status}</td>`;
    tbody.appendChild(tr);
  }

  // Add Activities to Task Progress Table
const activities = ["activity1", "activity2", "activity3"];
for (let i = 0; i < activities.length; i++) {
  const ref = doc(db, `users/${currentUID}/activities/${activities[i]}`);
  const snap = await getDoc(ref);
  const completed = snap.exists() && snap.data().answer?.trim() !== "";
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>Activity ${i + 1}</td><td>${completed ? '<b style="color:green;">Completed</b>' : "Pending"}</td>`;
  tbody.appendChild(tr);
}


}

async function renderAnnouncement() {
  const container = document.getElementById("teacher-announcement");

  try {
    const announcementRef = doc(db, "announcements", "latest");
    const snap = await getDoc(announcementRef);

    if (snap.exists()) {
      const data = snap.data();
      container.innerHTML = `
        <h3>Teacher Announcement</h3>
        <p><strong>Name:</strong> ${data.teacherName || ""}</p>
        <p><strong>Date:</strong> ${data.date || ""}</p>
        <p><strong>Note:</strong> ${data.note || ""}</p>
      `;
    } else {
      container.innerHTML = `
        <h3>Teacher Announcement</h3>
        <p>No announcement yet...</p>
      `;
    }
  } catch (err) {
    console.error("Error loading announcement:", err);
    container.innerHTML = `
      <h3>Teacher Announcement</h3>
      <p>No announcement yet...</p>
    `;
  }
}

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

  try {
    await setDoc(doc(db, "users", currentUID), { progress: avgPercent }, { merge: true });
    console.log("Progress saved:", avgPercent);
  } catch (err) {
    console.error("Error saving progress:", err);
  }

  // Activities contribute 100% each when submitted
const activities = ["activity1", "activity2", "activity3"];
for (let i = 0; i < activities.length; i++) {
  const snap = await getDoc(doc(db, `users/${currentUID}/activities/${activities[i]}`));
  const completed = snap.exists() && snap.data().answer?.trim() !== "";
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>Activity ${i + 1}</td><td>${completed ? "Submitted" : "-"}</td>`;
  tbody.appendChild(tr);

  if (completed) {
    totalPercent += 100; // treat activity as 100%
    completedCount++;
  }
}

}