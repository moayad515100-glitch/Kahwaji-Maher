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

// Retro Event Elements (Lucky Wheel Game)
const retroCompBtn = document.getElementById('retro-computer-btn');
const retroEventModal = document.getElementById('retro-event-modal');
const retroModalOverlay = document.getElementById('retro-modal-overlay');
const closeRetroModal = document.getElementById('close-retro-modal');
const moodHeaderBanner = document.getElementById('mood-header-banner');

const retroGameContainer = document.getElementById('retro-game-container');
const retroLockContainer = document.getElementById('retro-lock-container');
const spinBtn = document.getElementById('spin-btn');
const cooldownTimer = document.getElementById('cooldown-timer');
const retroLockClose = document.getElementById('retro-lock-close');
const wheelElement = document.getElementById('wheel-element');
const gameStatusBox = document.getElementById('game-status-box');

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
    let size, sugar;
    
    if (productId === 'classic') {
        size = document.querySelector('input[name="size-classic"]:checked').value;
        sugar = document.querySelector('select[name="sugar-classic"]').value;
    } else if (productId === 'pro') {
        size = document.querySelector('input[name="size-pro"]:checked').value;
        sugar = document.querySelector('select[name="sugar-pro"]').value;
    } else if (productId === 'superpro') {
        size = document.querySelector('input[name="size-superpro"]:checked').value;
        sugar = document.querySelector('select[name="sugar-superpro"]').value;
    } else if (productId === 'juice') {
        size = document.querySelector('input[name="size-juice"]:checked').value;
        sugar = document.querySelector('select[name="sugar-juice"]').value;
    }

    const options = {
        size,
        sugar
    };

    // Create unique key for item + options combination
    const cartItemId = `${productId}-${size}-${sugar}`;

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
        const optionsText = `حجم ${item.options.size} • سكر: ${item.options.sugar}`;
        
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
        
        row.innerHTML = `
            <span>${item.name} (×${item.quantity})</span>
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
function triggerAlarm(message) {
    playAlarmSound();
    if (message) {
        document.getElementById('alarm-text').textContent = message;
    } else {
        document.getElementById('alarm-text').textContent = "يكفي يا حبيبي خلاص أنت ما بتشرب هذه الكمية كلها";
    }
    limitAlarm.classList.add('show');
    alarmScreenFlash.classList.add('active');
    
    // Add site-wide shake effect
    document.body.classList.add('maher-angry-shake');
    
    setTimeout(() => {
        limitAlarm.classList.remove('show');
        alarmScreenFlash.classList.remove('active');
        document.body.classList.remove('maher-angry-shake');
    }, 2500); // alarm goes away after 2.5 seconds
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

// ==========================================================================
// Retro Computer 'You & Your Luck' Wheel Game
// ==========================================================================

const WEDGE_PRIZES = [
    { type: 'item', id: 'superpro', name: 'قهوجي ماهر سوبر برو (هدية الحدث)', price: 0, image: '5960730354593238427.jpg' },
    { type: 'nothing', name: 'ما أخذت شي' },
    { type: 'item', id: 'pro', name: 'قهوجي ماهر برو (هدية الحدث)', price: 0, image: '5960730354593238428.jpg' },
    { type: 'retry', name: 'فرصة ثانية' },
    { type: 'item', id: 'juice', name: 'عصير اليوم (هدية الحدث)', price: 0, image: '5963013000862043793.jpg' },
    { type: 'nothing', name: 'ما أخذت شي' }
];

let isSpinning = false;
let currentRotation = 0;
let countdownInterval = null;

// Sound effects using Web Audio API
function playTickSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    } catch(e) {}
}

function playSadChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const playTone = (freq, delay, duration) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration + 0.05);
            }, delay);
        };
        playTone(392.00, 0, 0.35);  // G4
        playTone(349.23, 200, 0.35); // F4
        playTone(311.13, 400, 0.5);  // Eb4
    } catch(e) {}
}

// Confetti generator
function triggerConfetti() {
    const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#9f7aea', '#ed64a6'];
    const container = document.body;
    for (let i = 0; i < 80; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const w = Math.random() * 8 + 6;
        p.style.width = `${w}px`;
        p.style.height = `${Math.random() * 4 + 8}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `-20px`;
        
        p.style.animationDelay = `${Math.random() * 0.5}s`;
        p.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`;
        
        container.appendChild(p);
        setTimeout(() => p.remove(), 3000);
    }
}

// Tick tracking synchronization during spinning
let lastWedgeCrossed = -1;
function trackTicks(startTime, duration, startAngle, totalSpinAngle) {
    if (!isSpinning) return;
    const now = Date.now();
    const elapsed = now - startTime;
    if (elapsed >= duration) return;
    
    // Cubic ease-out progress
    const t = elapsed / duration;
    const progress = 1 - Math.pow(1 - t, 3);
    const currentAngle = startAngle + totalSpinAngle * progress;
    
    const wedgeIdx = Math.floor((currentAngle + 30) / 60);
    if (wedgeIdx !== lastWedgeCrossed) {
        playTickSound();
        lastWedgeCrossed = wedgeIdx;
    }
    
    requestAnimationFrame(() => trackTicks(startTime, duration, startAngle, totalSpinAngle));
}

// Check cooldown state and manage views
function checkCooldownState() {
    let nextSpinTime = localStorage.getItem('maher_next_spin_time');
    
    // Auto-clear old cooldowns if they exceed our 2-hour cooldown limit
    if (nextSpinTime && parseInt(nextSpinTime) - Date.now() > 2 * 60 * 60 * 1000) {
        localStorage.removeItem('maher_next_spin_time');
        nextSpinTime = null;
    }
    
    if (nextSpinTime && Date.now() < parseInt(nextSpinTime)) {
        // Cooldown active
        if (retroGameContainer) retroGameContainer.style.display = 'none';
        if (retroLockContainer) retroLockContainer.style.display = 'block';
        startCountdown(parseInt(nextSpinTime));
        return true;
    } else {
        // Cooldown inactive
        if (retroGameContainer) retroGameContainer.style.display = 'block';
        if (retroLockContainer) retroLockContainer.style.display = 'none';
        stopCountdown();
        return false;
    }
}

function startCountdown(endTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    const updateTimer = () => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            checkCooldownState();
            return;
        }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        const pad = (num) => String(num).padStart(2, '0');
        if (cooldownTimer) {
            cooldownTimer.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
    };
    
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Spin trigger
function spinWheel() {
    if (isSpinning) return;
    if (checkCooldownState()) return; // Prevent spinning if locked
    
    isSpinning = true;
    if (spinBtn) spinBtn.disabled = true;
    if (gameStatusBox) gameStatusBox.innerHTML = '<span class="blink-cursor">></span> جاري تدوير عجلة الحظ...';
    
    // Choose random prize (index 0 to 5)
    // Probabilities: Super Pro (0) = 10%, Pro (2) = 15%, Juice (4) = 20%, Retry (3) = 25%, Nothing (1, 5) = 30%
    const rand = Math.random();
    let winnerIndex = 1; // Default Got Nothing
    if (rand < 0.1) {
        winnerIndex = 0; // Super Pro
    } else if (rand < 0.25) {
        winnerIndex = 2; // Pro
    } else if (rand < 0.45) {
        winnerIndex = 4; // Juice
    } else if (rand < 0.7) {
        winnerIndex = 3; // Retry (second chance)
    } else {
        winnerIndex = Math.random() < 0.5 ? 1 : 5; // Got Nothing
    }
    
    const spins = 6;
    const baseAngle = spins * 360;
    const currentRelativeAngle = currentRotation % 360;
    
    let targetDiff = (360 - winnerIndex * 60) - currentRelativeAngle;
    if (targetDiff <= 0) targetDiff += 360;
    
    const randomOffset = (Math.random() - 0.5) * 36; // +/- 18deg offset within wedge
    const spinDegrees = baseAngle + targetDiff + randomOffset;
    
    const startRotation = currentRotation;
    currentRotation += spinDegrees;
    
    // Trigger transition
    if (wheelElement) {
        wheelElement.style.transform = `rotate(${currentRotation}deg)`;
    }
    
    // Play tick sounds
    const startTime = Date.now();
    const duration = 4000; // matches transition in CSS
    lastWedgeCrossed = -1;
    trackTicks(startTime, duration, startRotation, spinDegrees);
    
    // Handle deceleration completion
    setTimeout(() => {
        isSpinning = false;
        if (spinBtn) spinBtn.disabled = false;
        
        const prize = WEDGE_PRIZES[winnerIndex];
        
        if (prize.type === 'item') {
            // Win coffee or juice
            if (gameStatusBox) {
                gameStatusBox.innerHTML = `🎉 مبروك! ربحت: ${prize.name.split(' (')[0]} مجاناً! تم إضافتها لسلتك.`;
            }
            // Add item to cart automatically at 0 SAR
            cart.push({
                id: `${prize.id}-gift-${Date.now()}`, // unique gift id
                productId: prize.id,
                name: prize.name,
                price: 0,
                image: prize.image,
                options: { size: 'كبير', sugar: 'سكر وسط' },
                quantity: 1
            });
            updateCartUI();
            playSuccessSound();
            triggerConfetti();
            
            // Lock wheel for 2 hours
            localStorage.setItem('maher_next_spin_time', String(Date.now() + 2 * 60 * 60 * 1000));
            setTimeout(checkCooldownState, 2000);
            
        } else if (prize.type === 'nothing') {
            // Loss
            if (gameStatusBox) {
                gameStatusBox.innerHTML = `😢 حظاً أوفر! لم تربح شيئاً هذه المرة. جرب مجدداً لاحقاً!`;
            }
            playSadChime();
            
            // Lock wheel for 2 hours
            localStorage.setItem('maher_next_spin_time', String(Date.now() + 2 * 60 * 60 * 1000));
            setTimeout(checkCooldownState, 2000);
            
        } else {
            // Retry / Second chance
            if (gameStatusBox) {
                gameStatusBox.innerHTML = `🔄 فرصة ثانية! لم يذهب حظك هباءً، دوّر العجلة مجدداً مجاناً!`;
            }
            playAlarmSound(); // neutral alert sound
        }
    }, duration + 200);
}

// Setup Event listeners
if (retroCompBtn) {
    retroCompBtn.addEventListener('click', () => {
        checkCooldownState();
        if (retroEventModal) retroEventModal.classList.add('open');
        if (retroModalOverlay) retroModalOverlay.classList.add('open');
    });
}

function closeRetroModalFn() {
    if (retroEventModal) retroEventModal.classList.remove('open');
    if (retroModalOverlay) retroModalOverlay.classList.remove('open');
    stopCountdown();
}

if (closeRetroModal) closeRetroModal.addEventListener('click', closeRetroModalFn);
if (retroModalOverlay) retroModalOverlay.addEventListener('click', closeRetroModalFn);
if (retroLockClose) retroLockClose.addEventListener('click', closeRetroModalFn);

if (spinBtn) {
    spinBtn.addEventListener('click', spinWheel);
}

// Initial Setup
if (moodHeaderBanner) {
    moodHeaderBanner.className = 'mood-header-banner';
    moodHeaderBanner.innerHTML = '<i class="fa-solid fa-circle-check"></i> بشرى سارة: قهوجي ماهر قبل الاعتذار ورجّع لكم الموقع طبيعي! جرب حظك الآن عبر الكمبيوتر القديم 🎰';
}

// Make sure no leftover disabled styles exist on cards
document.querySelectorAll('.product-card').forEach(card => {
    card.classList.remove('disabled-mood');
    const btn = card.querySelector('.btn-add-cart');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> إضافة للسلة';
});


