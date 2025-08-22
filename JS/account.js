'use strict';

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
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} - Object containing isValid boolean and message string
 */
function validatePassword(password) {
    if (password.length < 8) {
        return {
            isValid: false,
            message: "Password must be at least 8 characters long."
        };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        return {
            isValid: false,
            message: "Password must contain at least one lowercase letter."
        };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        return {
            isValid: false,
            message: "Password must contain at least one uppercase letter."
        };
    }
    
    if (!/(?=.*\d)/.test(password)) {
        return {
            isValid: false,
            message: "Password must contain at least one number."
        };
    }
    
    return {
        isValid: true,
        message: "Password is valid."
    };
}

/**
 * Handles the signup process with validation
 */
function signup() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const retypePassword = document.getElementById('retype').value;
    const role = document.getElementById('role').value;

    // Validate email
    if (!email) {
        alert("Please enter an email address.");
        document.getElementById('email').focus();
        return;
    }

    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        document.getElementById('email').focus();
        return;
    }

    // Validate password
    if (!password) {
        alert("Please enter a password.");
        document.getElementById('password').focus();
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        alert(passwordValidation.message);
        document.getElementById('password').focus();
        return;
    }

    // Validate password match
    if (!retypePassword) {
        alert("Please retype your password.");
        document.getElementById('retype').focus();
        return;
    }

    if (password !== retypePassword) {
        alert("Passwords do not match! Please try again.");
        document.getElementById('retype').focus();
        return;
    }

    // Simulate account creation
    try {
        // Here you would typically make an API call to create the account
        console.log('Creating account for:', { email, role });
        
        alert(`Account created successfully! Welcome to S.A.W as a ${role}.`);
        
        // Clear form
        clearForm();
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        alert("An error occurred while creating your account. Please try again.");
    }
}

/**
 * Toggles password visibility for a specific field
 * @param {string} fieldId - The ID of the password field
 */
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggleButton = field.nextElementSibling;
    
    if (field.type === "password") {
        field.type = "text";
        toggleButton.textContent = "Hide Password";
    } else {
        field.type = "password";
        toggleButton.textContent = "Show Password";
    }
}

/**
 * Clears all form fields
 */
function clearForm() {
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('retype').value = '';
    document.getElementById('role').value = 'student';
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
                signup();
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
    
    document.getElementById('password').addEventListener('input', function() {
        const password = this.value;
        const validation = validatePassword(password);
        if (password && !validation.isValid) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#b68d5e';
        }
    });
    
    document.getElementById('retype').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const retype = this.value;
        if (retype && password !== retype) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#b68d5e';
        }
    });
});