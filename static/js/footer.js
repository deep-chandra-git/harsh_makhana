// ==================== FOOTER JAVASCRIPT ====================

// Newsletter form validation
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            const emailInput = this.querySelector('input[name="email"]');
            if (emailInput && !isValidEmail(emailInput.value)) {
                e.preventDefault();
                showToast('Please enter a valid email address', 'error');
            }
        });
    }
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function showToast(msg, type = "success") {
    let toastDiv = document.getElementById('dynamicToast');
    if (!toastDiv) {
        toastDiv = document.createElement('div');
        toastDiv.id = 'dynamicToast';
        toastDiv.className = 'position-fixed bottom-0 end-0 m-3 p-3 rounded-4 shadow-lg';
        toastDiv.style.zIndex = 1090;
        toastDiv.style.minWidth = '250px';
        toastDiv.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(toastDiv);
    }
    
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
    toastDiv.innerHTML = `<i class="fas ${icon} me-2 text-gold"></i> ${msg}`;
    toastDiv.style.backgroundColor = '#1e1b16';
    toastDiv.style.color = '#e6a017';
    toastDiv.style.borderLeft = `4px solid var(--primary-gold)`;
    toastDiv.style.opacity = '1';
    
    setTimeout(() => {
        toastDiv.style.opacity = '0';
    }, 3000);
}

// Initialize footer functionality
document.addEventListener('DOMContentLoaded', function() {
    setupNewsletterForm();
});