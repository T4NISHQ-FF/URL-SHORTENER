// Initialize the application
class URLShortener {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify({}));
        }
        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({
                supportEmail: 'support@shorturl.pro',
                telegram: '@shorturl_support',
                adNetworks: {}
            }));
        }
    }

    checkAuthStatus() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && window.location.pathname.includes('dashboard')) {
            this.redirectToDashboard();
        }
    }

    // Authentication functions
    async register() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (!this.validateRegistration(username, email, password, confirmPassword)) {
            return;
        }

        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users[email]) {
            this.showNotification('Email already registered!', 'error');
            return;
        }

        // Simulate email verification
        if (!await this.sendVerificationEmail(email)) {
            this.showNotification('Failed to send verification email', 'error');
            return;
        }

        users[email] = {
            username: username,
            password: this.hashPassword(password),
            email: email,
            verified: false,
            earnings: 0,
            urls: {},
            createdAt: new Date().toISOString(),
            isAdmin: email === 'admin@shorturl.pro'
        };

        localStorage.setItem('users', JSON.stringify(users));
        this.showNotification('Registration successful! Please check your email for verification.');
        this.closeAuthModal();
    }

    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('users'));
        const user = users[email];

        if (!user || user.password !== this.hashPassword(password)) {
            this.showNotification('Invalid email or password', 'error');
            return;
        }

        if (!user.verified) {
            this.showNotification('Please verify your email first', 'error');
            return;
        }

        localStorage.setItem('currentUser', email);
        this.redirectToDashboard();
    }

    async forgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();
        const users = JSON.parse(localStorage.getItem('users'));
        
        if (!users[email]) {
            this.showNotification('Email not found', 'error');
            return;
        }

        // Simulate password reset email
        this.showNotification('Password reset link sent to your email');
        this.closeAuthModal();
    }

    // Utility functions
    validateRegistration(username, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return false;
        }
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return false;
        }
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email', 'error');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo (use proper encryption in production)
        return btoa(password);
    }

    async sendVerificationEmail(email) {
        // Simulate email sending
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Modal management
function showAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    modal.style.display = 'block';
    switchAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tabName) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected form
    document.getElementById(tabName + 'Form').classList.add('active');
    
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Global functions
function login() {
    new URLShortener().login();
}

function register() {
    new URLShortener().register();
}

function forgotPassword() {
    new URLShortener().forgotPassword();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new URLShortener();
});
