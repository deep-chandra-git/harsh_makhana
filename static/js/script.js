// ==================== MAIN SCRIPT.JS ====================
// Toast Notification Function
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

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price).replace('₹', '₹');
}

// Auto-dismiss alerts
function setupAutoDismissAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => {
                if (alert.parentNode) alert.remove();
            }, 500);
        }, 5000);
    });
}

// ==================== LOGIN/SIGNUP FUNCTIONALITY ====================
function setupLoginSignup() {
    const loginTab = document.getElementById('loginTabContent');
    const signupTab = document.getElementById('signupTabContent');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    if (loginTab && signupTab && tabBtns.length) {
        function switchTab(tabName) {
            if (tabName === 'login') {
                loginTab.style.display = 'block';
                signupTab.style.display = 'none';
                tabBtns.forEach(btn => {
                    if (btn.getAttribute('data-tab') === 'login') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                history.pushState(null, null, '#login');
            } else {
                loginTab.style.display = 'none';
                signupTab.style.display = 'block';
                tabBtns.forEach(btn => {
                    if (btn.getAttribute('data-tab') === 'signup') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                history.pushState(null, null, '#signup');
            }
        }
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab(this.getAttribute('data-tab'));
            });
        });
        
        const hash = window.location.hash;
        switchTab(hash === '#signup' ? 'signup' : 'login');
    }
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });
    
    // Signup form validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            const password1 = document.getElementById('signupPassword');
            const password2 = document.getElementById('signupConfirmPassword');
            const termsCheckbox = document.getElementById('agreeTerms');
            const username = document.getElementById('signupUsername');
            const email = document.getElementById('signupEmail');
            const fullName = document.getElementById('signupFullName');
            
            if (fullName && fullName.value.trim() === '') {
                e.preventDefault();
                showToast('Please enter your full name', 'error');
                fullName.focus();
                return false;
            }
            
            if (username && username.value.trim() === '') {
                e.preventDefault();
                showToast('Please choose a username', 'error');
                username.focus();
                return false;
            }
            
            if (email && email.value.trim() === '') {
                e.preventDefault();
                showToast('Please enter your email address', 'error');
                email.focus();
                return false;
            }
            
            if (email && !isValidEmail(email.value)) {
                e.preventDefault();
                showToast('Please enter a valid email address', 'error');
                email.focus();
                return false;
            }
            
            if (password1 && password2 && password1.value !== password2.value) {
                e.preventDefault();
                showToast('Passwords do not match!', 'error');
                password2.focus();
                return false;
            }
            
            if (password1 && password1.value.length < 6) {
                e.preventDefault();
                showToast('Password must be at least 6 characters long!', 'error');
                password1.focus();
                return false;
            }
            
            if (termsCheckbox && !termsCheckbox.checked) {
                e.preventDefault();
                showToast('Please agree to the Terms & Conditions', 'error');
                termsCheckbox.focus();
                return false;
            }
            
            return true;
        });
    }
}

// ==================== CONTACT FORM AJAX ====================
function initContactFormAjax() {
    const contactForm = document.getElementById('contactFormAjax');
    if (!contactForm) return;
    
    const submitBtn = document.getElementById('contactSubmitBtn');
    const alertContainer = document.getElementById('contactAlertContainer');
    
    if (!submitBtn || !alertContainer) return;
    
    function showAlert(message, type = 'success') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => {
                    if (alert.parentNode) alert.remove();
                }, 500);
            }
        }, 5000);
    }
    
    function clearFieldErrors() {
        const fields = ['full_name', 'email', 'phone', 'subject', 'message'];
        fields.forEach(field => {
            const input = document.getElementById(`contact_${field}`);
            const errorDiv = document.getElementById(`error_${field}`);
            if (input) {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
            if (errorDiv) {
                errorDiv.textContent = '';
            }
        });
    }
    
    function showFieldErrors(errors) {
        for (const [field, errorMessage] of Object.entries(errors)) {
            const errorDiv = document.getElementById(`error_${field}`);
            const input = document.getElementById(`contact_${field}`);
            if (errorDiv) {
                errorDiv.textContent = errorMessage;
            }
            if (input) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            }
        }
    }
    
    function resetForm() {
        contactForm.reset();
        const fields = ['full_name', 'email', 'phone', 'subject', 'message'];
        fields.forEach(field => {
            const input = document.getElementById(`contact_${field}`);
            if (input) {
                input.classList.remove('is-valid', 'is-invalid');
            }
        });
    }
    
    const csrftoken = getCookie('csrftoken');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
        
        clearFieldErrors();
        
        const formData = new FormData(contactForm);
        
        try {
            const response = await fetch('/contact/submit-ajax/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                showAlert(data.message, 'success');
                resetForm();
            } else {
                showAlert(data.message || 'Something went wrong. Please try again.', 'danger');
                if (data.errors) {
                    showFieldErrors(data.errors);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Network error. Please check your connection and try again.', 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane ms-2"></i>';
        }
    });
    
    const inputFields = ['full_name', 'email', 'phone', 'subject', 'message'];
    inputFields.forEach(field => {
        const input = document.getElementById(`contact_${field}`);
        if (input) {
            input.addEventListener('input', function() {
                this.classList.remove('is-invalid');
                const errorDiv = document.getElementById(`error_${field}`);
                if (errorDiv) {
                    errorDiv.textContent = '';
                }
            });
        }
    });
}

