// ==================== SHOP PAGE AJAX FUNCTIONALITY ====================

// Get CSRF token from cookie
function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === ('csrftoken' + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
}

// Store current filter state
let currentFilters = {
    category: '',
    sort: 'popular',
    page: 1
};

// Toast notification function (if not already defined)
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

// ==================== AJAX FILTER FUNCTIONALITY ====================

// AJAX function to load products
async function loadProducts() {
    const spinner = document.getElementById('productsLoadingSpinner');
    const container = document.getElementById('productsGridContainer');
    
    // Show spinner
    if (spinner) spinner.style.display = 'block';
    if (container) container.style.opacity = '0.5';
    
    // Build URL with current filters
    const params = new URLSearchParams();
    if (currentFilters.category && currentFilters.category !== 'all') {
        params.append('category', currentFilters.category);
    }
    if (currentFilters.sort && currentFilters.sort !== 'popular') {
        params.append('sort', currentFilters.sort);
    }
    if (currentFilters.page && currentFilters.page > 1) {
        params.append('page', currentFilters.page);
    }
    
    try {
        const response = await fetch(`/shop/filter/?${params.toString()}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update products grid
            if (container) {
                container.innerHTML = data.html;
                container.style.opacity = '1';
            }
            
            // Update pagination if needed
            updatePagination(data);
            
            // Reattach all event listeners
            updateProductActionListeners();
            
            // Save scroll position and restore after update
            const scrollPosition = window.scrollY;
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 10);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
        if (container) container.style.opacity = '1';
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

// Update pagination controls
function updatePagination(data) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    if (data.total_pages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    let paginationHtml = '';
    
    // Previous button
    if (data.has_previous) {
        paginationHtml += `<button type="button" class="pagination-prev ajax-page-btn" data-page="${data.current_page - 1}">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
    } else {
        paginationHtml += `<span class="pagination-prev disabled">
            <i class="fas fa-chevron-left"></i> Previous
        </span>`;
    }
    
    // Page numbers
    paginationHtml += `<div class="pagination-numbers">`;
    for (let i = 1; i <= data.total_pages; i++) {
        if (i === data.current_page) {
            paginationHtml += `<span class="page-number active" data-page="${i}">${i}</span>`;
        } else if (Math.abs(i - data.current_page) <= 2) {
            paginationHtml += `<button type="button" class="page-number ajax-page-btn" data-page="${i}">${i}</button>`;
        }
    }
    paginationHtml += `</div>`;
    
    // Next button
    if (data.has_next) {
        paginationHtml += `<button type="button" class="pagination-next ajax-page-btn" data-page="${data.current_page + 1}">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
    } else {
        paginationHtml += `<span class="pagination-next disabled">
            Next <i class="fas fa-chevron-right"></i>
        </span>`;
    }
    
    paginationContainer.innerHTML = paginationHtml;
    
    // Reattach pagination event listeners
    document.querySelectorAll('.ajax-page-btn').forEach(btn => {
        btn.removeEventListener('click', handlePageClick);
        btn.addEventListener('click', handlePageClick);
    });
}

// Handle page click
function handlePageClick(e) {
    const page = parseInt(this.dataset.page);
    if (!isNaN(page)) {
        currentFilters.page = page;
        loadProducts();
        
        // Update URL without reload
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
    }
}

// Setup filter event listeners
function setupFilterListeners() {
    // Category filter chips
    const categoryChips = document.querySelectorAll('.filter-chip');
    categoryChips.forEach(chip => {
        chip.removeEventListener('click', handleCategoryClick);
        chip.addEventListener('click', handleCategoryClick);
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.removeEventListener('change', handleSortChange);
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Active filter remove buttons
    const activeFilterTags = document.querySelectorAll('.active-filter-tag');
    activeFilterTags.forEach(tag => {
        tag.removeEventListener('click', handleRemoveFilter);
        tag.addEventListener('click', handleRemoveFilter);
    });
    
    // Clear all filters button
    const clearAllBtn = document.getElementById('clearAllFilters');
    if (clearAllBtn) {
        clearAllBtn.removeEventListener('click', handleClearAll);
        clearAllBtn.addEventListener('click', handleClearAll);
    }
}

// Handle category click
function handleCategoryClick(e) {
    const category = this.dataset.category;
    
    // Update active state
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    this.classList.add('active');
    
    // Update current filters
    currentFilters.category = category === 'all' ? '' : category;
    currentFilters.page = 1;
    
    // Update URL
    const url = new URL(window.location.href);
    if (currentFilters.category) {
        url.searchParams.set('category', currentFilters.category);
    } else {
        url.searchParams.delete('category');
    }
    url.searchParams.delete('page');
    window.history.pushState({}, '', url);
    
    // Update active filters bar
    updateActiveFiltersBar();
    
    // Load products
    loadProducts();
}

// Handle sort change
function handleSortChange(e) {
    currentFilters.sort = e.target.value;
    currentFilters.page = 1;
    
    const url = new URL(window.location.href);
    url.searchParams.set('sort', currentFilters.sort);
    url.searchParams.delete('page');
    window.history.pushState({}, '', url);
    
    loadProducts();
}

// Update active filters bar
function updateActiveFiltersBar() {
    const activeBar = document.getElementById('activeFiltersBar');
    if (!activeBar) return;
    
    let html = '';
    
    if (currentFilters.category) {
        html += `<span class="active-filter-tag" data-filter-type="category" data-filter-value="${currentFilters.category}">
            ${currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1)}
            <i class="fas fa-times-circle"></i>
        </span>`;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    if (searchQuery) {
        html += `<span class="active-filter-tag" data-filter-type="search" data-filter-value="${searchQuery}">
            "${searchQuery}"
            <i class="fas fa-times-circle"></i>
        </span>`;
    }
    
    if (currentFilters.category || searchQuery) {
        html += `<a href="{% url 'shop' %}" class="clear-all-filters" id="clearAllFilters">Clear All</a>`;
    }
    
    activeBar.innerHTML = html;
    
    // Reattach event listeners to new filter tags
    const newFilterTags = document.querySelectorAll('.active-filter-tag');
    newFilterTags.forEach(tag => {
        tag.removeEventListener('click', handleRemoveFilter);
        tag.addEventListener('click', handleRemoveFilter);
    });
    
    const newClearBtn = document.getElementById('clearAllFilters');
    if (newClearBtn) {
        newClearBtn.removeEventListener('click', handleClearAll);
        newClearBtn.addEventListener('click', handleClearAll);
    }
}

// Handle remove filter
function handleRemoveFilter(e) {
    const filterType = this.dataset.filterType;
    
    if (filterType === 'category') {
        // Remove category filter
        currentFilters.category = '';
        currentFilters.page = 1;
        
        // Update active chip
        const allChip = document.querySelector('.filter-chip[data-category="all"]');
        if (allChip) {
            document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
            allChip.classList.add('active');
        }
        
        const url = new URL(window.location.href);
        url.searchParams.delete('category');
        url.searchParams.delete('page');
        window.history.pushState({}, '', url);
        
        updateActiveFiltersBar();
        loadProducts();
    } else if (filterType === 'search') {
        // Handle search removal
        currentFilters.page = 1;
        
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        url.searchParams.delete('page');
        window.history.pushState({}, '', url);
        
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.value = '';
        
        updateActiveFiltersBar();
        loadProducts();
    }
}

// Handle clear all filters
function handleClearAll(e) {
    e.preventDefault();
    
    currentFilters = {
        category: '',
        sort: 'popular',
        page: 1
    };
    
    // Reset sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'popular';
    
    // Reset active chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    const allChip = document.querySelector('.filter-chip[data-category="all"]');
    if (allChip) allChip.classList.add('active');
    
    // Clear search input
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) searchInput.value = '';
    
    // Update URL
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);
    
    updateActiveFiltersBar();
    loadProducts();
}

// ==================== AJAX ADD TO CART FUNCTIONALITY ====================

// Setup AJAX add to cart buttons
function setupAjaxAddToCart() {
    const addToCartBtns = document.querySelectorAll('.ajax-add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.removeEventListener('click', handleAjaxAddToCart);
        btn.addEventListener('click', handleAjaxAddToCart);
    });
}

// Handle AJAX add to cart click
async function handleAjaxAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = this.dataset.productId;
    const quantity = this.dataset.quantity || 1;
    const originalText = this.innerHTML;
    const originalBgColor = this.style.backgroundColor;
    
    // Show loading state
    this.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Adding...';
    this.disabled = true;
    
    try {
        const response = await fetch(`/cart/ajax-add/${productId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'quantity': quantity
            })
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            // Not logged in - redirect to login
            window.location.href = `/login/?next=${window.location.pathname}`;
            return;
        }
        
        if (data.status === 'success') {
            // Update cart badge
            const cartBadge = document.querySelector('.cart-count');
            if (cartBadge) {
                cartBadge.textContent = data.cart_count;
            }
            
            // Show success message
            showToast(data.message, 'success');
            
            // Animate button
            this.style.backgroundColor = '#28a745';
            this.style.borderColor = '#28a745';
            this.innerHTML = '<i class="fas fa-check me-1"></i> Added!';
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = originalBgColor;
                this.style.borderColor = '';
            }, 1500);
        } else {
            showToast(data.message || 'Failed to add to cart', 'error');
            this.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
        this.innerHTML = originalText;
    } finally {
        this.disabled = false;
    }
}

