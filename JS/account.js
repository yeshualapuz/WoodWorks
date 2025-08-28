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
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const retypePassword = document.getElementById('retype').value;
    const role = document.getElementById('role').value;

    // Validate
    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        alert(passwordValidation.message);
        return;
    }
    if (password !== retypePassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        // Create Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save Firestore profile
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: role,
            createdAt: new Date()
        });

        alert("Account created successfully as " + role);
        window.location.href = "index.html";
    } catch (error) {
        alert("Signup failed: " + error.message);
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
