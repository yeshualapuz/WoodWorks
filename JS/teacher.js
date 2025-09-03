import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, addDoc, deleteDoc, 
  query, where 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAubnoJNXMp0eJ9A2bQM1FaOfMlk6X0Les",
  authDomain: "woodworks-dc7b3.firebaseapp.com",
  projectId: "woodworks-dc7b3",
  storageBucket: "woodworks-dc7b3.firebasestorage.app",
  messagingSenderId: "355879129478",
  appId: "1:355879129478:web:35abd92fa5ebb5c60d1c07"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const btnCourses = document.getElementById("btn-courses");
const btnStudents = document.getElementById("btn-students");
const btnSubmissions = document.getElementById("btn-submissions");
const btnAnnouncements = document.getElementById("btn-announcements");

const sectionCourses = document.getElementById("section-courses");
const sectionStudents = document.getElementById("section-students");
const sectionSubmissions = document.getElementById("section-submissions");
const sectionAnnouncements = document.getElementById("section-announcements");

const sections = {
  courses: sectionCourses,
  students: sectionStudents,
  submissions: sectionSubmissions,
  announcements: sectionAnnouncements
};

const buttons = {
  courses: btnCourses,
  students: btnStudents,
  submissions: btnSubmissions,
  announcements: btnAnnouncements
};

function setActiveSection(activeKey) {
  Object.values(sections).forEach(sec => sec.hidden = true);
  sections[activeKey].hidden = false;

  Object.values(buttons).forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed", "false");
  });

  buttons[activeKey].classList.add("active");
  buttons[activeKey].setAttribute("aria-pressed", "true");
}

btnCourses.addEventListener("click", () => setActiveSection("courses"));
btnStudents.addEventListener("click", () => setActiveSection("students"));
btnSubmissions.addEventListener("click", () => setActiveSection("submissions"));
btnAnnouncements.addEventListener("click", () => setActiveSection("announcements"));

setActiveSection("courses");

const coursesTbody = document.getElementById("courses-tbody");

function openModal(contentHtml, onSubmit) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  const closeBtn = document.getElementById("modal-close");

  body.innerHTML = contentHtml;
  modal.classList.add("show");

  closeBtn.onclick = () => modal.classList.remove("show");
  window.onclick = (e) => {
    if (e.target === modal) modal.classList.remove("show");
  };

  const form = body.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      onSubmit(Object.fromEntries(formData));
      modal.classList.remove("show");
    });
  }
}

async function fetchCourses() {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No user logged in, cannot fetch courses.");
    return;
  }

  const q = query(collection(db, "courses"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);

  const courses = [];
  querySnapshot.forEach(docSnap => {
    courses.push({ id: docSnap.id, ...docSnap.data() });
  });

  renderCourses(courses);
}

function renderCourses(courses) {
  coursesTbody.innerHTML = "";
  courses.forEach(course => {
    const tr = document.createElement("tr");
    tr.tabIndex = 0;

    tr.innerHTML = `
      <td><strong>${course.name}</strong></td>
      <td>${course.students}</td>
      <td>${course.modules ? course.modules.length : 0}</td>
      <td>${course.status || "Active"}</td>
    `;

    const detailsTr = document.createElement("tr");
    detailsTr.innerHTML = `
      <td colspan="5">
        <div class="course-details" style="display:none; margin-top:10px;">
          <table class="inner-table" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Type</th>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Title</th>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Link</th>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Actions</th>
              </tr>
            </thead>
            <tbody class="modules-tbody"></tbody>
          </table>
          <button class="add-lesson-btn">Add Lesson</button>
          <button class="add-quiz-btn">Add Quiz</button>
          <button class="delete-course-btn">Delete Course</button>
        </div>
      </td>
    `;

    coursesTbody.appendChild(tr);
    coursesTbody.appendChild(detailsTr);

    const detailsDiv = detailsTr.querySelector(".course-details");

    tr.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
      if(detailsDiv.style.display === "block") renderModules(course, detailsDiv.querySelector(".modules-tbody"));
    });

    detailsTr.querySelector(".add-lesson-btn").addEventListener("click", () => addLesson(course.id));
    detailsTr.querySelector(".add-quiz-btn").addEventListener("click", () => addQuiz(course.id));
    detailsTr.querySelector(".delete-course-btn").addEventListener("click", () => deleteCourse(course.id));
  });
}

