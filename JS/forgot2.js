function resetPassword() {
  const email = document.getElementById('email').value;
  if (!email) {
    alert("Please enter your email.");
    return;
  }
  alert("Password reset link sent to " + email);
  window.location.href = "login.html";
}
