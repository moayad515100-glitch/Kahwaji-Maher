// Cart State
let cart = [];

// DOM Elements
const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const btnCheckout = document.getElementById('btn-checkout');

const checkoutModal = document.getElementById('checkout-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const checkoutForm = document.getElementById('checkout-form');
const modalSummaryItems = document.getElementById('modal-summary-items');
const modalSummaryTotal = document.getElementById('modal-summary-total');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

const limitAlarm = document.getElementById('limit-alarm');
const alarmScreenFlash = document.getElementById('alarm-screen-flash');

// Target WhatsApp Number
const whatsappNumber = '966554537001';

// Toggle Cart Drawer
cartToggle.addEventListener('click', openCartDrawer);
closeCart.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

function openCartDrawer() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

// Toggle Checkout Modal
btnCheckout.addEventListener('click', openCheckoutModal);
closeModal.addEventListener('click', closeCheckoutModal);
modalOverlay.addEventListener('click', closeCheckoutModal);

function openCheckoutModal() {
    closeCartDrawer();
    populateModalSummary();
    checkoutModal.classList.add('open');
    modalOverlay.classList.add('open');
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('open');
    modalOverlay.classList.remove('open');
}

// Show Toast Notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Add Item to Cart
function addToCart(productId, name, price, image) {
    // Get custom options based on product ID
    let size, sugar, comment = '';
    
    if (productId === 'classic') {
        size = document.querySelector('input[name="size-classic"]:checked').value;
        sugar = document.querySelector('select[name="sugar-classic"]').value;
        const commentEl = document.querySelector('input[name="comment-classic"]');
        comment = commentEl ? commentEl.value.trim() : '';
    } else if (productId === 'pro') {
        size = document.querySelector('input[name="size-pro"]:checked').value;
        sugar = document.querySelector('select[name="sugar-pro"]').value;
        const commentEl = document.querySelector('input[name="comment-pro"]');
        comment = commentEl ? commentEl.value.trim() : '';
    } else if (productId === 'superpro') {
        size = document.querySelector('input[name="size-superpro"]:checked').value;
        sugar = document.querySelector('select[name="sugar-superpro"]').value;
        const commentEl = document.querySelector('input[name="comment-superpro"]');
        comment = commentEl ? commentEl.value.trim() : '';
    } else if (productId === 'juice') {
        size = document.querySelector('input[name="size-juice"]:checked').value;
        sugar = document.querySelector('select[name="sugar-juice"]').value;
        const commentEl = document.querySelector('input[name="comment-juice"]');
        comment = commentEl ? commentEl.value.trim() : '';
    }

    const options = {
        size,
        sugar,
        comment
    };

    // Create unique key for item + options combination
    const cartItemId = `${productId}-${size}-${sugar}-${comment}`;

    // Check total limit (max 5 cups)
    const currentTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (currentTotalCount >= 5) {
        triggerAlarm();
        return;
    }

    // Check if item already exists in cart with EXACT options
    const existingItemIndex = cart.findIndex(item => item.id === cartItemId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            productId,
            name,
            price,
            image,
            options,
            quantity: 1
        });
    }

    updateCartUI();
    
    // Trigger premium fly-to-cart animation
    const cardElement = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (cardElement) {
        animateFlyToCart(cardElement, image, productId);
    }
    
    // Clear comment input after adding
    if (productId === 'classic') {
        document.querySelector('input[name="comment-classic"]').value = '';
    } else if (productId === 'pro') {
        document.querySelector('input[name="comment-pro"]').value = '';
    } else if (productId === 'superpro') {
        document.querySelector('input[name="comment-superpro"]').value = '';
    } else if (productId === 'juice') {
        document.querySelector('input[name="comment-juice"]').value = '';
    }

    showToast(`تمت إضافة ${name} إلى السلة!`);
    
    // Auto open cart drawer to show customer it was added
    setTimeout(openCartDrawer, 900); // slightly longer to let the flying animation finish first!
}

