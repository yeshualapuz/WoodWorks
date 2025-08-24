// Log Out Functionality
document.getElementById("logoutBtn").addEventListener("click", function(){
  alert("Logging out...");
  window.location.href = "index.html";
});

// Upload functionality
document.getElementById("uploadBtn").addEventListener("click", function(){
  const fileInput = document.getElementById("uploadFile");
  if(fileInput.files.length > 0){
    alert("Uploaded: " + fileInput.files[0].name);
  } else {
    alert("Please select a file to upload.");
  }
});

// Create Quiz functionality
document.getElementById("createQuizBtn").addEventListener("click", function(){
  const quizTitle = prompt("Enter Quiz Title:");
  if(quizTitle){
    alert("Quiz created: " + quizTitle);
  }
});

// Post Announcement functionality
document.getElementById("postAnnouncementBtn").addEventListener("click", function(){
  const announcement = prompt("Enter your announcement:");
  if(announcement){
    const list = document.getElementById("announcementList");
    const item = document.createElement("div");
    item.classList.add("announcement-item");
    item.textContent = announcement;
    list.appendChild(item);
  }
});