// ==================== AJAX BUY NOW FUNCTIONALITY ====================

// Setup AJAX buy now buttons
function setupAjaxBuyNow() {
    const buyNowBtns = document.querySelectorAll('.ajax-buy-now-btn');
    buyNowBtns.forEach(btn => {
        btn.removeEventListener('click', handleAjaxBuyNow);
        btn.addEventListener('click', handleAjaxBuyNow);
    });
}

// Handle AJAX buy now click
async function handleAjaxBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = this.dataset.productId;
    const quantity = this.dataset.quantity || 1;
    const originalText = this.innerHTML;
    
    // Show loading state
    this.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Processing...';
    this.disabled = true;
    
    try {
        const response = await fetch(`/cart/ajax-add/${productId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'quantity': quantity
            })
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            window.location.href = `/login/?next=${window.location.pathname}`;
            return;
        }
        
        if (data.status === 'success') {
            // Update cart badge
            const cartBadge = document.querySelector('.cart-count');
            if (cartBadge) {
                cartBadge.textContent = data.cart_count;
            }
            
            // Show success message
            showToast('Product added! Redirecting to checkout...', 'success');
            
            // Redirect to checkout
            setTimeout(() => {
                window.location.href = '/checkout/';
            }, 500);
        } else {
            showToast(data.message || 'Failed to process', 'error');
            this.innerHTML = originalText;
            this.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
        this.innerHTML = originalText;
        this.disabled = false;
    }
}

// ==================== AJAX WISHLIST FUNCTIONALITY ====================

// Setup wishlist AJAX buttons
function setupWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.wishlist-ajax-btn');
    wishlistBtns.forEach(btn => {
        btn.removeEventListener('click', handleWishlistClick);
        btn.addEventListener('click', handleWishlistClick);
    });
}

// Handle wishlist button click
async function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = this.dataset.productId;
    const icon = this.querySelector('i');
    
    try {
        const response = await fetch(`/wishlist/ajax-add/${productId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            window.location.href = `/login/?next=${window.location.pathname}`;
            return;
        }
        
        if (data.status === 'success') {
            // Update icon
            if (data.wishlist_status === 'added') {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showToast(data.message, 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                showToast(data.message, 'info');
            }
            
            // Update wishlist badge count
            const wishlistBadge = document.querySelector('.wishlist-count');
            if (wishlistBadge) {
                wishlistBadge.textContent = data.wishlist_count;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    }
}

// ==================== UPDATE EVENT LISTENERS AFTER AJAX ====================

// Update all product action event listeners after grid update
function updateProductActionListeners() {
    setupAjaxAddToCart();
    setupAjaxBuyNow();
    setupWishlistButtons();
}

// Initialize shop page
document.addEventListener('DOMContentLoaded', function() {
    // Parse current URL params
    const urlParams = new URLSearchParams(window.location.search);
    currentFilters.category = urlParams.get('category') || '';
    currentFilters.sort = urlParams.get('sort') || 'popular';
    currentFilters.page = parseInt(urlParams.get('page')) || 1;
    
    // Setup event listeners
    setupFilterListeners();
    setupAjaxAddToCart();
    setupAjaxBuyNow();
    setupWishlistButtons();
    
    // Restore sort select value
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect && currentFilters.sort) {
        sortSelect.value = currentFilters.sort;
    }
    
    // Restore active category chip
    if (currentFilters.category) {
        const activeChip = document.querySelector(`.filter-chip[data-category="${currentFilters.category}"]`);
        if (activeChip) {
            document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
            activeChip.classList.add('active');
        }
    }
});