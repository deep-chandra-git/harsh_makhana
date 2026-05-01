// ==================== HEADER / NAVBAR JAVASCRIPT ====================

// Global search setup
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (!searchInput) return;
    
    // Allow Enter key to submit search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchForm = this.closest('form');
            if (searchForm) {
                e.preventDefault();
                searchForm.submit();
            }
        }
    });
    
    // Clear search indicator if present
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            window.location.href = window.location.pathname;
        });
    }
}

// Mobile menu close on link click
function setupMobileMenu() {
    const mobileNavLinks = document.querySelectorAll('#mobileNav .nav-link');
    const mobileNavCollapse = document.getElementById('mobileNav');
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileNavCollapse && window.innerWidth < 992) {
                const bsCollapse = bootstrap.Collapse.getInstance(mobileNavCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });
    });
}

// Initialize header functionality
document.addEventListener('DOMContentLoaded', function() {
    setupGlobalSearch();
    setupMobileMenu();
});