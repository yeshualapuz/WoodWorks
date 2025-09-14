'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAubnoJNXMp0eJ9A2bQM1FaOfMlk6X0Les",
    authDomain: "woodworks-dc7b3.firebaseapp.com",
    projectId: "woodworks-dc7b3",
    storageBucket: "woodworks-dc7b3.firebasestorage.app",
    messagingSenderId: "355879129478",
    appId: "1:355879129478:web:35abd92fa5ebb5c60d1c07"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Email validator
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
}

// Password validator
function validatePassword(password) {
    if (password.length < 8) return { isValid: false, message: "Password must be at least 8 characters long." };
    if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: "Password must contain at least one lowercase letter." };
    if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: "Password must contain at least one uppercase letter." };
    if (!/(?=.*\d)/.test(password)) return { isValid: false, message: "Password must contain at least one number." };
    return { isValid: true, message: "Password is valid." };
}

// Signup handler
async function signup() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const retypePassword = document.getElementById('retype').value;
    const role = document.getElementById('role').value;


    if (!firstName || !lastName) {
        showAlert("Please enter both first name and last name.");
        return;
    }    

    // Validate
    if (!validateEmail(email)) {
        showAlert("Please enter a valid email address.");
        return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showAlert(passwordValidation.message);
        return;
    }
    if (password !== retypePassword) {
        showAlert("Passwords do not match.");
        return;
    }

    try {
        // Create Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save Firestore profile
        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: user.email,
            role: role,
            createdAt: new Date()
        });

        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem("role", role);

        showAlert("Account created successfully as " + role || lastName, () => {
             window.location.href = "index.html";                      
        });
        
    } catch (error) {
        showAlert("Signup failed: " + error.message);
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submit = document.getElementById('submit');
    if (submit) {
        submit.addEventListener("click", function (event) {
            event.preventDefault();
            signup();
        });
    }
});


function showAlert(message, callback = null) {
  document.getElementById("alertMessage").textContent = message;
  document.getElementById("customAlert").style.display = "flex";

  const okBtn = document.getElementById("alertOk");
  const newOkBtn = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOkBtn, okBtn);

  newOkBtn.addEventListener("click", () => {
    closeAlert();
    if (callback) callback(); 
  });

  document.getElementById("alertClose").addEventListener("click", closeAlert);
}

function closeAlert() {
  document.getElementById("customAlert").style.display = "none";
}

