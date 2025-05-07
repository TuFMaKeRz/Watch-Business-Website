document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productsGrid = document.getElementById('productsGrid');
    const pagination = document.getElementById('pagination');
    const categoryFilters = document.getElementById('categoryFilters');
    const brandFilters = document.getElementById('brandFilters');
    const movementFilters = document.getElementById('movementFilters');
    const featureFilters = document.getElementById('featureFilters');
    const priceRange = document.getElementById('priceRange');
    const minPriceDisplay = document.getElementById('minPrice');
    const maxPriceDisplay = document.getElementById('maxPrice');
    const sortSelect = document.getElementById('sort');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const productsHeading = document.getElementById('productsHeading');
    const quickViewModal = document.getElementById('quickViewModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.querySelector('.close-modal');
    
    // App State
    let allWatches = [];
    let filteredWatches = [];
    let currentPage = 1;
    const watchesPerPage = 8;
    let currentFilters = {
        categories: [],
        brands: [],
        movements: [],
        features: [],
        minPrice: 0,
        maxPrice: 10000,
        sort: 'featured'
    };
    
    // Fetch watch data
    fetch('data/watches.json')
        .then(response => response.json())
        .then(data => {
            allWatches = data.watches;
            initializeFilters(data);
            applyFilters();
        })
        .catch(error => console.error('Error loading watch data:', error));
    
    // Initialize filter options
    function initializeFilters(data) {
        // Categories
        data.categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" name="category" value="${category}" checked>
                    ${category.charAt(0).toUpperCase() + category.slice(1)} Watches
                </label>
            `;
            categoryFilters.appendChild(li);
        });
        
        // Brands
        data.brands.forEach(brand => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" name="brand" value="${brand}" checked>
                    ${brand}
                </label>
            `;
            brandFilters.appendChild(li);
        });
        
        // Movements
        data.movements.forEach(movement => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" name="movement" value="${movement}" checked>
                    ${movement.charAt(0).toUpperCase() + movement.slice(1)}
                </label>
            `;
            movementFilters.appendChild(li);
        });
        
        // Features
        data.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label>
                    <input type="checkbox" name="feature" value="${feature}">
                    ${feature.charAt(0).toUpperCase() + feature.slice(1).replace('-', ' ')}
                </label>
            `;
            featureFilters.appendChild(li);
        });
        
        // Update filter counts
        updateFilterCounts();
    }
    
    // Update filter option counts
    function updateFilterCounts() {
        document.getElementById('categoryCount').textContent = `(${document.querySelectorAll('#categoryFilters input[type="checkbox"]').length})`;
        document.getElementById('brandCount').textContent = `(${document.querySelectorAll('#brandFilters input[type="checkbox"]').length})`;
    }
    
    // Apply all filters
    function applyFilters() {
        // Get current filter values
        currentFilters.categories = Array.from(document.querySelectorAll('#categoryFilters input[type="checkbox"]:checked')).map(cb => cb.value);
        currentFilters.brands = Array.from(document.querySelectorAll('#brandFilters input[type="checkbox"]:checked')).map(cb => cb.value);
        currentFilters.movements = Array.from(document.querySelectorAll('#movementFilters input[type="checkbox"]:checked')).map(cb => cb.value);
        currentFilters.features = Array.from(document.querySelectorAll('#featureFilters input[type="checkbox"]:checked')).map(cb => cb.value);
        currentFilters.minPrice = parseInt(minPriceDisplay.textContent);
        currentFilters.maxPrice = parseInt(maxPriceDisplay.textContent);
        currentFilters.sort = sortSelect.value;
        
        // Filter watches
        filteredWatches = allWatches.filter(watch => {
            return (
                currentFilters.categories.includes(watch.category) &&
                currentFilters.brands.includes(watch.brand) &&
                currentFilters.movements.includes(watch.movement) &&
                (watch.price >= currentFilters.minPrice) &&
                (watch.price <= currentFilters.maxPrice) &&
                (currentFilters.features.length === 0 || currentFilters.features.every(f => watch.features.includes(f)))
            );
        });
        
        // Sort watches
        sortWatches();
        
        // Update UI
        updateProductsHeading();
        renderProducts();
        renderPagination();
    }
    
    // Sort watches based on current sort option
    function sortWatches() {
        switch(currentFilters.sort) {
            case 'price-low':
                filteredWatches.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredWatches.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                // Assuming newer watches have higher IDs
                filteredWatches.sort((a, b) => b.id - a.id);
                break;
            default:
                // Default sorting (featured)
                break;
        }
    }
    
    // Update products heading with filter info
    function updateProductsHeading() {
        let heading = 'All Watches';
        
        if (filteredWatches.length !== allWatches.length) {
            heading = `${filteredWatches.length} Watches Found`;
            
            // Add active filters info
            const activeFilters = [];
            
            if (currentFilters.categories.length < document.querySelectorAll('#categoryFilters input[type="checkbox"]').length) {
                activeFilters.push(`${currentFilters.categories.length} Categories`);
            }
            
            if (currentFilters.brands.length < document.querySelectorAll('#brandFilters input[type="checkbox"]').length) {
                activeFilters.push(`${currentFilters.brands.length} Brands`);
            }
            
            if (currentFilters.minPrice > 0 || currentFilters.maxPrice < 10000) {
                activeFilters.push(`$${currentFilters.minPrice}-$${currentFilters.maxPrice}`);
            }
            
            if (currentFilters.features.length > 0) {
                activeFilters.push(`${currentFilters.features.length} Features`);
            }
            
            if (activeFilters.length > 0) {
                heading += ` (${activeFilters.join(', ')})`;
            }
        }
        
        productsHeading.textContent = heading;
    }
    
    // Render products for current page
    function renderProducts() {
        productsGrid.innerHTML = '';
        
        const startIndex = (currentPage - 1) * watchesPerPage;
        const endIndex = Math.min(startIndex + watchesPerPage, filteredWatches.length);
        const watchesToDisplay = filteredWatches.slice(startIndex, endIndex);
        
        if (watchesToDisplay.length === 0) {
            productsGrid.innerHTML = '<div class="no-results">No watches match your filters. Try adjusting your criteria.</div>';
            return;
        }
        
        watchesToDisplay.forEach(watch => {
            const discount = watch.originalPrice ? Math.round((1 - watch.price / watch.originalPrice) * 100) : 0;
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                ${watch.badge ? `<span class="product-badge">${watch.badge}</span>` : ''}
                <div class="product-image">
                    <img src="${watch.image}" alt="${watch.brand} ${watch.model}">
                    <div class="product-actions">
                        <button class="quick-view" data-id="${watch.id}">Quick View</button>
                        <button class="add-to-wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <p class="product-brand">${watch.brand}</p>
                    <h3 class="product-name">${watch.model}</h3>
                    <div class="product-price">
                        <span class="current-price">$${watch.price.toLocaleString()}</span>
                        ${watch.originalPrice ? `
                            <span class="original-price">$${watch.originalPrice.toLocaleString()}</span>
                            ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
                        ` : ''}
                    </div>
                    <button class="add-to-cart" data-id="${watch.id}">Add to Cart</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
        
        // Add event listeners to new elements
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', showQuickView);
        });
        
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', addToCart);
        });
    }
    
    // Render pagination controls
    function renderPagination() {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(filteredWatches.length / watchesPerPage);
        
        if (pageCount <= 1) return;
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        pagination.appendChild(prevBtn);
        
        // Page buttons
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderProducts();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === pageCount;
        nextBtn.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                renderProducts();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        pagination.appendChild(nextBtn);
    }
    
    // Show quick view modal
    function showQuickView(e) {
        const watchId = parseInt(e.target.dataset.id);
        const watch = allWatches.find(w => w.id === watchId);
        
        if (watch) {
            modalBody.innerHTML = `
                <div class="modal-product">
                    <div class="modal-product-image">
                        <img src="${watch.image}" alt="${watch.brand} ${watch.model}">
                    </div>
                    <div class="modal-product-info">
                        <h2>${watch.brand} ${watch.model}</h2>
                        <div class="modal-product-price">
                            <span class="current-price">$${watch.price.toLocaleString()}</span>
                            ${watch.originalPrice ? `
                                <span class="original-price">$${watch.originalPrice.toLocaleString()}</span>
                            ` : ''}
                        </div>
                        <p class="modal-product-description">${watch.description}</p>
                        <div class="modal-product-details">
                            <div><strong>Category:</strong> ${watch.category.charAt(0).toUpperCase() + watch.category.slice(1)}</div>
                            <div><strong>Movement:</strong> ${watch.movement.charAt(0).toUpperCase() + watch.movement.slice(1)}</div>
                            <div><strong>Features:</strong> ${watch.features.length > 0 ? 
                                watch.features.map(f => f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')).join(', ') : 
                                'None'}</div>
                            <div><strong>Stock:</strong> ${watch.stock} available</div>
                        </div>
                        <button class="btn add-to-cart" data-id="${watch.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            
            // Add event listener to modal's add to cart button
            modalBody.querySelector('.add-to-cart').addEventListener('click', addToCart);
            
            quickViewModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close modal
    function closeQuickView() {
        quickViewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Add to cart function
    function addToCart(e) {
        const watchId = parseInt(e.target.dataset.id);
        const watch = allWatches.find(w => w.id === watchId);
        
        if (watch) {
            // In a real app, you would add to cart logic here
            console.log(`Added ${watch.brand} ${watch.model} to cart`);
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <p>${watch.brand} ${watch.model} added to cart</p>
                <span class="close-notification">&times;</span>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
            
            // Close quick view if open
            closeQuickView();
        }
    }
    
    // Event listeners
    // Filter change events
    document.querySelectorAll('#categoryFilters input, #brandFilters input, #movementFilters input, #featureFilters input').forEach(input => {
        input.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    });
    
    // Price range filter
    priceRange.addEventListener('input', function() {
        maxPriceDisplay.textContent = this.value;
        currentPage = 1;
        applyFilters();
    });
    
    // Sort select
    sortSelect.addEventListener('change', function() {
        currentPage = 1;
        applyFilters();
    });
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', function() {
        // Check all filter checkboxes
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Reset price range
        priceRange.value = 10000;
        maxPriceDisplay.textContent = '10000';
        minPriceDisplay.textContent = '0';
        
        // Reset sort
        sortSelect.value = 'featured';
        
        // Reapply filters
        currentPage = 1;
        applyFilters();
    });
    
    // Modal close
    closeModal.addEventListener('click', closeQuickView);
    window.addEventListener('click', function(e) {
        if (e.target === quickViewModal) {
            closeQuickView();
        }
    });
    
    // Initial render
    updateFilterCounts();
});