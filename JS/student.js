// Logout Button
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.clear();
    window.location.href = "index.html";
  }
});

// Sidebar Toggle & Submit
document.addEventListener("DOMContentLoaded", () => {
  const btnCourses = document.getElementById("btn-courses");
  const btnAnnouncements = document.getElementById("btn-announcements");

  const sectionCourses = document.getElementById("section-courses");
  const sectionAnnouncements = document.getElementById("section-announcements");

  

  function setActive(activeBtn, activeSection) {
    [btnCourses, btnAnnouncements].forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");

    sectionCourses.hidden = activeSection !== sectionCourses;
    sectionAnnouncements.hidden = activeSection !== sectionAnnouncements;
  }

  btnCourses.addEventListener("click", () => setActive(btnCourses, sectionCourses));
  btnAnnouncements.addEventListener("click", () => setActive(btnAnnouncements, sectionAnnouncements));

  // Submit Question
  const submitBtn = document.querySelector(".submit-btn");
  const questionInput = document.getElementById("studentQuestion");
  const questionList = document.getElementById("studentQuestionsList");
  const instructorFeedback = document.getElementById("instructorFeedback");

  submitBtn.addEventListener("click", () => {
    const question = questionInput.value.trim();
    if (!question) {
      alert("Please type your question first.");
      return;
    }

    questionList.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
    questionInput.value = "";

    setTimeout(() => {
      instructorFeedback.innerHTML += `<p><strong>Teacher:</strong> I will check your question and get back to you.</p>`;
    }, 1500);
  });
});