// Update Cart UI
function updateCartUI() {
    // Update Badge Count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;

    // Clear Container
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-mug-hot"></i>
                <p>سلتك فارغة حالياً. أضف بعض القهوة لمزاجك!</p>
            </div>
        `;
        cartTotal.textContent = '0 ر.س';
        btnCheckout.disabled = true;
        return;
    }

    btnCheckout.disabled = false;

    // Render Items
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        // Construct readable options text
        let optionsText = `حجم ${item.options.size} • سكر: ${item.options.sugar}`;
        if (item.options.comment) {
            optionsText += `<br><span style="color: var(--primary-color); font-size: 0.78rem; display: inline-block; margin-top: 3px;"><i class="fa-regular fa-comment"></i> ملاحظة: ${item.options.comment}</span>`;
        }
        
        const priceDisplay = item.price === 0 ? 'مجاناً' : `${item.price * item.quantity} ر.س`;

        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <button class="remove-item" onclick="removeItem('${item.id}')" title="إزالة"><i class="fa-solid fa-trash-can"></i></button>
            <div class="cart-item-info">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${optionsText}</div>
                </div>
                <div class="cart-item-bottom">
                    <span class="cart-item-price">${priceDisplay}</span>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(itemElement);
    });

    // Calculate & Display Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total} ر.س`;
}

// Change Quantity of Item
function changeQuantity(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        if (change > 0) {
            const currentTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (currentTotalCount >= 5) {
                triggerAlarm();
                return;
            }
        }
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }
}

// Remove Item from Cart
function removeItem(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
    showToast('تمت إزالة الصنف من السلة');
}

// Populate Modal Summary
function populateModalSummary() {
    modalSummaryItems.innerHTML = '';
    
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'summary-item-row';
        const itemPriceTotal = item.price === 0 ? 'مجاناً' : `${item.price * item.quantity} ر.س`;
        
        let commentText = '';
        if (item.options.comment) {
            commentText = `<div style="font-size: 0.8rem; color: var(--primary-color); margin-top: 2px;">💬 ملاحظة: ${item.options.comment}</div>`;
        }
        
        row.innerHTML = `
            <div>
                <span>${item.name} (×${item.quantity})</span>
                ${commentText}
            </div>
            <span>${itemPriceTotal}</span>
        `;
        modalSummaryItems.appendChild(row);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    modalSummaryTotal.textContent = `${total} ر.س`;
}

