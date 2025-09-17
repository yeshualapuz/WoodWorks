import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, getFirestore, doc, getDoc, setDoc, deleteDoc, query, orderBy, limit, startAfter } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

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

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      renderLatestAnnouncement();
      loadAndSortStudents();
      loadSubmissions();

      function capitalize(str) {
        return str && str.length > 0
          ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
          : "";
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snapshot = await getDoc(ref);

        const teacherNameElem = document.getElementById("teacherName");
        if (teacherNameElem) {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const firstName = capitalize(data.firstName);
            const lastName = capitalize(data.lastName);
            const fullName = [firstName, lastName].filter(Boolean).join(" ");
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

const announcementForm = document.getElementById("announcement-form");
const announcementText = document.getElementById("announcement-text");
const announcementMessages = document.getElementById("announcement-messages");

announcementForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const note = announcementText.value.trim();
  if (!note) {
    announcementMessages.textContent = "Please write an announcement before posting.";
    announcementMessages.style.color = "red";
    return;
  }

  try {
    const user = auth.currentUser;
    let teacherName = user?.email || "Unknown Teacher";

    const ref = doc(db, "users", user.uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      const data = snapshot.data();
      teacherName = [data.firstName, data.lastName].filter(Boolean).join(" ") || teacherName;
    }

    const announcementRef = doc(db, "announcements", "latest");
    await setDoc(announcementRef, {
      teacherId: user.uid,
      teacherName,
      date: new Date().toISOString().split("T")[0],
      note
    });

    announcementMessages.textContent = "Announcement posted successfully!";
    announcementMessages.style.color = "green";
    announcementText.value = "";
    renderLatestAnnouncement();

  } catch (err) {
    console.error("Error posting announcement:", err);
    announcementMessages.textContent = "Failed to post announcement. Please try again.";
    announcementMessages.style.color = "red";
  }
});

async function renderLatestAnnouncement() {
  const block = document.getElementById("latest-announcement-block");
  const nameElem = document.getElementById("latest-teacher-name");
  const dateElem = document.getElementById("latest-announcement-date");
  const noteElem = document.getElementById("latest-announcement-note");
  const deleteBtn = document.getElementById("delete-announcement");

  try {
    const ref = doc(db, "announcements", "latest");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      nameElem.textContent = data.teacherName || "";
      dateElem.textContent = data.date || "";
      noteElem.textContent = data.note || "";

      block.style.display = "block";
      if (auth.currentUser && auth.currentUser.uid === data.teacherId) {
        deleteBtn.style.display = "inline-block";
      } else {
        deleteBtn.style.display = "none";
      }
    } else {
      block.style.display = "none";
    }
  } catch (err) {
    console.error("Error fetching announcement:", err);
    block.style.display = "none";
  }
}

const deleteBtn = document.getElementById("delete-announcement");

deleteBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete this announcement?")) return;

  try {
    const announcementRef = doc(db, "announcements", "latest");
    await deleteDoc(announcementRef);

    document.getElementById("latest-teacher-name").textContent = "";
    document.getElementById("latest-announcement-date").textContent = "";
    document.getElementById("latest-announcement-note").textContent = "No announcement yet...";

    alert("Announcement deleted.");
  } catch (err) {
    console.error("Error deleting announcement:", err);
    alert("Failed to delete announcement.");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
});

const TOTAL_LESSONS = 10;
const TOTAL_QUIZZES = 10;
const PAGE_SIZE = 10;

let students = [];
let currentPage = 0;

async function loadAndSortStudents() {
  students = [];
  const querySnapshot = await getDocs(collection(db, "users"));

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    if (!data || data.role !== "student") continue;

    const first = data.firstName
      ? data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase()
      : "";
    const last = data.lastName
      ? data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()
      : "";
    const fullName = (first + " " + last).trim() || data.email || docSnap.id;

    const lessonsSnap = await getDocs(collection(db, `users/${docSnap.id}/lessons`));
    const lessonsOpened = lessonsSnap.docs.filter(d => d.data().opened).length;
    const lessonPercent = TOTAL_LESSONS > 0 ? Math.round((lessonsOpened / TOTAL_LESSONS) * 100) : 0;

    const quizzesSnap = await getDocs(collection(db, `users/${docSnap.id}/quizzes`));
    const quizzesTaken = quizzesSnap.docs.filter(d => d.data().score !== undefined).length;
    const quizPercent = TOTAL_QUIZZES > 0 ? Math.round((quizzesTaken / TOTAL_QUIZZES) * 100) : 0;

    const overallProgress = Math.round((lessonPercent + quizPercent) / 2);

    students.push({ fullName, overallProgress });
  }

  students.sort((a, b) => a.fullName.localeCompare(b.fullName));
  currentPage = 0;
  renderCurrentPage();
}