function renderModules(course, tbody) {
  tbody.innerHTML = "";
  if(!course.modules) return;

  course.modules.forEach((mod) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mod.type}</td>
      <td>${mod.title}</td>
      <td>${mod.link ? `<a href="${mod.link}" target="_blank">Open</a>` : "-"}</td>
      <td><button class="delete-module-btn" style="background:#e74c3c; color:#fff;">Delete</button></td>
    `;
    tbody.appendChild(tr);
    tr.querySelector(".delete-module-btn").addEventListener("click", () => deleteModule(course.id, mod));
  });
}

async function addLesson(courseId) {
  openModal(`
    <form>
      <label>Lesson Title</label><br>
      <input name="title" required><br><br>
      <label>Google Drive Link</label><br>
      <input name="link" required><br><br>
      <button type="submit">Save Lesson</button>
    </form>
  `, async (data) => {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      modules: arrayUnion({
        type: "lesson",
        title: data.title,
        link: data.link,
        createdAt: new Date().toISOString()
      })
    });
    fetchCourses();
  });
}

async function addQuiz(courseId) {
  openModal(`
    <form id="quiz-form">
      <label>Quiz Title</label><br>
      <input name="title" required><br><br>
      
      <div id="questions-container"></div>
      <button type="button" id="add-question">+ Add Question</button><br><br>
      
      <div id="questions-info" style="margin:10px 0; font-weight:bold; color:#6b4f2d;">
        Number of questions: 0
      </div>

      <button type="submit">Save Quiz</button>
    </form>
  `, async (data) => {
    const questions = [];
    document.querySelectorAll("#questions-container .question").forEach(q => {
      const questionText = q.querySelector("[name='question']").value;
      const correct = q.querySelector("[name='correct']").value;
      const options = [];
      q.querySelectorAll("[name='option']").forEach(opt => options.push(opt.value));
      if (questionText && options.length > 0) {
        questions.push({ question: questionText, options, correct });
      }
    });
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      modules: arrayUnion({
        type: "quiz",
        title: data.title,
        questions,
        createdAt: new Date().toISOString()
      })
    });
    fetchCourses();
  });

  let questionCount = 0;

  document.getElementById("add-question").addEventListener("click", () => {
    questionCount++;
    const container = document.getElementById("questions-container");
    const div = document.createElement("div");
    div.classList.add("question");
    div.innerHTML = `
      <h4 style="margin-bottom:5px; color:#6b4f2d;">Question ${questionCount}</h4>
      <textarea name="question" class="question-textarea" required></textarea><br><br>
      <label>Option A</label><br><input name="option" required><br><br>
      <label>Option B</label><br><input name="option" required><br><br>
      <label>Option C</label><br><input name="option"><br><br>
      <label>Option D</label><br><input name="option"><br><br>
      <label>Correct Answer</label><br>
      <select name="correct" class="correct-select">
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
      <hr>
    `;
    container.appendChild(div);

    document.getElementById("questions-info").textContent = 
      `Number of questions: ${questionCount}`;
  });
}

async function deleteCourse(courseId) {
  if(!confirm("Delete this course?")) return;
  await deleteDoc(doc(db, "courses", courseId));
  fetchCourses();
}

async function deleteModule(courseId, moduleObj) {
  if (!confirm("Delete this module?")) return;

  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDocs(collection(db, "courses"));
  let courseData;

  courseSnap.forEach(docSnap => {
    if (docSnap.id === courseId) courseData = docSnap.data();
  });

  if (!courseData || !courseData.modules) return;

  const filteredModules = courseData.modules.filter(m =>
    !(m.type === moduleObj.type &&
      m.title === moduleObj.title &&
      (m.link || "") === (moduleObj.link || "") &&
      (m.createdAt || "") === (moduleObj.createdAt || ""))
  );

  await updateDoc(courseRef, { modules: filteredModules });
  fetchCourses();
}

async function addCourse() {
  openModal(`
    <form>
      <label>Course Name</label><br>
      <input name="name" required><br><br>
      <button type="submit">Save Course</button>
    </form>
  `, async (data) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create a course.");
      return;
    }

    await addDoc(collection(db, "courses"), {
      name: data.name,
      students: 0,
      modules: [],
      status: "Active",
      createdAt: new Date().toISOString(),
      userId: user.uid // 👈 link course to teacher
    });
    fetchCourses();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const addCourseBtn = document.getElementById("add-course-btn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchCourses();
      if(addCourseBtn) addCourseBtn.addEventListener("click", () => addCourse());
    } else {
      window.location.href = "account.html";
    }
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "account.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
});
