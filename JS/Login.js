'use strict';/** * Validates email format using regex * @param {string} email - The email to validate * @returns {boolean} - True if email is valid, false otherwise */function validateEmail(email) {    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    return emailRegex.test(String(email).toLowerCase());}/** * Shows a message to the user * @param {string} message - The message to display * @param {string} type - The type of message ('error' or 'success') */function showMessage(message, type = 'error') {    // Remove existing message    const existingMessage = document.querySelector('.message');    if (existingMessage) {        existingMessage.remove();    }    // Create new message element    const messageDiv = document.createElement('div');    messageDiv.className = `message ${type}`;    messageDiv.textContent = message;    // Insert message before the first button    const loginBox = document.querySelector('.login-box');    const firstButton = loginBox.querySelector('button');    loginBox.insertBefore(messageDiv, firstButton);    // Auto-remove message after 5 seconds    setTimeout(() => {        if (messageDiv.parentNode) {            messageDiv.remove();        }    }, 5000);}/** * Sets loading state for buttons * @param {boolean} loading - Whether to show loading state */function setLoadingState(loading) {    const buttons = document.querySelectorAll('button');    const inputs = document.querySelectorAll('input, select');        buttons.forEach(button => {        button.disabled = loading;        if (loading) {            button.classList.add('loading');        } else {            button.classList.remove('loading');        }    });        inputs.forEach(input => {        input.disabled = loading;    });}/** * Handles the login process */async function login() {    const email = document.getElementById('email').value.trim();    const password = document.getElementById('password').value;    const role = document.getElementById('role').value;    // Clear previous messages    const existingMessage = document.querySelector('.message');    if (existingMessage) {        existingMessage.remove();    }    // Validate inputs    if (!email) {        showMessage("Please enter an email address.");        document.getElementById('email').focus();        return;    }    if (!validateEmail(email)) {        showMessage("Please enter a valid email address.");        document.getElementById('email').focus();        return;    }    if (!password) {        showMessage("Please enter your password.");        document.getElementById('password').focus();        return;    }    if (password.length < 6) {        showMessage("Password must be at least 6 characters long.");        document.getElementById('password').focus();        return;    }    // Set loading state    setLoadingState(true);    try {        // Simulate API call        await new Promise(resolve => setTimeout(resolve, 1500));        // Here you would typically make an API call to authenticate        console.log('Login attempt:', { email, role });        // Simulate login logic        const isValidCredentials = await validateCredentials(email, password, role);        if (isValidCredentials) {            showMessage("Login successful! Redirecting...", "success");                        // Store user info in sessionStorage            sessionStorage.setItem('userEmail', email);            sessionStorage.setItem('userRole', role);                        // Redirect based on role            setTimeout(() => {                if (role === 'teacher') {                    window.location.href = "teacher-dashboard.html";                } else {                    window.location.href = "student-dashboard.html";                }            }, 1500);        } else {            showMessage("Invalid email or password. Please try again.");        }    } catch (error) {        console.error('Login error:', error);        showMessage("An error occurred while logging in. Please try again.");    } finally {        setLoadingState(false);    }}/** * Simulates credential validation * @param {string} email - User email * @param {string} password - User password * @param {string} role - User role * @returns {Promise<boolean>} - Whether credentials are valid */async function validateCredentials(email, password, role) {    // This is a simulation - in a real app, this would be an API call    const validCredentials = [        { email: 'student@saw.edu', password: 'student123', role: 'student' },        { email: 'teacher@saw.edu', password: 'teacher123', role: 'teacher' },        { email: 'admin@saw.edu', password: 'admin123', role: 'teacher' }    ];    return validCredentials.some(cred =>         cred.email === email &&         cred.password === password &&         cred.role === role    );}/** * Toggles password visibility */function togglePassword() {    const passwordField = document.getElementById('password');    const toggleButton = document.querySelector('.toggle-password');        if (passwordField.type === "password") {        passwordField.type = "text";        toggleButton.textContent = "🙈";    } else {        passwordField.type = "password";        toggleButton.textContent = "👁";    }}/** * Redirects to signup page */function redirectToSignup() {    window.location.href = "Account.html";}/** * Initialize event listeners when the DOM is loaded */document.addEventListener('DOMContentLoaded', function() {    // Add enter key support for form submission    const inputs = document.querySelectorAll('input');    inputs.forEach(input => {        input.addEventListener('keypress', function(event) {            if (event.key === 'Enter') {                login();            }        });    });    // Add real-time validation feedback    document.getElementById('email').addEventListener('blur', function() {        const email = this.value.trim();        if (email && !validateEmail(email)) {            this.style.borderColor = '#e74c3c';        } else {            this.style.borderColor = '#b68d5e';        }    });    // Focus on email field when page loads    document.getElementById('email').focus();});/** * Logout function (for use in other pages) */function logout() {    sessionStorage.clear();    localStorage.clear();    window.location.href = "index.html";}'use strict';

/**
 * Validates email format using regex
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
}

/**
 * Shows a message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('error' or 'success')
 */
function showMessage(message, type = 'error') {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert message before the first button
    const loginBox = document.querySelector('.login-box');
    const firstButton = loginBox.querySelector('button');
    loginBox.insertBefore(messageDiv, firstButton);

    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

/**
 * Sets loading state for buttons
 * @param {boolean} loading - Whether to show loading state
 */
function setLoadingState(loading) {
    const buttons = document.querySelectorAll('button');
    const inputs = document.querySelectorAll('input, select');
    
    buttons.forEach(button => {
        button.disabled = loading;
        if (loading) {
            button.classList.add('loading');
        } else {
            button.classList.remove('loading');
        }
    });
    
    inputs.forEach(input => {
        input.disabled = loading;
    });
}

/**
 * Handles the login process
 */
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Clear previous messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Validate inputs
    if (!email) {
        showMessage("Please enter an email address.");
        document.getElementById('email').focus();
        return;
    }

    if (!validateEmail(email)) {
        showMessage("Please enter a valid email address.");
        document.getElementById('email').focus();
        return;
    }

    if (!password) {
        showMessage("Please enter your password.");
        document.getElementById('password').focus();
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.");
        document.getElementById('password').focus();
        return;
    }

    // Set loading state
    setLoadingState(true);

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Here you would typically make an API call to authenticate
        console.log('Login attempt:', { email, role });

        // Simulate login logic
        const isValidCredentials = await validateCredentials(email, password, role);

        if (isValidCredentials) {
            showMessage("Login successful! Redirecting...", "success");
            
            // Store user info in sessionStorage
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userRole', role);
            
            // Redirect based on role
            setTimeout(() => {
                if (role === 'teacher') {
                    window.location.href = "teacher-dashboard.html";
                } else {
                    window.location.href = "student-dashboard.html";
                }
            }, 1500);
        } else {
            showMessage("Invalid email or password. Please try again.");
        }

    } catch (error) {
        console.error('Login error:', error);
        showMessage("An error occurred while logging in. Please try again.");
    } finally {
        setLoadingState(false);
    }
}

/**
 * Simulates credential validation
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role
 * @returns {Promise<boolean>} - Whether credentials are valid
 */
async function validateCredentials(email, password, role) {
    // This is a simulation - in a real app, this would be an API call
    const validCredentials = [
        { email: 'student@saw.edu', password: 'student123', role: 'student' },
        { email: 'teacher@saw.edu', password: 'teacher123', role: 'teacher' },
        { email: 'admin@saw.edu', password: 'admin123', role: 'teacher' }
    ];

    return validCredentials.some(cred => 
        cred.email === email && 
        cred.password === password && 
        cred.role === role
    );
}

/**
 * Toggles password visibility
 */
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleButton.textContent = "🙈";
    } else {
        passwordField.type = "password";
        toggleButton.textContent = "👁";
    }
}

/**
 * Redirects to signup page
 */
function redirectToSignup() {
    window.location.href = "Account.html";
}

/**
 * Initialize event listeners when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add enter key support for form submission
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                login();
            }
        });
    });

    // Add real-time validation feedback
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#b68d5e';
        }
    });

    // Focus on email field when page loads
    document.getElementById('email').focus();
});

/**
 * Logout function (for use in other pages)
 */
function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
}}