// ==================== PRODUCT GALLERY (Product Page) ====================
function setupProductGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const mainImage = document.getElementById('mainProductImage');
    
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const newImage = this.getAttribute('data-image');
                if (newImage) {
                    mainImage.src = newImage;
                }
            });
        });
    }
}

// ==================== QUANTITY SELECTOR (Product Page) ====================
function setupQuantitySelector() {
    const qtyDecr = document.getElementById('productQtyDecr');
    const qtyIncr = document.getElementById('productQtyIncr');
    const qtyInput = document.getElementById('productQuantity');
    
    if (qtyDecr && qtyIncr && qtyInput) {
        qtyDecr.addEventListener('click', function() {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });
        
        qtyIncr.addEventListener('click', function() {
            let val = parseInt(qtyInput.value);
            qtyInput.value = val + 1;
        });
        
        qtyInput.addEventListener('change', function() {
            let val = parseInt(this.value);
            if (isNaN(val) || val < 1) {
                this.value = 1;
            }
            if (val > 99) {
                this.value = 99;
            }
        });
    }
}

// ==================== WEIGHT SELECTION (Product Page) ====================
function setupWeightSelection() {
    const weightBtns = document.querySelectorAll('#weightOptions .option-btn');
    const dynamicPriceSpan = document.getElementById('dynamicPrice');
    const basePriceAttr = dynamicPriceSpan ? dynamicPriceSpan.getAttribute('data-base-price') : null;
    
    if (weightBtns.length && dynamicPriceSpan && basePriceAttr) {
        const basePrice = parseFloat(basePriceAttr);
        
        weightBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                weightBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const multiplier = parseFloat(this.getAttribute('data-multiplier'));
                const newPrice = Math.round(basePrice * multiplier);
                dynamicPriceSpan.innerHTML = `₹${newPrice}`;
                
                const variantInput = document.getElementById('selectedVariantId');
                if (variantInput) {
                    variantInput.value = this.getAttribute('data-variant-id') || '';
                }
            });
        });
    }
}

// ==================== CART QUANTITY UPDATE (Cart Page) ====================
function setupCartQuantity() {
    const decButtons = document.querySelectorAll('.quantity-decrement');
    const incButtons = document.querySelectorAll('.quantity-increment');
    const quantityInputs = document.querySelectorAll('.quantity-input-cart');
    
    decButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input-cart');
            if (input) {
                let val = parseInt(input.value);
                if (val > 1) {
                    input.value = val - 1;
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
    });
    
    incButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input-cart');
            if (input) {
                let val = parseInt(input.value);
                input.value = val + 1;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const form = this.closest('.quantity-form');
            if (form) {
                form.submit();
            }
        });
    });
}

// ==================== REMOVE WISHLIST ITEM CONFIRMATION ====================
function setupRemoveWishlistItem() {
    const removeButtons = document.querySelectorAll('.remove-wishlist-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Remove this item from your wishlist?')) {
                e.preventDefault();
            }
        });
    });
}

// ==================== CLEAR WISHLIST CONFIRMATION ====================
function setupClearWishlist() {
    const clearWishlistBtn = document.getElementById('clearWishlistBtn');
    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    }
}

