import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
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

const fixedCourses = [
  {
    id: "c1",
    name: "Woodworking Basics",
    students: 0,
    status: "Active",
    modules: [
      { type: "lesson", title: "Intro to Tools", link: "" },
      { type: "quiz", title: "Tools Quiz", link: "woodworking" },
      { type: "pdf", title: "Safety Manual", link: "../Lessons/Wood-Working.pdf" }
    ]
  },
  {
    id: "c2",
    name: "Advanced Woodworking",
    students: 0,
    status: "Active",
    modules: [
      { type: "lesson", title: "Carving Techniques", link: "" },
      { type: "quiz", title: "Carving Quiz", link: "woodworking" },
      { type: "pdf", title: "Advanced Joints Guide", link: "" }
    ]
  },
  {
    id: "c3",
    name: "Wood Basics - Intro to Joinery",
    students: 0,
    status: "Active",
    modules: [
      { type: "lesson", title: "Basic Joinery", link: "" },
      { type: "quiz", title: "Joinery Quiz", link: "woodworking" }, 
      { type: "pdf", title: "Joinery Handbook", link: "" }
    ]
  }
];

function renderCourses(courses) {
  coursesTbody.innerHTML = "";
  courses.forEach(course => {
    const tr = document.createElement("tr");
    tr.tabIndex = 0;

    tr.innerHTML = `
      <td><strong>${course.name}</strong></td>
      <td>${course.students}</td>
      <td>${course.modules ? course.modules.length : 0}</td>
      <td>${course.status}</td>
    `;

    const detailsTr = document.createElement("tr");
    detailsTr.innerHTML = `
      <td colspan="5">
        <div class="course-details" style="margin-top:10px;">
          <table class="inner-table" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Type</th>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Title</th>
                <th style="border-bottom:1px solid #ccc; text-align:left;">Link</th>
              </tr>
            </thead>
            <tbody class="modules-tbody"></tbody>
          </table>
        </div>
      </td>
    `;

    coursesTbody.appendChild(tr);
    coursesTbody.appendChild(detailsTr);
    renderModules(course, detailsTr.querySelector(".modules-tbody"));
  });
}

function renderModules(course, tbody) {
  tbody.innerHTML = "";
  if (!course.modules) return;

  course.modules.forEach((mod) => {
    const tr = document.createElement("tr");

if (mod.type === "quiz" && mod.link) {
  const tdType = document.createElement("td");
  tdType.textContent = mod.type;

  const tdTitle = document.createElement("td");
  tdTitle.textContent = mod.title;

  const tdButton = document.createElement("td");
  const button = document.createElement("button");
  button.textContent = "Open";
  button.addEventListener("click", () => viewQuiz(mod.link));

  tdButton.appendChild(button);

  tr.appendChild(tdType);
  tr.appendChild(tdTitle);
  tr.appendChild(tdButton);
}
 else {
      tr.innerHTML = `
        <td>${mod.type}</td>
        <td>${mod.title}</td>
        <td>${mod.link ? `<a href="${mod.link}" target="_blank">Open</a>` : "-"}</td>
      `;
    }

    tbody.appendChild(tr);
  });
}

import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      renderCourses(fixedCourses);

      // ✅ Fetch teacher username safely
      try {
        const ref = doc(db, "users", user.uid);
        const snapshot = await getDoc(ref);

        const teacherNameElem = document.getElementById("teacherName");
        if (teacherNameElem) {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
            teacherNameElem.textContent = fullName || user.email;
          } else {
            teacherNameElem.textContent = user.email;
          }
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        const teacherNameElem = document.getElementById("teacherName");
        if (teacherNameElem) teacherNameElem.textContent = user.email;
      }

    } else {
      window.location.href = "account.html";
    }
  });
});


document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
});

async function viewQuiz(quizId) {
  const response = await fetch(`../Quizzes/${quizId}.json`);
  const quiz = await response.json();

  let html = `<h1>${quiz.title}</h1><ol>`;

  quiz.questions.forEach((q, index) => {
    html += `
      <li>
        <p>${q.q}</p>
        <form>
          ${q.options.map(option => `
            <label style="display:block; margin: 4px 0;">
              <input type="radio" name="q${index}" value="${option}" disabled ${option === q.answer ? 'checked' : ''}>
              ${option}
            </label>
          `).join("")}
        </form>
      </li>
    `;
  });

  html += `</ol>`;

  const newTab = window.open("", "_blank");
  newTab.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${quiz.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f9f9f9;
          }
          h1 {
            color: #333;
          }
          li {
            margin-bottom: 20px;
          }
          input[disabled] {
            cursor: default;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);
  newTab.document.close();
}

