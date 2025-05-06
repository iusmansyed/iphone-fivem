document.addEventListener('DOMContentLoaded', function() {
    const tiktokLoginForm = document.getElementById('tiktok-login-form');
    const tiktokSignupForm = document.getElementById('tiktok-signup-form');
    const tiktokFormTitle = document.getElementById('tiktok-form-title');
    const tiktokGoToSignup = document.getElementById('tiktok-go-to-signup');
    const tiktokGoToLogin = document.getElementById('tiktok-go-to-login');
    
    const tiktokLoginBtn = document.getElementById('tiktok-login-btn');
    const tiktokSignupBtn = document.getElementById('tiktok-signup-btn');
    
    const tiktokLoginEmail = document.getElementById('tiktok-login-email');
    const tiktokLoginPassword = document.getElementById('tiktok-login-password');
    
    const tiktokSignupUsername = document.getElementById('tiktok-signup-username');
    const tiktokSignupEmail = document.getElementById('tiktok-signup-email');
    const tiktokSignupPassword = document.getElementById('tiktok-signup-password');
    const tiktokSignupBirthday = document.getElementById('tiktok-signup-birthday');
    
    // Initially show login form
    tiktokSignupForm.classList.add('tiktok-active-form');
    
    // Switch to signup form
    tiktokGoToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        tiktokLoginForm.classList.remove('tiktok-active-form');
        tiktokSignupForm.classList.add('tiktok-active-form');
        tiktokFormTitle.textContent = 'Sign up for TikTok';
    });
    
    // Switch to login form
    tiktokGoToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        tiktokSignupForm.classList.remove('tiktok-active-form');
        tiktokLoginForm.classList.add('tiktok-active-form');
        tiktokFormTitle.textContent = 'Log in to TikTok';
    });
    
    // Back button functionality
  
    
    // Login form validation
    function validateLoginForm() {
        const isEmailValid = tiktokLoginEmail.value.trim() !== '';
        const isPasswordValid = tiktokLoginPassword.value.trim() !== '';
        
        tiktokLoginBtn.disabled = !(isEmailValid && isPasswordValid);
    }
    
    tiktokLoginEmail.addEventListener('input', validateLoginForm);
    tiktokLoginPassword.addEventListener('input', validateLoginForm);
    
    // Signup form validation
    function validateSignupForm() {
        const isUsernameValid = tiktokSignupUsername.value.trim() !== '';
        const isEmailValid = tiktokSignupEmail.value.trim() !== '' && tiktokSignupEmail.value.includes('@');
        const isPasswordValid = tiktokSignupPassword.value.trim().length >= 6;
        const isBirthdayValid = tiktokSignupBirthday.value !== '';
        
        tiktokSignupBtn.disabled = !(isUsernameValid && isEmailValid && isPasswordValid && isBirthdayValid);
    }
    
    tiktokSignupUsername.addEventListener('input', validateSignupForm);
    tiktokSignupEmail.addEventListener('input', validateSignupForm);
    tiktokSignupPassword.addEventListener('input', validateSignupForm);
    tiktokSignupBirthday.addEventListener('input', validateSignupForm);
    
    // Form submissions
    tiktokLoginBtn.addEventListener('click', function() {
        alert('Login functionality would be implemented here');
        // Here you would typically send the data to a server
    });
    
    tiktokSignupBtn.addEventListener('click', function() {
        alert('Signup functionality would be implemented here');
        // Here you would typically send the data to a server
    });
});