// Submit Order (Send to WhatsApp)
function submitOrder(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const notes = document.getElementById('customer-notes').value.trim();

    if (!name || !address) {
        showToast('يرجى ملء جميع الحقول المطلوبة!');
        return;
    }

    // Build the WhatsApp message
    let message = `☕ *فاتورة طلب جديدة - قهوجي ماهر* ☕\n\n`;
    message += `👤 *بيانات العميل:*\n`;
    message += `• *الاسم:* ${name}\n`;
    if (phone) {
        message += `• *الجوال:* ${phone}\n`;
    }
    message += `• *العنوان:* ${address}\n`;
    if (notes) {
        message += `• *ملاحظات:* ${notes}\n`;
    }
    message += `\n-----------------------------------\n\n`;
    message += `📋 *الطلبات:*\n\n`;

    cart.forEach((item, index) => {
        message += `*${index + 1}. ${item.name}* (الكمية: ${item.quantity})\n`;
        message += `  🏷️ *الحجم:* ${item.options.size}\n`;
        message += `  🍬 *السكر:* ${item.options.sugar}\n`;
        if (item.options.comment) {
            message += `  💬 *ملاحظة:* ${item.options.comment}\n`;
        }
        const itemTotal = item.price === 0 ? 'مجاناً' : `${item.price * item.quantity} ر.س`;
        message += `  💵 *السعر:* ${itemTotal}\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `-----------------------------------\n`;
    message += `💰 *المجموع الكلي:* ${total} ريال سعودي\n\n`;
    message += `💬 شكرًا لاختيارك قهوجي ماهر! نتمنى لك وقتًا ممتعًا.`;

    // URL Encode Message
    const encodedMessage = encodeURIComponent(message);
    
    // Construct WhatsApp Link
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Play success chime
    playSuccessSound();

    // Open WhatsApp
    window.open(waLink, '_blank');
    
    // Clear Cart and Close Modal
    cart = [];
    updateCartUI();
    closeCheckoutModal();
    checkoutForm.reset();
    showToast('تم إرسال الطلب بنجاح! شكراً لك.');
}

// Play Custom Alarm Audio (Double Beep Siren via Web Audio API)
function playAlarmSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const playBeep = (delay) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(1300, ctx.currentTime + 0.12);
                osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.25);
                
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }, delay);
        };
        
        playBeep(0);
        playBeep(280);
    } catch (e) {
        console.error("Audio Context block", e);
    }
}

// Trigger Alarm Warning Modal
function triggerAlarm() {
    playAlarmSound();
    limitAlarm.classList.add('show');
    alarmScreenFlash.classList.add('active');
    setTimeout(() => {
        limitAlarm.classList.remove('show');
        alarmScreenFlash.classList.remove('active');
    }, 2000); // alarm goes away after 2 seconds
}

// Submit Suggestion (Send to WhatsApp)
function submitSuggestion(event) {
    event.preventDefault();
    const suggestionText = document.getElementById('suggestion-text').value.trim();
    if (!suggestionText) return;
    
    let message = `💡 *اقتراح جديد من عميل قهوجي ماهر* 💡\n\n`;
    message += `${suggestionText}\n\n`;
    message += `-----------------------------------`;
    
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(waLink, '_blank');
    document.getElementById('suggestion-form').reset();
    showToast('تم إرسال اقتراحك بنجاح! شكراً لك.');
}

// Play Success Chime Audio (Ascending Sweet Arpeggio via Web Audio API)
function playSuccessSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const playTone = (freq, delay, duration) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'triangle'; // Sweet flute/music-box sound
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start();
                osc.stop(ctx.currentTime + duration + 0.05);
            }, delay);
        };
        
        // Ascending major arpeggio chime (C major)
        playTone(523.25, 0, 0.4);   // C5
        playTone(659.25, 80, 0.4);  // E5
        playTone(783.99, 160, 0.4); // G5
        playTone(1046.50, 240, 0.6); // C6
    } catch (e) {
        console.error("Audio Context success sound blocked", e);
    }
}

// Premium Fly-to-Cart Animation
function animateFlyToCart(cardElement, imageSrc, productId) {
    let trailInterval;
    
    // 1. If it is Juice of the Day, flash the card and trigger popping bubble particles!
    if (productId === 'juice') {
        cardElement.classList.add('orange-glow-flash');
        setTimeout(() => cardElement.classList.remove('orange-glow-flash'), 1000);
        
        // Find add button position to spawn particles from
        const addBtn = cardElement.querySelector('.btn-add-cart');
        if (addBtn) {
            const btnRect = addBtn.getBoundingClientRect();
            spawnJuiceParticles(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);
        }
    }
    
    // 2. Perform flying clone animation
    const cartToggleBtn = document.getElementById('cart-toggle');
    if (!cartToggleBtn) return;
    
    const rect = cardElement.getBoundingClientRect();
    const cartRect = cartToggleBtn.getBoundingClientRect();
    
    // Create image clone
    const clone = document.createElement('img');
    clone.src = imageSrc;
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top + rect.height/2 - 40}px`;
    clone.style.left = `${rect.left + rect.width/2 - 40}px`;
    clone.style.width = '80px';
    clone.style.height = '80px';
    clone.style.borderRadius = '50%';
    clone.style.objectFit = 'cover';
    clone.style.zIndex = '9999';
    clone.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    clone.style.pointerEvents = 'none';
    
    // Color trail based on product ID (Orange glow for juice, gold for coffee)
    if (productId === 'juice') {
        clone.style.boxShadow = '0 0 20px rgba(255, 140, 0, 0.8)';
        clone.style.border = '2px solid #ff8c00';
        
        // Trail particles interval
        trailInterval = setInterval(() => {
            const cloneRect = clone.getBoundingClientRect();
            const trail = document.createElement('div');
            trail.className = 'juice-particle';
            const size = Math.random() * 5 + 4; // 4px to 9px
            trail.style.width = `${size}px`;
            trail.style.height = `${size}px`;
            trail.style.backgroundColor = '#ffa500';
            trail.style.left = `${cloneRect.left + cloneRect.width/2}px`;
            trail.style.top = `${cloneRect.top + cloneRect.height/2}px`;
            
            // disperse slightly
            const dX = (Math.random() - 0.5) * 15;
            const dY = (Math.random() - 0.5) * 15;
            trail.style.setProperty('--x', `${dX}px`);
            trail.style.setProperty('--y', `${dY}px`);
            
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 600);
        }, 35);
    } else {
        clone.style.boxShadow = '0 0 20px rgba(197, 168, 128, 0.8)';
        clone.style.border = '2px solid #c5a880';
    }
    
    document.body.appendChild(clone);
    
    // Trigger transition
    setTimeout(() => {
        clone.style.top = `${cartRect.top + cartRect.height/2 - 10}px`;
        clone.style.left = `${cartRect.left + cartRect.width/2 - 10}px`;
        clone.style.width = '20px';
        clone.style.height = '20px';
        clone.style.opacity = '0.2';
    }, 50);
    
    // Cleanup clone and wiggle cart icon
    setTimeout(() => {
        clone.remove();
        if (trailInterval) clearInterval(trailInterval);
        
        cartToggleBtn.classList.add('wiggle');
        setTimeout(() => cartToggleBtn.classList.remove('wiggle'), 500);
    }, 850);
}

// Spawn Popping Citrus/Juice Bubble Particles
function spawnJuiceParticles(startX, startY) {
    const particleCount = 15;
    const colors = ['#ff8c00', '#ffa500', '#ffd700', '#ff4500', '#ffffff'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'juice-particle';
        
        const size = Math.random() * 8 + 6; // 6px to 14px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 110 + 40; // 40px to 150px
        const destX = Math.cos(angle) * distance;
        const destY = Math.sin(angle) * distance + 30; // slightly downwards for gravity feel
        
        particle.style.setProperty('--x', `${destX}px`);
        particle.style.setProperty('--y', `${destY}px`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

// ==========================================
// CUSTOMER REVIEWS/COMMENTS SYSTEM
// ==========================================

const defaultReviews = [
    { author: "أبو فهد العتيبي", rating: 5, text: "ما شاء الله، قهوة برو تعدل المزاج وتستحق كل ريال. التوصيل سريع والتعامل راقي جداً.", date: "منذ يومين" },
    { author: "أميرة خالد", rating: 5, text: "عصير اليوم لذيذ ومنعش بشكل لا يوصف! والتوصيل لعند الباب، تجربة ممتازة وسأكررها بالتأكيد.", date: "منذ 4 أيام" },
    { author: "ماجد الدوسري", rating: 4, text: "القهوة الماهرة العادية ممتازة ومجانية! شيء رائع، وجربت البرو أيضاً ونالت إعجابي.", date: "منذ أسبوع" }
];

function initReviews() {
    if (!localStorage.getItem('maher_reviews')) {
        localStorage.setItem('maher_reviews', JSON.stringify(defaultReviews));
    }
    renderReviews();
    setupStarsInput();
}

function renderReviews() {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    const reviews = JSON.parse(localStorage.getItem('maher_reviews')) || [];
    
    reviewsList.innerHTML = '';
    
    // Render in reverse order (newest first)
    reviews.slice().reverse().forEach(review => {
        const item = document.createElement('div');
        item.className = 'review-item';
        
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHTML += '<i class="fa-solid fa-star"></i> ';
            } else {
                starsHTML += '<i class="fa-regular fa-star"></i> ';
            }
        }
        
        item.innerHTML = `
            <div class="review-header">
                <span class="review-author">${review.author}</span>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <div class="review-stars">${starsHTML}</div>
                    <span class="review-date">${review.date}</span>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
        `;
        reviewsList.appendChild(item);
    });
}

function setupStarsInput() {
    const stars = document.querySelectorAll('.star-input');
    const ratingInput = document.getElementById('review-rating');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            ratingInput.value = val;
            
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= parseInt(val)) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Default to 5 stars active
    stars.forEach(s => s.classList.add('active'));
}

function submitReview(event) {
    event.preventDefault();
    const author = document.getElementById('review-author').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const text = document.getElementById('review-text').value.trim();
    
    if (!author || !text) return;
    
    const newReview = {
        author,
        rating,
        text,
        date: "الآن"
    };
    
    const reviews = JSON.parse(localStorage.getItem('maher_reviews')) || [];
    reviews.push(newReview);
    localStorage.setItem('maher_reviews', JSON.stringify(reviews));
    
    renderReviews();
    document.getElementById('review-form').reset();
    
    // Reset stars active classes
    const stars = document.querySelectorAll('.star-input');
    stars.forEach(s => s.classList.add('active'));
    document.getElementById('review-rating').value = 5;
    
    // Play success sound chime to celebrate
    playSuccessSound();
    showToast('شكراً لك! تم نشر تعليقك بنجاح.');
}

// Initialize on script load
initReviews();
