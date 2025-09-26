// Generate referral link from phone using a secret key (JS port of your Python)
const secretKey = 'NEA_Salmon_Project';

// Scroll to contact section
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // If contact section doesn't exist, scroll to referral form section
        const referralSection = document.getElementById('referral-form');
        if (referralSection) {
            referralSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function encodePhone(phone) {
    const cleanPhone = String(phone || '').replace(/\D+/g, '');
    let mixed = '';
    for (let i = 0; i < cleanPhone.length; i++) {
        const digit = parseInt(cleanPhone[i], 10);
        if (Number.isNaN(digit)) continue;
        const keyChar = secretKey.charCodeAt(i % secretKey.length);
        mixed += String((digit + keyChar) % 10);
    }
    // Base64 url-safe without padding
    const b64 = btoa(mixed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `https://merchant.salmon.ph/ref/${b64}`;
}

function getReferralLink() {
    const phoneInput = document.getElementById('phoneNumber') || document.getElementById('loginPhone');
    const phone = phoneInput ? phoneInput.value : '';
    if (phone && /\d/.test(phone)) {
        return encodePhone(phone);
    }
    // Fallback if phone not provided
    return 'https://salmon.ph/join?ref=SHOP2024-ABC';
}

// Copy referral link function
function copyReferralLink() {
    const referralLink = getReferralLink();
    
    // Try to use the Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(referralLink).then(() => {
            showNotification('Referral link copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(referralLink);
        });
    } else {
        fallbackCopyToClipboard(referralLink);
    }
}

// Fallback copy function for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Referral link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy link. Please copy manually: ' + text, 'error');
    }
    
    document.body.removeChild(textArea);
}

// Modal functions
function openLoginModal() {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('loginModal');
    
    if (overlay && modal) {
        overlay.classList.add('active');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeAllModals() {
    const overlay = document.getElementById('modalOverlay');
    const modals = document.querySelectorAll('.modal');
    
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Hide all modals
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

function switchToRegister() {
    window.location.href = 'https://salmon.ph/merchants';
}

// Handle login
function handleLogin() {
    const phoneNumber = document.getElementById('loginPhone')?.value;
    
    if (!phoneNumber) {
        showNotification('Please enter your phone number', 'error');
        return;
    }
    
    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    showNotification('Checking phone number...', 'info');
    
    // Check if phone number exists in the system
    checkPhoneNumberExists(phoneNumber)
        .then(exists => {
            if (exists) {
                showNotification('Sending email to your referral...', 'info');
                setTimeout(() => {
                    sendReferral();
                    showSuccessState();
                }, 1500);
            } else {
                showNotification('This phone number is not registered. Please sign up first.', 'error');
            }
        })
        .catch(error => {
            console.error('Error checking phone number:', error);
            showNotification('Error checking phone number. Please try again.', 'error');
        });
}

// Check if phone number exists (mock function)
function checkPhoneNumberExists(phoneNumber) {
    return new Promise((resolve) => {
        // Mock phone numbers that exist in the system
        const existingNumbers = [
            '+1234567890',
            '+1987654321',
            '+447123456789',
            '+49123456789',
            '+79162775067'
        ].map(num => num.replace(/\D/g, ''));
        
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const exists = existingNumbers.includes(cleanPhone);
        
        // Simulate API delay
        setTimeout(() => resolve(exists), 1000);
    });
}

// Show success state for login
function showSuccessState() {
    const loginForm = document.querySelector('.login-card');
    const successState = document.getElementById('successState');
    const phoneInput = document.getElementById('loginPhone');
    const successPhone = document.getElementById('successPhone');
    
    if (loginForm && successState && phoneInput && successPhone) {
        successPhone.value = phoneInput.value;
        loginForm.style.display = 'none';
        successState.style.display = 'block';
    }
}

// Send referral email
function sendReferral() {
    const businessName = document.getElementById('businessName')?.value || '-';
    const email = document.getElementById('email')?.value || '-';
    const phone = document.getElementById('phoneNumber')?.value || document.getElementById('loginPhone')?.value || '-';
    const linkTextEl = document.querySelector('.referral-link-text')?.textContent || getReferralLink();
    
    console.log('Sending referral email:', { businessName, email, phone, link: linkTextEl });
    
    const serviceID = "service_g5f9bh7";
    const templateID = "template_noaoocn";

    emailjs.send(
        serviceID,
        templateID,
        {
            business_name: businessName,
            email: email,
            phone: phone,
            link: linkTextEl
        }
    ).then(() => {
        showNotification('Referral email sent successfully!', 'success');
    }).catch((error) => {
        console.error('Email sending failed:', error);
        showNotification('Failed to send email. Please try again.', 'error');
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10002;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .notification-close:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add slideOut animation
    if (!document.getElementById('notification-slideout')) {
        const style = document.createElement('style');
        style.id = 'notification-slideout';
        style.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Keyboard support for modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Prevent modal close when clicking inside modal content
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.stopPropagation();
    }
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Handle anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form, .form-fields');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
});

// Field validation
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (fieldType === 'tel' && value) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Show/hide error
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#f44336';
    field.style.backgroundColor = '#ffebee';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #f44336;
        font-size: 12px;
        margin-top: 4px;
        animation: fadeIn 0.3s ease-in;
    `;
    
    field.parentElement.appendChild(errorElement);
}

// Clear field error
function clearFieldError(field) {
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = '';
    field.style.backgroundColor = '';
}

// Add fadeIn animation
if (!document.getElementById('field-error-styles')) {
    const style = document.createElement('style');
    style.id = 'field-error-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}