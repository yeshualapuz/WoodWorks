function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // Redirect based on role
  if (role === 'student') {
    window.location.href = 'students .html';
  } else {
    window.location.href = 'trial.html';
  }
}

function signup() {
  window.location.href = 'Account.html';
}

// Toggle show/hide password
function togglePassword() {
  const passwordField = document.getElementById('password');
  if (passwordField.type === "password") {
    passwordField.type = "text";
  } else {
    passwordField.type = "password";
  }
}