// ==================== RATING INPUT SETUP (Review Modal) ====================
function setupRatingInput() {
    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('reviewRating');
    
    if (ratingStars.length && ratingInput) {
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                ratingInput.value = rating;
                
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseleave', function() {
                const currentRating = parseInt(ratingInput.value);
                ratingStars.forEach((s, index) => {
                    if (currentRating > 0 && index < currentRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }
}

// ==================== PROFILE PAGE SECTION NAVIGATION ====================
function setupProfileNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.profile-section');
    
    if (navItems.length && sections.length) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                sections.forEach(section => section.classList.remove('active-section'));
                const targetSection = document.getElementById(`${sectionId}Section`);
                if (targetSection) {
                    targetSection.classList.add('active-section');
                }
                
                history.pushState(null, null, `#${sectionId}Section`);
            });
        });
    }
}

// ==================== PROFILE SECTION HASH HANDLER ====================
function handleProfileSectionHash() {
    if (window.location.pathname.includes('profile.html') && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetSection = document.getElementById(hash);
        
        if (targetSection) {
            let sectionName = '';
            if (hash === 'personalSection') sectionName = 'personal';
            else if (hash === 'addressSection') sectionName = 'address';
            else if (hash === 'orderSection') sectionName = 'order';
            else if (hash === 'securitySection') sectionName = 'security';
            else if (hash === 'logoutSection') sectionName = 'logout';
            
            if (sectionName) {
                const sidebarItems = document.querySelectorAll('.sidebar-nav li');
                sidebarItems.forEach(item => {
                    if (item.getAttribute('data-section') === sectionName) {
                        item.click();
                    }
                });
                
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }
}

// ==================== PROFILE PAGE ADDRESS MANAGEMENT ====================
function setupProfileAddressManagement() {
    const deleteButtons = document.querySelectorAll('.delete-address');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const addressId = this.getAttribute('data-address-id');
            
            if (confirm('Are you sure you want to delete this address?')) {
                fetch(`/profile/delete-address/${addressId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const addressCard = document.getElementById(`addressCard_${addressId}`);
                        if (addressCard) {
                            addressCard.remove();
                        }
                        showToast('Address deleted successfully!', 'success');
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        showToast(data.message || 'Error deleting address', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Network error. Please try again.', 'error');
                });
            }
        });
    });
    
    const editButtons = document.querySelectorAll('.edit-address');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const addressId = this.getAttribute('data-address-id');
            const addressCard = document.getElementById(`addressCard_${addressId}`);
            
            const name = addressCard.querySelector('h5')?.innerText || '';
            const fullNameElement = addressCard.querySelector('p.mb-1');
            const fullName = fullNameElement ? fullNameElement.innerText : '';
            
            const addressText = addressCard.querySelector('p.mb-0')?.innerHTML || '';
            const lines = addressText.split('<br>');
            
            let addressLine1 = '', addressLine2 = '', city = '', state = '', pincode = '', phone = '';
            
            if (lines[0]) addressLine1 = lines[0].replace(/<br>/g, '').trim();
            if (lines[1] && !lines[1].includes('Phone:')) addressLine2 = lines[1].replace(/<br>/g, '').trim();
            
            let cityStatePin = '';
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(',') && lines[i].includes('-')) {
                    cityStatePin = lines[i].replace(/<br>/g, '').trim();
                    break;
                }
            }
            
            const cityStateMatch = cityStatePin.match(/(.+),\s*(.+)\s*-\s*(\d+)/);
            if (cityStateMatch) {
                city = cityStateMatch[1].trim();
                state = cityStateMatch[2].trim();
                pincode = cityStateMatch[3].trim();
            }
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('Phone:')) {
                    phone = lines[i].replace('Phone:', '').replace(/<br>/g, '').trim();
                    break;
                }
            }
            
            const isDefault = addressCard.classList.contains('default');
            
            document.getElementById('editAddressId').value = addressId;
            document.getElementById('editAddressName').value = name;
            document.getElementById('editFullName').value = fullName;
            document.getElementById('editAddressLine1').value = addressLine1;
            document.getElementById('editAddressLine2').value = addressLine2;
            document.getElementById('editCity').value = city;
            document.getElementById('editState').value = state;
            document.getElementById('editPincode').value = pincode;
            document.getElementById('editPhone').value = phone;
            document.getElementById('editSetDefault').checked = isDefault;
            
            const editForm = document.getElementById('editAddressForm');
            editForm.action = `/profile/update-address/${addressId}/`;
        });
    });
}

// ==================== PROFILE FORM SUBMISSION HANDLERS ====================
function setupProfileFormHandlers() {
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            const fullName = document.getElementById('fullName');
            if (fullName && fullName.value.trim() === '') {
                e.preventDefault();
                showToast('Please enter your full name', 'error');
                return false;
            }
            return true;
        });
    }
    
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            const newPassword = document.getElementById('newPassword');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (newPassword && newPassword.value.length < 6) {
                e.preventDefault();
                showToast('New password must be at least 6 characters long', 'error');
                newPassword.focus();
                return false;
            }
            
            if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
                e.preventDefault();
                showToast('New passwords do not match', 'error');
                confirmPassword.focus();
                return false;
            }
            
            return true;
        });
    }
    
    const addAddressForm = document.getElementById('addAddressForm');
    if (addAddressForm) {
        addAddressForm.addEventListener('submit', function(e) {
            const pincode = this.querySelector('input[name="pincode"]');
            const phone = this.querySelector('input[name="phone"]');
            
            if (pincode && pincode.value && !/^\d{6}$/.test(pincode.value)) {
                e.preventDefault();
                showToast('Please enter a valid 6-digit PIN code', 'error');
                return false;
            }
            
            if (phone && phone.value && !/^\d{10}$/.test(phone.value.replace(/[\s\-+]/g, ''))) {
                e.preventDefault();
                showToast('Please enter a valid 10-digit phone number', 'error');
                return false;
            }
            
            return true;
        });
    }
    
    const editAddressForm = document.getElementById('editAddressForm');
    if (editAddressForm) {
        editAddressForm.addEventListener('submit', function(e) {
            const pincode = document.getElementById('editPincode');
            const phone = document.getElementById('editPhone');
            
            if (pincode && pincode.value && !/^\d{6}$/.test(pincode.value)) {
                e.preventDefault();
                showToast('Please enter a valid 6-digit PIN code', 'error');
                return false;
            }
            
            if (phone && phone.value && !/^\d{10}$/.test(phone.value.replace(/[\s\-+]/g, ''))) {
                e.preventDefault();
                showToast('Please enter a valid 10-digit phone number', 'error');
                return false;
            }
            
            return true;
        });
    }
    
    const logoutForm = document.getElementById('logoutForm');
    if (logoutForm) {
        logoutForm.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to logout?')) {
                e.preventDefault();
            }
        });
    }
}

// ==================== CHECKOUT ADDRESS SELECTION ====================
function setupCheckoutAddress() {
    const addressSelect = document.getElementById('addressSelect');
    if (addressSelect) {
        addressSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const addressData = selectedOption.dataset.address;
            if (addressData) {
                try {
                    const address = JSON.parse(addressData);
                    const shippingDetails = document.getElementById('shippingDetails');
                    if (shippingDetails) {
                        shippingDetails.innerHTML = `
                            <p><strong>${address.full_name}</strong></p>
                            <p>${address.address_line1}</p>
                            ${address.address_line2 ? `<p>${address.address_line2}</p>` : ''}
                            <p>${address.city}, ${address.state} - ${address.pincode}</p>
                            <p>Phone: ${address.phone}</p>
                        `;
                    }
                } catch (e) {
                    console.error('Error parsing address data');
                }
            }
        });
    }
}

// ==================== BACK TO TOP BUTTON ====================
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== PRODUCT FILTER PERSISTENCE ====================
function setupFilterPersistence() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const sort = urlParams.get('sort');
    const search = urlParams.get('q');
    
    if (category && category !== 'all') {
        const filterBtn = document.querySelector(`.category-chip[data-category="${category}"]`);
        if (filterBtn) {
            document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');
        }
    }
    
    if (sort) {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = sort;
        }
    }
    
    if (search) {
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) {
            searchInput.value = search;
        }
    }
}

// ==================== STICKY FILTER BAR ====================
function setupStickyFilter() {
    const filterBar = document.querySelector('.shop-filter-section');
    if (!filterBar) return;
    
    const filterBarOffset = filterBar.offsetTop;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > filterBarOffset) {
            filterBar.classList.add('sticky-filter');
        } else {
            filterBar.classList.remove('sticky-filter');
        }
    });
}

// ==================== LAZY LOADING IMAGES ====================
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ==================== SHOP PAGE AJAX FILTER ====================
function setupShopFilters() {
    const sortSelect = document.getElementById('sortSelect');
    const categoryLinks = document.querySelectorAll('.category-chip');
    
    async function updateProducts() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || '';
        const sort = sortSelect ? sortSelect.value : 'popular';
        const search = urlParams.get('q') || '';
        
        try {
            const response = await fetch(`/shop/filter/?category=${category}&sort=${sort}&q=${search}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                const productsGrid = document.querySelector('.products-grid');
                if (productsGrid && data.html) {
                    productsGrid.innerHTML = data.html;
                }
                
                // Update URL without reload
                const newUrl = `/shop/?category=${category}&sort=${sort}${search ? `&q=${search}` : ''}`;
                window.history.pushState({}, '', newUrl);
                
                // Reattach event listeners to new products
                attachProductEventListeners();
            }
        } catch (error) {
            console.error('Error updating products:', error);
        }
    }
    
    function attachProductEventListeners() {
        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        addToCartBtns.forEach(btn => {
            btn.removeEventListener('click', handleAddToCart);
            btn.addEventListener('click', handleAddToCart);
        });
        
        // Buy now buttons
        const buyNowBtns = document.querySelectorAll('.buy-now-btn');
        buyNowBtns.forEach(btn => {
            btn.removeEventListener('click', handleBuyNow);
            btn.addEventListener('click', handleBuyNow);
        });
        
        // Wishlist buttons
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            btn.removeEventListener('click', handleWishlist);
            btn.addEventListener('click', handleWishlist);
        });
    }
    
    // Add to Cart - ONLY updates cart badge
    async function handleAddToCart(e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute('data-product-id');
        const originalHtml = this.innerHTML;
        
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>';
        
        try {
            const response = await fetch(`/cart/ajax-add/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ quantity: 1 })
            });
            
            const data = await response.json();
            
            if (response.status === 401) {
                window.location.href = `/login/?next=${encodeURIComponent(window.location.href)}`;
                return;
            }
            
            if (response.ok && data.status === 'success') {
                // Update ONLY cart badge
                const cartBadge = document.querySelector('.cart-count');
                if (cartBadge && data.cart_count !== undefined) {
                    cartBadge.textContent = data.cart_count;
                    if (data.cart_count === 0) {
                        cartBadge.style.display = 'none';
                    } else {
                        cartBadge.style.display = 'inline-block';
                    }
                }
                showToast('Item added to cart!', 'success');
                this.innerHTML = '<i class="fas fa-check"></i> Added';
                setTimeout(() => {
                    this.innerHTML = originalHtml;
                    this.disabled = false;
                }, 1500);
            } else {
                showToast(data.message || 'Error adding to cart', 'error');
                this.disabled = false;
                this.innerHTML = originalHtml;
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Network error. Please try again.', 'error');
            this.disabled = false;
            this.innerHTML = originalHtml;
        }
    }
    
    async function handleBuyNow(e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute('data-product-id');
        const originalHtml = this.innerHTML;
        
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>';
        
        try {
            const response = await fetch(`/cart/ajax-add/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ quantity: 1 })
            });
            
            const data = await response.json();
            
            if (response.status === 401) {
                window.location.href = `/login/?next=${encodeURIComponent(window.location.href)}`;
                return;
            }
            
            if (response.ok && data.status === 'success') {
                // Update cart badge
                const cartBadge = document.querySelector('.cart-count');
                if (cartBadge && data.cart_count !== undefined) {
                    cartBadge.textContent = data.cart_count;
                    if (data.cart_count === 0) {
                        cartBadge.style.display = 'none';
                    } else {
                        cartBadge.style.display = 'inline-block';
                    }
                }
                window.location.href = '/checkout/';
            } else {
                showToast(data.message || 'Error processing. Please try again.', 'error');
                this.disabled = false;
                this.innerHTML = originalHtml;
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Network error. Please try again.', 'error');
            this.disabled = false;
            this.innerHTML = originalHtml;
        }
    }
    
    // Wishlist - ONLY updates wishlist badge
    async function handleWishlist(e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute('data-product-id');
        const icon = this.querySelector('i');
        
        try {
            const response = await fetch(`/wishlist/ajax-add/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (response.status === 401) {
                window.location.href = `/login/?next=${encodeURIComponent(window.location.href)}`;
                return;
            }
            
            if (response.ok && data.status === 'success') {
                if (data.wishlist_status === 'added') {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showToast('Added to wishlist!', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showToast('Removed from wishlist!', 'info');
                }
                
                // Update ONLY wishlist badge
                const wishlistBadge = document.querySelector('.wishlist-count');
                if (wishlistBadge && data.wishlist_count !== undefined) {
                    wishlistBadge.textContent = data.wishlist_count;
                    if (data.wishlist_count === 0) {
                        wishlistBadge.style.display = 'none';
                    } else {
                        wishlistBadge.style.display = 'inline-block';
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', updateProducts);
    }
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            const url = new URL(window.location.href);
            if (category && category !== 'all') {
                url.searchParams.set('category', category);
            } else {
                url.searchParams.delete('category');
            }
            window.location.href = url.toString();
        });
    });
    
    attachProductEventListeners();
}

// ==================== BUY NOW DIRECT CHECKOUT (Product Page) ====================
function setupBuyNowDirectCheckout() {
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (!buyNowBtn) return;
    
    buyNowBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const productId = this.getAttribute('data-product-id');
        const quantity = document.getElementById('productQuantity') ? document.getElementById('productQuantity').value : 1;
        const variantId = document.getElementById('selectedVariantId') ? document.getElementById('selectedVariantId').value : '';
        
        const originalHtml = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Processing...';
        
        try {
            const formData = new URLSearchParams();
            formData.append('quantity', quantity);
            if (variantId) {
                formData.append('variant_id', variantId);
            }
            
            const response = await fetch(`/cart/ajax-add/${productId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.status === 401) {
                window.location.href = `/login/?next=${encodeURIComponent(window.location.href)}`;
                return;
            }
            
            if (response.ok && data.status === 'success') {
                // Update cart badge only
                const cartBadge = document.querySelector('.cart-count');
                if (cartBadge && data.cart_count !== undefined) {
                    cartBadge.textContent = data.cart_count;
                    if (data.cart_count === 0) {
                        cartBadge.style.display = 'none';
                    } else {
                        cartBadge.style.display = 'inline-block';
                    }
                }
                window.location.href = '/checkout/';
            } else {
                showToast(data.message || 'Error adding to cart. Please try again.', 'error');
                this.disabled = false;
                this.innerHTML = originalHtml;
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Network error. Please try again.', 'error');
            this.disabled = false;
            this.innerHTML = originalHtml;
        }
    });
}

