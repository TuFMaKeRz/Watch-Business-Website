// main.js - Watch Business Website Script

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.innerHTML = nav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    // Cart Functionality
    const cart = {
        items: [],
        count: 0,
        total: 0,
        init() {
            this.loadCart();
            this.updateCartUI();
        },
        addItem(product) {
            const existingItem = this.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({...product, quantity: 1});
            }
            this.count++;
            this.total += product.price;
            this.saveCart();
            this.updateCartUI();
            this.showNotification(`${product.name} added to cart`);
        },
        removeItem(id) {
            const itemIndex = this.items.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                this.count -= this.items[itemIndex].quantity;
                this.total -= this.items[itemIndex].price * this.items[itemIndex].quantity;
                this.items.splice(itemIndex, 1);
                this.saveCart();
                this.updateCartUI();
            }
        },
        updateQuantity(id, newQuantity) {
            const item = this.items.find(item => item.id === id);
            if (item) {
                this.count += newQuantity - item.quantity;
                this.total += (newQuantity - item.quantity) * item.price;
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartUI();
            }
        },
        saveCart() {
            localStorage.setItem('watchCart', JSON.stringify({
                items: this.items,
                count: this.count,
                total: this.total
            }));
        },
        loadCart() {
            const savedCart = localStorage.getItem('watchCart');
            if (savedCart) {
                const cartData = JSON.parse(savedCart);
                this.items = cartData.items || [];
                this.count = cartData.count || 0;
                this.total = cartData.total || 0;
            }
        },
        updateCartUI() {
            const cartCountEl = document.querySelector('.cart-count');
            if (cartCountEl) cartCountEl.textContent = this.count;
        },
        showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <p>${message}</p>
                <span class="close-notification">&times;</span>
            `;
            
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #1a1a2e;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
                z-index: 1000;
                animation: slideIn 0.5s forwards;
            `;
            
            document.body.appendChild(notification);
            
            const closeBtn = notification.querySelector('.close-notification');
            closeBtn.addEventListener('click', () => {
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => notification.remove(), 500);
            });
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }
    };

    // Initialize cart
    cart.init();

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.dataset.id,
                name: productCard.querySelector('.product-name').textContent,
                price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', '')),
                image: productCard.querySelector('.product-image img').src
            };
            cart.addItem(product);
        });
    });

    // Service Appointment Form
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const serviceData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                watchBrand: formData.get('watch-brand'),
                watchModel: formData.get('watch-model'),
                serviceType: formData.get('service-type'),
                preferredDate: formData.get('preferred-date'),
                notes: formData.get('notes')
            };
            
            // Here you would typically send to a server
            console.log('Service request:', serviceData);
            
            // Show confirmation
            cart.showNotification('Service request submitted successfully!');
            this.reset();
        });
    }

    // Product Filtering
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('change', function() {
            const formData = new FormData(this);
            const filters = {
                category: formData.get('category'),
                priceMin: formData.get('price-min'),
                priceMax: formData.get('price-max'),
                brand: formData.getAll('brand'),
                sort: formData.get('sort')
            };
            
            // In a real app, you would filter products here
            console.log('Filters applied:', filters);
        });
    }

    // Image Zoom for Product Pages
    const productImages = document.querySelectorAll('.product-image-zoom');
    productImages.forEach(image => {
        image.addEventListener('click', function() {
            const zoomed = document.createElement('div');
            zoomed.className = 'image-zoomed';
            zoomed.innerHTML = `
                <div class="zoomed-content">
                    <span class="close-zoom">&times;</span>
                    <img src="${this.src}" alt="Zoomed product image">
                </div>
            `;
            
            zoomed.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                cursor: zoom-out;
            `;
            
            document.body.appendChild(zoomed);
            
            const closeBtn = zoomed.querySelector('.close-zoom');
            closeBtn.addEventListener('click', () => zoomed.remove());
            zoomed.addEventListener('click', () => zoomed.remove());
        });
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .close-notification {
            cursor: pointer;
            margin-left: 15px;
            font-size: 1.2rem;
        }
        .close-zoom {
            position: absolute;
            top: 20px;
            right: 20px;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }
        .zoomed-content img {
            max-width: 90vw;
            max-height: 90vh;
        }
    `;
    document.head.appendChild(style);
});