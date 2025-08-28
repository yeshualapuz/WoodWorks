'use strict';

// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

//Validates email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
}

//Handles login with Firebase
function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    if (!password) {
        alert("Please enter your password.");
        return;
    }

    // Firebase login
    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log("Logged in:", user.email);

            // 🔎 Get role from Firestore
            const ref = doc(db, "users", user.uid);
            const snapshot = await getDoc(ref);

            if (snapshot.exists()) {
                const role = snapshot.data().role;

                alert(`Login successful! Welcome ${role}.`);

                sessionStorage.setItem("userEmail", email);
                sessionStorage.setItem("userRole", role);

                // Redirect based on real role from Firestore
                if (role === "teacher") {
                    window.location.href = "teacher.html";
                } else {
                    window.location.href = "students.html";
                }
            } else {
                alert("Error: No profile found for this account.");
            }
        })
        .catch(error => {
            console.error("Login error:", error.message);
            alert(`Error: ${error.message}`);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('submit');

    if (loginBtn) {
        loginBtn.addEventListener("click", function(event) {
            event.preventDefault();
            login();
        });
    }

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                login();
            }
        });
    });

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            this.style.borderColor = (email && !validateEmail(email)) ? '#e74c3c' : '#b68d5e';
        });

        emailInput.focus();
    }

    // Password toggle listeners
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => togglePassword(toggle.dataset.field));
    });
});