// ==================== PRODUCT PAGE FUNCTIONALITY ====================
function setupProductPage() {
    const weightBtns = document.querySelectorAll('#weightOptions .option-btn');
    const dynamicPriceSpan = document.getElementById('dynamicPrice');
    const variantInput = document.getElementById('selectedVariantId');
    
    if (weightBtns.length && dynamicPriceSpan) {
        weightBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                weightBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const price = this.getAttribute('data-price');
                const variantId = this.getAttribute('data-variant-id');
                if (price) {
                    dynamicPriceSpan.innerHTML = `₹${price}`;
                }
                if (variantInput && variantId) {
                    variantInput.value = variantId;
                }
            });
        });
    }
    
    setupBuyNowDirectCheckout();
    
    const ratingStars = document.querySelectorAll('#ratingInputContainer i');
    const reviewRatingInput = document.getElementById('reviewRating');
    
    if (ratingStars.length && reviewRatingInput) {
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                reviewRatingInput.value = rating;
                
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseleave', function() {
                const currentRating = parseInt(reviewRatingInput.value);
                ratingStars.forEach((s, index) => {
                    if (currentRating > 0 && index < currentRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }
    
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const mainImage = document.getElementById('mainProductImage');
    
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const newImage = this.getAttribute('data-image');
                if (newImage) {
                    mainImage.src = newImage;
                }
            });
        });
    }
}