function renderCurrentPage() {
  const tbody = document.getElementById("students-tbody");
  tbody.innerHTML = "";

  const start = currentPage * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageStudents = students.slice(start, end);

  for (const student of pageStudents) {
    let barColor = "#4caf50";
    if (student.overallProgress < 40) barColor = "#f44336";
    else if (student.overallProgress < 70) barColor = "#ff9800";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.fullName}</td>
      <td style="display: flex; align-items: center; gap: 8px;">
        <div style="flex: 1; background: #eee; border-radius: 4px; overflow: hidden; height: 16px;">
          <div style="width: ${student.overallProgress}%; background: ${barColor}; height: 100%;"></div>
        </div>
        <span style="white-space: nowrap;">${student.overallProgress}%</span>
      </td>
    `;
    tbody.appendChild(tr);
  }

  updatePaginationButtons();
}

function updatePaginationButtons() {
  document.getElementById("prevPageBtn").disabled = currentPage === 0;
  document.getElementById("nextPageBtn").disabled = (currentPage + 1) * PAGE_SIZE >= students.length;
}

document.getElementById("nextPageBtn").addEventListener("click", () => {
  if ((currentPage + 1) * PAGE_SIZE < students.length) {
    currentPage++;
    renderCurrentPage();
  }
});

document.getElementById("prevPageBtn").addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    renderCurrentPage();
  }
});

loadAndSortStudents();

let submissionPage = 1;
const submissionsPerPage = 10;
let allSubmissions = [];

async function loadSubmissions(page = 1) {
  const tbody = document.getElementById("submissions-tbody");
  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const submissions = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (!userData || userData.role !== "student") continue;

      const userId = userDoc.id;
      const first = userData.firstName ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase() : "";
      const last = userData.lastName ? userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1).toLowerCase() : "";
      const fullName = `${first} ${last}`.trim() || userData.email || userId;

      const quizzesSnap = await getDocs(collection(db, `users/${userId}/quizzes`));
      for (const quizDoc of quizzesSnap.docs) {
        const quizData = quizDoc.data();
        const quizName = quizData.title || quizDoc.id;
        const score = quizData.score;

        const timestamp = quizData.timestamp?.toDate?.();
        const submittedDate = timestamp
          ? timestamp.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          : "N/A";

        const status = score !== undefined ? "Completed" : "Incomplete";

        submissions.push({
          fullName,
          quizName,
          submittedDate,
          status
        });
      }
    }

    if (submissions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No submissions found.</td></tr>`;
      return;
    }

    submissions.sort((a, b) => a.fullName.localeCompare(b.fullName));

    allSubmissions = submissions; 
    submissionPage = page;

    renderSubmissionsPage(submissionPage);

  } catch (err) {
    console.error("Error loading submissions:", err);
    tbody.innerHTML = `<tr><td colspan="4">Error loading submissions.</td></tr>`;
  }
}

function renderSubmissionsPage(page) {
  const tbody = document.getElementById("submissions-tbody");
  tbody.innerHTML = "";

  const startIndex = (page - 1) * submissionsPerPage;
  const endIndex = Math.min(startIndex + submissionsPerPage, allSubmissions.length);

  for (let i = startIndex; i < endIndex; i++) {
    const sub = allSubmissions[i];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${sub.fullName}</td>
      <td>${sub.quizName}</td>
      <td>${sub.submittedDate}</td>
      <td>${sub.status}</td>
    `;
    tbody.appendChild(tr);
  }

  renderPaginationControls();
}

function renderPaginationControls() {
  let pagination = document.getElementById("pagination-controls");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination-controls";
    pagination.style.marginTop = "10px";
    document.getElementById("section-submissions").appendChild(pagination);
  }

  pagination.innerHTML = "";

  const totalPages = Math.ceil(allSubmissions.length / submissionsPerPage);

  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = submissionPage === 1;
  prevBtn.addEventListener("click", () => {
    if (submissionPage > 1) {
      submissionPage--;
      renderSubmissionsPage(submissionPage);
    }
  });
  pagination.appendChild(prevBtn);

  for (let p = 1; p <= totalPages; p++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = p;
    pageBtn.disabled = p === submissionPage;
    pageBtn.style.margin = "0 3px";
    pageBtn.addEventListener("click", () => {
      submissionPage = p;
      renderSubmissionsPage(submissionPage);
    });
    pagination.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = submissionPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (submissionPage < totalPages) {
      submissionPage++;
      renderSubmissionsPage(submissionPage);
    }
  });
  pagination.appendChild(nextBtn);
}