// ==================== CART PAGE FUNCTIONALITY ====================
// Separate handler function for cart remove - prevents duplicate confirmations
function handleCartRemoveClick(e) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        e.preventDefault();
        return false;
    }
    return true;
}

function setupCartPage() {
    const quantityInputs = document.querySelectorAll('.quantity-input-cart');
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const form = this.closest('.quantity-form');
            if (form) {
                form.submit();
            }
        });
    });
    
    // Remove cart item confirmation - SINGLE CONFIRMATION ONLY
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(btn => {
        // Remove any existing listeners first to prevent duplicates
        btn.removeEventListener('click', handleCartRemoveClick);
        btn.addEventListener('click', handleCartRemoveClick);
    });
}

// ==================== WISHLIST PAGE FUNCTIONALITY ====================
function setupWishlistPage() {
    function showWishlistToast(message, type = 'success') {
        let toastDiv = document.getElementById('wishlistToast');
        if (!toastDiv) {
            toastDiv = document.createElement('div');
            toastDiv.id = 'wishlistToast';
            toastDiv.className = 'position-fixed bottom-0 end-0 m-3 p-3 rounded-4 shadow-lg';
            toastDiv.style.zIndex = 1090;
            toastDiv.style.minWidth = '250px';
            toastDiv.style.backgroundColor = '#1e1b16';
            toastDiv.style.color = '#e6a017';
            toastDiv.style.borderLeft = '4px solid #e6a017';
            toastDiv.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(toastDiv);
        }
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toastDiv.innerHTML = `<i class="fas ${icon} me-2"></i> ${message}`;
        toastDiv.style.opacity = '1';
        
        setTimeout(() => {
            toastDiv.style.opacity = '0';
        }, 3000);
    }
    
    const moveToCartBtns = document.querySelectorAll('.move-to-cart-btn');
    
    moveToCartBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            const wishlistItem = this.closest('.wishlist-item');
            const originalText = this.innerHTML;
            
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Moving...';
            
            try {
                const cartResponse = await fetch(`/cart/ajax-add/${productId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: new URLSearchParams({ quantity: 1 })
                });
                
                const cartData = await cartResponse.json();
                
                if (cartResponse.status === 401) {
                    window.location.href = `/login/?next=${encodeURIComponent(window.location.href)}`;
                    return;
                }
                
                if (cartResponse.ok && cartData.status === 'success') {
                    // Update cart badge
                    const cartBadge = document.querySelector('.cart-count');
                    if (cartBadge && cartData.cart_count !== undefined) {
                        cartBadge.textContent = cartData.cart_count;
                        if (cartData.cart_count === 0) {
                            cartBadge.style.display = 'none';
                        } else {
                            cartBadge.style.display = 'inline-block';
                        }
                    }
                    
                    const wishlistResponse = await fetch(`/wishlist/remove/${productId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    
                    const wishlistData = await wishlistResponse.json();
                    
                    if (wishlistResponse.ok) {
                        wishlistItem.remove();
                        showWishlistToast('Item moved to cart successfully!', 'success');
                        
                        const remainingItems = document.querySelectorAll('.wishlist-item').length;
                        if (remainingItems === 0) {
                            location.reload();
                        }
                    } else {
                        showWishlistToast(wishlistData.message || 'Error removing from wishlist', 'error');
                        this.disabled = false;
                        this.innerHTML = originalText;
                    }
                } else {
                    showWishlistToast(cartData.message || 'Error adding to cart', 'error');
                    this.disabled = false;
                    this.innerHTML = originalText;
                }
            } catch (error) {
                console.error('Error:', error);
                showWishlistToast('Network error. Please try again.', 'error');
                this.disabled = false;
                this.innerHTML = originalText;
            }
        });
    });
    
    const clearWishlistBtn = document.getElementById('clearWishlistBtn');
    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    }
    
    const moveAllBtn = document.getElementById('moveAllToCartBtn');
    if (moveAllBtn) {
        moveAllBtn.addEventListener('click', function(e) {
            const itemCount = document.querySelectorAll('.wishlist-item').length;
            if (itemCount > 0 && !confirm(`Move all ${itemCount} items to cart?`)) {
                e.preventDefault();
            }
        });
    }
}

// ==================== INITIALIZE ALL FUNCTIONS ====================
document.addEventListener('DOMContentLoaded', function() {
    setupAutoDismissAlerts();
    setupLoginSignup();
    initContactFormAjax();
    setupProductGallery();
    setupQuantitySelector();
    setupWeightSelection();
    setupCartQuantity();
    // setupRemoveCartItem();  // REMOVED - duplicate with setupCartPage
    setupRemoveWishlistItem();
    // setupClearWishlist();    // REMOVED - duplicate with setupclearWishlist
    setupRatingInput();
    setupProfileNavigation();
    setupProfileAddressManagement();
    setupProfileFormHandlers();
    setupCheckoutAddress();
    setupBackToTop();
    setupFilterPersistence();
    setupStickyFilter();
    setupLazyLoading();
    setupShopFilters();
    setupProductPage();
    setupCartPage();  // This handles remove confirmation (only once)
    setupWishlistPage();
    
    handleProfileSectionHash();
    
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        const spinners = document.querySelectorAll('.loading-spinner');
        spinners.forEach(spinner => spinner.remove());
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        formatPrice,
        isValidEmail,
        getCookie
    };
}