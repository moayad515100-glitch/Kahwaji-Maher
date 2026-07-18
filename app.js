// ==========================================================
// CONFIGURATION: ACTIVE EVENT CONFIG
// Set the active event today! 
// Options: 
//   'none'           : Normal website (no active events)
//   'anger'          : Kahwaji Maher's Anger event (blocks ordering, shakes site, beeps)
//   'luck_wheel'     : "You & Your Luck" Spinning Wheel mini-game (win free drinks, 2h cooldown)
//   'cup_strike'     : "Cups Strike" event (buttons flee, bribe game inside computer)
//   'lie_detector'   : "Coffee Lie Detector" test (pass or get green tea!)
//   'maher_vacation' : "Maher's Vacation" stock-market event (prices fluctuate, charts)
//   'grind_challenge': "Coffee Grind Speed" clicker game (click fast to win)
//   'neon_magic'     : "Magic Glowing Coffee" neon theme (glow, mouse trails)
// ==========================================================
const ACTIVE_EVENT = 'matcha'; 

// Cart State
let cart = [];
try {
    const savedCart = localStorage.getItem('maher_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    cart = [];
}

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

// Retro Event Elements
const retroCompBtn = document.getElementById('retro-computer-btn');
const retroEventModal = document.getElementById('retro-event-modal');
const retroModalOverlay = document.getElementById('retro-modal-overlay');
const closeRetroModal = document.getElementById('close-retro-modal');
const moodHeaderBanner = document.getElementById('mood-header-banner');

const retroEventDynamicBody = document.getElementById('retro-event-dynamic-body');

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
    if (ACTIVE_EVENT === 'anger') {
        closeCartDrawer();
        triggerAlarm("عذراً! لا يمكنك إتمام الطلب الآن لأن قهوجي ماهر غاضب! 😡");
        return;
    }
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
    if (ACTIVE_EVENT === 'anger') {
        triggerAlarm("عذراً! لا يمكنك الطلب الآن لأن قهوجي ماهر غاضب! 😡");
        return;
    }

    if (ACTIVE_EVENT === 'thief' && Math.random() < 0.25) {
        triggerAlarm("🚨 انتبه! سارق القهوة 🥷 تسلل وسرق المشروب من يدك! اذهب لمطاردته بالسيارة في الكمبيوتر القديم واستعِدْ كوبك!");
        return;
    }

    // Reset fleeing buttons (for cup_strike escape)
    const btn = document.querySelector(`.product-card[data-id="${productId}"] .btn-add-cart`);
    if (btn) {
        btn.style.transform = '';
        if (cupEscapeCounts[productId]) {
            cupEscapeCounts[productId] = 0;
        }
    }

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
    } else if (productId === 'matcha') {
        size = document.querySelector('input[name="size-matcha"]:checked').value;
        sugar = document.querySelector('select[name="sugar-matcha"]').value;
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

    let finalPrice = price;
    let finalName = name;
    if (ACTIVE_EVENT === 'maher_vacation') {
        finalPrice = fluctuatedPrices[productId] !== undefined ? fluctuatedPrices[productId] : price;
        finalName = `${name} (سعر البورصة)`;
    } else if (ACTIVE_EVENT === 'matcha' && productId === 'superpro') {
        finalPrice = 2;
        finalName = `${name} (خصم الماتشا)`;
    }

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            productId,
            name: finalName,
            price: finalPrice,
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

    if (ACTIVE_EVENT === 'thief' && cart.length > 0) {
        const thiefWarning = document.createElement('div');
        thiefWarning.className = 'thief-warning-banner';
        thiefWarning.style.cssText = 'background: #ffebeb; border: 1px dashed #d9534f; color: #d9534f; padding: 10px; border-radius: 4px; margin-bottom: 12px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-arabic); font-weight: bold; direction: rtl;';
        thiefWarning.innerHTML = `
            <span>🥷 سارق القهوة يتربص بسلتك!</span>
            <button class="win95-btn" onclick="document.getElementById('retro-computer-btn').click();" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 2px; font-weight: bold;">طارده بالسيارة 🚓</button>
        `;
        cartItemsContainer.appendChild(thiefWarning);
    }

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
    
    // Persist cart to localStorage
    localStorage.setItem('maher_cart', JSON.stringify(cart));
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
    
    if (ACTIVE_EVENT === 'neon_magic') {
        message += `🔮 *تم الطلب بخلطة ماهر السحرية المضيئة المروقة!* 🔮\n\n`;
    }
    
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

// ==========================================================
// Events Engine Logic
// ==========================================================

// Global state variables for games
let lastWedgeCrossed = -1;
let isSpinning = false;
let currentRotation = 0;
let countdownInterval = null;
let priceInterval = null;

// Cup Strike state
let cupEscapeCounts = {};
let bribeClicks = 0;

// Lie Detector state
let currentDetectorQuestion = 0;
let detectorScore = 0;
const DETECTOR_QUESTIONS = [
    {
        q: "هل شربت الشاي بالسر اليوم؟ 🤫",
        options: [
            { text: "أبداً، الشاي خيانة عظمى لقهوتنا! 🚫", correct: true },
            { text: "كوب صغير فقط لا يضر... 🍵", correct: false }
        ]
    },
    {
        q: "أيهما تفضل أكثر؟ 😍",
        options: [
            { text: "بن ماهر الأصيل والروقان التام! ☕", correct: true },
            { text: "الكرك الهندي والزنجبيل! 🫖", correct: false }
        ]
    },
    {
        q: "ما هو شعورك عند تذوق قهوة ماهر؟ 🚀",
        options: [
            { text: "أحلق في سماء الروقان والأصالة! ✨", correct: true },
            { text: "مجرد كافيين عادي للمذاكرة... 🥱", correct: false }
        ]
    }
];

// Maher's Vacation stock-market prices state
let priceFluctuationInterval = null;
let fluctuatedPrices = {
    classic: 2,
    pro: 4,
    superpro: 5,
    juice: 4
};

// Grind Challenge state
let grindClicks = 0;
let grindTimeLeft = 7;
let grindTimerInterval = null;
let grindGameActive = false;

// Thief Car Chase state
let chaseInterval = null;
let chaseActive = false;
let playerCarX = 50; // percentage position (left: 15% to 85%)
let chaseScore = 0;
let chaseLives = 3;
let chaseSpawnTimer = 0;
let chaseObjects = []; // array of { type: 'thief'|'obstacle', x: number, y: number, el: HTMLElement }


// Cooldown period (2 hours in milliseconds)
const COOLDOWN_DURATION = 2 * 60 * 60 * 1000; 

const COOLDOWN_GAMES = ['luck_wheel', 'cup_strike', 'lie_detector', 'grind_challenge', 'thief'];

// Check if locked and render appropriate view in computer dynamic modal body
function checkCooldownState() {
    if (!retroEventDynamicBody) return false;
    
    if (!COOLDOWN_GAMES.includes(ACTIVE_EVENT)) {
        renderActiveEventTemplate();
        return false;
    }
    
    const cooldownKey = `maher_cooldown_${ACTIVE_EVENT}`;
    const nextSpinTime = localStorage.getItem(cooldownKey);
    
    // Auto-clear old 5-hour cooldowns if they exceed our 2-hour limit
    if (nextSpinTime && parseInt(nextSpinTime) - Date.now() > COOLDOWN_DURATION) {
        localStorage.removeItem(cooldownKey);
    }
    
    if (nextSpinTime && Date.now() < parseInt(nextSpinTime)) {
        // Locked state
        renderLockScreen(parseInt(nextSpinTime));
        return true;
    } else {
        // Unlocked state -> Render active game template
        renderActiveEventTemplate();
        return false;
    }
}

// Render the Win95 style lock screen
function renderLockScreen(endTime) {
    retroEventDynamicBody.innerHTML = `
        <div class="win95-body" id="retro-lock-container">
            <div class="bsod-screen">
                <div class="bsod-title">*** خطأ في النظام: الوصول مقيد ***</div>
                <p class="bsod-text">عذراً! لقد قمت بتجربة حظك مؤخراً. تنص قوانين المعلم ماهر على إمكانية اللعب مرة واحدة كل ساعتين لحماية إمدادات البن الفاخر.</p>
                
                <div class="countdown-display">
                    <div class="countdown-label">الوقت المتبقي للمحاولة القادمة:</div>
                    <div class="countdown-timer" id="cooldown-timer">02:00:00</div>
                </div>
                
                <div class="bsod-footer">
                    الرجاء المحاولة لاحقاً... <span class="blink-cursor">_</span>
                </div>
            </div>
            <div class="win95-actions" style="margin-top: 15px;">
                <button class="win95-btn" id="retro-lock-close">إغلاق</button>
            </div>
        </div>
    `;
    
    // Re-bind close button
    const closeBtn = document.getElementById('retro-lock-close');
    if (closeBtn) closeBtn.addEventListener('click', closeRetroModalFn);
    
    startCountdown(endTime);
}

function startCountdown(endTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    const timerEl = document.getElementById('cooldown-timer');
    
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
        if (timerEl) {
            timerEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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

// Render dynamic content inside computer modal based on ACTIVE_EVENT
function renderActiveEventTemplate() {
    stopCountdown();
    
    if (ACTIVE_EVENT === 'none') {
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 20px; text-align: center; font-family: var(--font-arabic);">
                <i class="fa-solid fa-mug-hot" style="font-size: 3rem; color: #c5a880; margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">لا توجد فعاليات نشطة اليوم</h3>
                <p style="font-size: 0.9rem; color: #555;">المعلم ماهر راضٍ تماماً والموقع يعمل بشكل طبيعي وآمن. اطلب قهوتك المفضلة واستمتع بجمال اليوم!</p>
                <button class="win95-btn" id="retro-modal-ok" style="margin-top: 15px;">موافق</button>
            </div>
        `;
        document.getElementById('retro-modal-ok').addEventListener('click', closeRetroModalFn);
        
    } else if (ACTIVE_EVENT === 'anger') {
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                <div style="background: red; color: white; padding: 10px; font-weight: bold; border: 2px solid darkred; text-align: center; margin-bottom: 15px;">
                    🚨 تنبيه أحمر: غضب المعلم ماهر! 🚨
                </div>
                <p style="font-size: 0.9rem; color: #000; line-height: 1.6; text-align: right;">
                    المعلم ماهر غاضب للغاية اليوم لأن في شخص سوى قهوة للبيت غيره! وقرر إيقاف وتعليق جميع الطلبات في المتجر مؤقتاً!
                </p>
                <div style="margin-top: 15px; padding: 10px; background: #fff; border: 2px inset #808080; font-family: monospace; font-size: 0.85rem; color: red;">
                    > حالة النظام: مقيد بالكامل<br>
                    > إيقاف عمليات الدفع والسلة...
                </div>
                <div class="win95-actions" style="margin-top: 15px;">
                    <button class="win95-btn" id="retro-modal-ok">إغلاق</button>
                </div>
            </div>
        `;
        document.getElementById('retro-modal-ok').addEventListener('click', closeRetroModalFn);
        
    } else if (ACTIVE_EVENT === 'luck_wheel') {
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" id="retro-game-container">
                <div class="game-instruction">
                    <i class="fa-solid fa-circle-check" style="color: #28a745;"></i> بشرى سارة: قهوجي ماهر قبل الاعتذار ورجّع لكم الموقع طبيعي! جرب حظك الآن واربح كوباً مجانياً 🎰
                </div>
                
                <div class="wheel-wrapper">
                    <div class="wheel-pointer"></div>
                    <div class="wheel" id="wheel-element">
                        <!-- Slices (6 wedges) -->
                        <div class="slice" style="--angle: 0deg; --bg: #d4af37;"><div class="slice-content">🏆 سوبر برو</div></div>
                        <div class="slice" style="--angle: 60deg; --bg: #2d3748;"><div class="slice-content">💨 ما أخذت شي</div></div>
                        <div class="slice" style="--angle: 120deg; --bg: #c5a880;"><div class="slice-content">🥈 برو</div></div>
                        <div class="slice" style="--angle: 180deg; --bg: #e28743;"><div class="slice-content">🔄 فرصة ثانية</div></div>
                        <div class="slice" style="--angle: 240deg; --bg: #e65c00;"><div class="slice-content">🍹 عصير اليوم</div></div>
                        <div class="slice" style="--angle: 300deg; --bg: #2d3748;"><div class="slice-content">💨 ما أخذت شي</div></div>
                        
                        <div class="wheel-center">
                            <button class="spin-btn-core" id="spin-btn">دوّر!</button>
                        </div>
                    </div>
                </div>

                <div class="game-status-box" id="game-status-box">
                    انقر على الزر بالمنتصف لبدء التدوير!
                </div>
            </div>
        `;
        // Setup spin listeners
        document.getElementById('spin-btn').addEventListener('click', spinWheel);
        
    } else if (ACTIVE_EVENT === 'cup_strike') {
        bribeClicks = 0;
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                <div class="game-instruction">
                    <i class="fa-solid fa-face-frown" style="color: #ed8936;"></i> إضراب الفناجين! الأزرار في الموقع ترفض الاستجابة. قم برشوة الفنجان بالسكر لإقناعه بالعودة للعمل!
                </div>
                
                <div class="bribe-game-box">
                    <div class="bribe-visual" id="bribe-visual-container">
                        <span class="cup-sprite">☕</span>
                    </div>
                    
                    <div style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: bold; margin-bottom: 4px;">
                            <span>نسبة رضا الفنجان بالسكر:</span>
                            <span id="bribe-pct">0%</span>
                        </div>
                        <div class="win95-progress-wrapper">
                            <div class="win95-progress-bar" id="bribe-progress"></div>
                        </div>
                    </div>
                    
                    <button class="win95-btn" id="btn-add-sugar" style="width: 100%;"><i class="fa-solid fa-cube"></i> أضف مكعب سكر</button>
                    
                    <div class="game-status-box" id="bribe-status">
                        تحتاج إلى 15 مكعب سكر لإقناع الفنجان بالعمل وإعطائك هدية!
                    </div>
                </div>
            </div>
        `;
        document.getElementById('btn-add-sugar').addEventListener('click', bribeCup);
        
    } else if (ACTIVE_EVENT === 'lie_detector') {
        currentDetectorQuestion = 0;
        detectorScore = 0;
        renderDetectorQuestion();
        
    } else if (ACTIVE_EVENT === 'maher_vacation') {
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                <div class="game-instruction" style="margin-bottom: 10px;">
                    📊 بورصة المعلم ماهر: ماهر في إجازة حالياً! الأسعار في الموقع تتغير تلقائياً كل 5 ثوانٍ. تتبع الأسهم للشراء بأقل سعر!
                </div>
                
                <div class="stock-graph-retro" style="margin-bottom: 12px;">
                    <div class="stock-graph-line"></div>
                </div>
                
                <div style="font-weight: bold; font-size: 0.85rem; margin-bottom: 5px;">أسعار الأسهم الحالية للمشروبات:</div>
                <div class="stock-grid" id="stock-grid-container">
                    <!-- Loaded dynamically in timer -->
                </div>
                
                <div class="win95-actions" style="margin-top: 15px;">
                    <button class="win95-btn" id="retro-modal-ok" style="width: 100%;">مراقبة البورصة وإغلاق النافذة</button>
                </div>
            </div>
        `;
        updateStockGridHTML();
        document.getElementById('retro-modal-ok').addEventListener('click', closeRetroModalFn);
        
    } else if (ACTIVE_EVENT === 'grind_challenge') {
        grindClicks = 0;
        grindGameActive = false;
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                <div class="game-instruction" id="grind-instruction">
                    ⚡ تحدي الطحن السريع: اطحن حبوب البن لمساعدة المعلم ماهر! تحتاج إلى 60 طحنة خلال 7 ثوانٍ فقط لتفوز بكوب مجاني!
                </div>
                
                <div class="grind-box">
                    <div class="grind-handle-area" id="grind-action-area">
                        <span class="grind-grinder" id="grind-icon">⚙️</span>
                    </div>
                    
                    <div class="grind-stats">
                        <span>العداد: <span class="grind-timer" id="grind-time">07:00</span></span>
                        <span>مرات الطحن: <span id="grind-count">0 / 60</span></span>
                    </div>
                    
                    <div class="win95-progress-wrapper">
                        <div class="win95-progress-bar" id="grind-progress" style="width: 0%;"></div>
                    </div>
                    
                    <button class="win95-btn" id="btn-start-grind" style="width: 100%;">ابدأ التحدي!</button>
                </div>
            </div>
        `;
        document.getElementById('btn-start-grind').addEventListener('click', startGrindChallenge);
        
    } else if (ACTIVE_EVENT === 'neon_magic') {
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 20px; text-align: center; font-family: var(--font-arabic);">
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 3rem; color: #b259ff; margin-bottom: 15px; text-shadow: 0 0 10px #b259ff;"></i>
                <h3 style="margin-bottom: 10px; color: #b259ff;">حدث القهوة السحرية المضيئة!</h3>
                <p style="font-size: 0.9rem; color: #333; line-height: 1.5;">
                    تم تفعيل خلطة ماهر السحرية المضيئة! الموقع مغطى بطاقة النيون الداكنة. اطلب مشروبك المفضل بخلطة السحر وتواصل معنا بالواتساب لتكشف التعويذة!
                </p>
                <button class="win95-btn" id="retro-modal-ok" style="margin-top: 15px; width: 100%;">موافق</button>
            </div>
        `;
        document.getElementById('retro-modal-ok').addEventListener('click', closeRetroModalFn);
    } else if (ACTIVE_EVENT === 'thief') {
        chaseActive = false;
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                <div class="game-instruction" id="chase-instruction" style="margin-bottom: 12px; font-size: 0.85rem; line-height: 1.4; text-align: right;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #d9534f;"></i> اقبض على سارق القهوة! تفلت اللص وسرق أحد الأكواب. طارده بالسيارة 🚓 واصدمه 3 مرات لاستعادتها والربح!
                </div>
                
                <div class="chase-stats-bar">
                    <span>القلوب: <strong id="chase-lives" style="color:#d9534f;">❤️❤️❤️</strong></span>
                    <span>المقبوض عليه: <strong id="chase-score">0 / 3</strong></span>
                </div>
                
                <div class="chase-game-container" id="chase-road">
                    <div class="chase-player-car" id="player-car" style="left: 50%;">🚓</div>
                </div>
                
                <div class="chase-mobile-controls" id="chase-ctrls">
                    <button class="chase-ctrl-btn" id="btn-chase-left" style="user-select:none;">◀</button>
                    <button class="chase-ctrl-btn" id="btn-chase-right" style="user-select:none;">▶</button>
                </div>
                
                <button class="win95-btn" id="btn-start-chase" style="width: 100%; margin-top: 10px;">ابدأ المطاردة بالسيارة! 🚓</button>
            </div>
        `;
        document.getElementById('btn-start-chase').addEventListener('click', startCarChaseGame);
    } else if (ACTIVE_EVENT === 'matcha') {
        const redeemed = localStorage.getItem('maher_matcha_redeemed') === 'true';
        retroEventDynamicBody.innerHTML = `
            <div class="win95-body" style="padding: 20px; text-align: center; font-family: var(--font-arabic); background: #f0fff0;">
                <i class="fa-solid fa-leaf" style="font-size: 3rem; color: #2e7d32; margin-bottom: 15px; text-shadow: 0 0 10px rgba(46,125,50,0.3);"></i>
                <h3 style="margin-bottom: 10px; color: #2e7d32;">أسبوع الماتشا الماهرة الرائعة!</h3>
                <p style="font-size: 0.9rem; color: #333; line-height: 1.5; text-align: right;">
                    مرحباً بكم في نظام المعلم ماهر الخاص. احتفالاً بتدشين <strong>ماتشا ماهرة 🍵</strong> بـ 6 ريال فقط، قمنا بتفعيل خصم 60% على <strong>قهوجي ماهر سوبر برو</strong> لتصبح بـ 2 ريال فقط بدلاً من 5 ريال!
                </p>
                
                <div style="background: #fff; border: 2px inset #808080; padding: 12px; margin-top: 10px; text-align: center;">
                    <div style="font-size: 0.85rem; font-weight: bold; color: #2e7d32; margin-bottom: 8px;">🎁 هدية أسبوع الماتشا الخاصة بك:</div>
                    <button class="win95-btn" id="btn-claim-free-matcha" style="width: 100%; font-weight: bold; background: #2e7d32; color: #fff; border-color: #2e7d32; cursor: pointer; padding: 6px 12px;" ${redeemed ? 'disabled' : ''}>
                        ${redeemed ? 'تم استلام الكوب المجاني بنجاح! ✔️' : 'ماتشا ماهرة مجاناً (كوب واحد فقط!) 🍵'}
                    </button>
                </div>
                
                <button class="win95-btn" id="retro-modal-ok" style="margin-top: 15px; width: 100%;">إغلاق</button>
            </div>
        `;
        document.getElementById('retro-modal-ok').addEventListener('click', closeRetroModalFn);
        if (!redeemed) {
            document.getElementById('btn-claim-free-matcha').addEventListener('click', claimFreeMatchaDrink);
        }
    }
}

function claimFreeMatchaDrink() {
    const redeemed = localStorage.getItem('maher_matcha_redeemed') === 'true';
    if (redeemed) return;
    
    // Add item to cart
    cart.push({
        id: `matcha-free-${Date.now()}`,
        productId: 'matcha',
        name: 'ماتشا ماهرة (كوب مجاني 🎁)',
        price: 0,
        image: 'matcha.jpg',
        options: { size: 'وسط', sugar: 'سكر وسط' },
        quantity: 1
    });
    updateCartUI();
    playSuccessSound();
    triggerConfetti();
    
    // Mark as redeemed
    localStorage.setItem('maher_matcha_redeemed', 'true');
    
    // Update button in UI
    const claimBtn = document.getElementById('btn-claim-free-matcha');
    if (claimBtn) {
        claimBtn.disabled = true;
        claimBtn.textContent = 'تم استلام الكوب المجاني بنجاح! ✔️';
        claimBtn.style.background = '#6c757d';
        claimBtn.style.borderColor = '#6c757d';
        claimBtn.style.color = '#fff';
        claimBtn.style.cursor = 'not-allowed';
    }
}

// ----------------------------------------------------------
// 1. Lucky Wheel event engine
// ----------------------------------------------------------
const WEDGE_PRIZES = [
    { name: 'قهوجي ماهر سوبر برو (مجاناً)', id: 'superpro', image: '5960730354593238427.jpg', type: 'item' },
    { name: 'حظاً أوفر', id: 'nothing', type: 'nothing' },
    { name: 'قهوجي ماهر برو (مجاناً)', id: 'pro', image: 'pro_new.jpg', type: 'item' },
    { name: 'فرصة ثانية', id: 'retry', type: 'retry' },
    { name: 'عصير اليوم (مجاناً)', id: 'juice', image: '5963013000862043793.jpg', type: 'item' },
    { name: 'حظاً أوفر', id: 'nothing', type: 'nothing' }
];

function spinWheel() {
    if (isSpinning) return;
    const spinBtnEl = document.getElementById('spin-btn');
    const wheelEl = document.getElementById('wheel-element');
    const statusBoxEl = document.getElementById('game-status-box');
    
    isSpinning = true;
    if (spinBtnEl) spinBtnEl.disabled = true;
    if (statusBoxEl) statusBoxEl.innerHTML = '<span class="blink-cursor">></span> جاري تدوير عجلة الحظ...';
    
    const rand = Math.random();
    let winnerIndex = 1;
    if (rand < 0.1) winnerIndex = 0;
    else if (rand < 0.25) winnerIndex = 2;
    else if (rand < 0.45) winnerIndex = 4;
    else if (rand < 0.7) winnerIndex = 3;
    else winnerIndex = Math.random() < 0.5 ? 1 : 5;
    
    const spins = 6;
    const baseAngle = spins * 360;
    const currentRelativeAngle = currentRotation % 360;
    let targetDiff = (360 - winnerIndex * 60) - currentRelativeAngle;
    if (targetDiff <= 0) targetDiff += 360;
    
    const randomOffset = (Math.random() - 0.5) * 36;
    const spinDegrees = baseAngle + targetDiff + randomOffset;
    
    const startRotation = currentRotation;
    currentRotation += spinDegrees;
    
    if (wheelEl) wheelEl.style.transform = `rotate(${currentRotation}deg)`;
    
    const startTime = Date.now();
    const duration = 4000;
    lastWedgeCrossed = -1;
    
    const trackSpin = () => {
        if (!isSpinning) return;
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) return;
        
        const t = elapsed / duration;
        const progress = 1 - Math.pow(1 - t, 3);
        const currentAngle = startRotation + spinDegrees * progress;
        
        const wedgeIdx = Math.floor((currentAngle + 30) / 60);
        if (wedgeIdx !== lastWedgeCrossed) {
            playTickSound();
            lastWedgeCrossed = wedgeIdx;
        }
        requestAnimationFrame(trackSpin);
    };
    trackSpin();
    
    setTimeout(() => {
        isSpinning = false;
        if (spinBtnEl) spinBtnEl.disabled = false;
        
        const prize = WEDGE_PRIZES[winnerIndex];
        
        if (prize.type === 'item') {
            if (statusBoxEl) statusBoxEl.innerHTML = `🎉 مبروك! ربحت: ${prize.name.split(' (')[0]} مجاناً! تم إضافتها لسلتك.`;
            
            cart.push({
                id: `${prize.id}-gift-${Date.now()}`,
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
            
            localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
            setTimeout(checkCooldownState, 2000);
        } else if (prize.type === 'nothing') {
            if (statusBoxEl) statusBoxEl.innerHTML = `😢 حظاً أوفر! لم تربح شيئاً هذه المرة. جرب مجدداً لاحقاً!`;
            playSadChime();
            
            localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
            setTimeout(checkCooldownState, 2000);
        } else {
            if (statusBoxEl) statusBoxEl.innerHTML = `🔄 فرصة ثانية! لم يذهب حظك هباءً، دوّر العجلة مجدداً مجاناً!`;
            playAlarmSound();
        }
    }, duration + 200);
}

// ----------------------------------------------------------
// 2. Bribe Cup / Sugar Clicker event
// ----------------------------------------------------------
function bribeCup() {
    bribeClicks++;
    playTickSound();
    
    const progressEl = document.getElementById('bribe-progress');
    const pctEl = document.getElementById('bribe-pct');
    const statusEl = document.getElementById('bribe-status');
    const visualContainer = document.getElementById('bribe-visual-container');
    
    const pct = Math.min(Math.round((bribeClicks / 15) * 100), 100);
    if (progressEl) progressEl.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${pct}%`;
    
    // Animate sugar falling into cup
    if (visualContainer) {
        const sugar = document.createElement('span');
        sugar.className = 'sugar-falling';
        sugar.textContent = '⬜';
        sugar.style.left = `${Math.random() * 60 + 20}px`;
        visualContainer.appendChild(sugar);
        setTimeout(() => sugar.remove(), 500);
    }
    
    if (bribeClicks >= 15) {
        document.getElementById('btn-add-sugar').disabled = true;
        if (statusEl) statusEl.innerHTML = `🎉 تم إقناع الفنجان! حصلت على كوب "قهوجي ماهر برو" مجاناً كعربون صداقة!`;
        
        cart.push({
            id: `pro-bribe-${Date.now()}`,
            productId: 'pro',
            name: 'قهوجي ماهر برو (هدية الرشوة)',
            price: 0,
            image: 'pro_new.jpg',
            options: { size: 'كبير', sugar: 'سكر زيادة' },
            quantity: 1
        });
        updateCartUI();
        playSuccessSound();
        triggerConfetti();
        
        localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
        setTimeout(checkCooldownState, 2500);
    } else {
        if (statusEl) statusEl.innerHTML = `مكعبات السكر المضافة: <strong>${bribeClicks} / 15</strong>. استمر بالإطعام!`;
    }
}

// ----------------------------------------------------------
// 3. Lie Detector event engine
// ----------------------------------------------------------
function renderDetectorQuestion() {
    if (!retroEventDynamicBody) return;
    
    if (currentDetectorQuestion >= DETECTOR_QUESTIONS.length) {
        // Evaluate overall test results
        if (detectorScore >= 2) {
            // Passed!
            retroEventDynamicBody.innerHTML = `
                <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                    <div class="detector-terminal" style="text-align: center; background: #002200; color: #33ff33;">
                        🚨 كشف الكذب: نـاجـح! ✅<br>
                        العميل صادق 100% وعاشق حقيقي لقهوة ماهر!
                    </div>
                    <p style="font-size:0.85rem; color:#000; margin-top:15px; text-align:center;">
                        كافأك المعلم ماهر بكوب "سوبر برو" مجاناً يضاف مباشرة لسلتك!
                    </p>
                    <div class="game-status-box" style="margin-top:10px; color:#28a745; text-align:center;">
                        تمت إضافة الهدية وإغلاق الكمبيوتر لقفل المحاولة...
                    </div>
                </div>
            `;
            cart.push({
                id: `superpro-truth-${Date.now()}`,
                productId: 'superpro',
                name: 'قهوجي ماهر سوبر برو (جائزة الصدق)',
                price: 0,
                image: '5960730354593238427.jpg',
                options: { size: 'كبير', sugar: 'سكر وسط' },
                quantity: 1
            });
            updateCartUI();
            playSuccessSound();
            triggerConfetti();
        } else {
            // Failed/Lied!
            retroEventDynamicBody.innerHTML = `
                <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
                    <div class="detector-terminal" style="text-align: center; background: #220000; color: #ff3333;">
                        🚨 كشف الكذب: كـاذب ومخـادع! ❌<br>
                        العميل يحب الشاي في الخفاء وتم كشفه!
                    </div>
                    <p style="font-size:0.85rem; color:#000; margin-top:15px; text-align:center;">
                        عقوبة المعلم ماهر: إضافة "شاي أخضر للمخادعين" بسعر 100 ريال إجبارياً إلى سلتك!
                    </p>
                    <div class="game-status-box" style="margin-top:10px; color:#dc3545; text-align:center;">
                        انتبه للمخالفات البرمجية مرة أخرى!
                    </div>
                </div>
            `;
            cart.push({
                id: `cheat-tea-${Date.now()}`,
                productId: 'classic', // repurpose card
                name: '🍵 شاي أخضر للمخادعين 🤥',
                price: 100,
                image: 'classic_new.jpg',
                options: { size: 'صغير', sugar: 'بدون سكر' },
                quantity: 1
            });
            updateCartUI();
            playSadChime();
        }
        
        localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
        setTimeout(checkCooldownState, 3500);
        return;
    }
    
    const question = DETECTOR_QUESTIONS[currentDetectorQuestion];
    retroEventDynamicBody.innerHTML = `
        <div class="win95-body" style="padding: 15px; font-family: var(--font-arabic);">
            <div class="detector-terminal">
                <div>> سؤال جهاز كشف الكذب [${currentDetectorQuestion + 1}/${DETECTOR_QUESTIONS.length}]...</div>
                <div style="font-size: 1.1rem; font-weight: bold; margin-top: 10px;">${question.q}</div>
            </div>
            
            <div class="detector-choices">
                ${question.options.map((opt, idx) => `
                    <button class="win95-choice-btn" onclick="answerDetector(${idx})">
                        <span class="detector-indicator"></span>
                        <span>${opt.text}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Global hook for detector click
window.answerDetector = function(optionIdx) {
    const question = DETECTOR_QUESTIONS[currentDetectorQuestion];
    const option = question.options[optionIdx];
    
    if (option.correct) {
        detectorScore++;
        playTickSound();
    } else {
        playAlarmSound();
    }
    
    currentDetectorQuestion++;
    renderDetectorQuestion();
};

// ----------------------------------------------------------
// 4. Grind Speed Challenge event engine
// ----------------------------------------------------------
function startGrindChallenge() {
    if (grindGameActive) return;
    
    grindGameActive = true;
    document.getElementById('btn-start-grind').style.display = 'none';
    const instr = document.getElementById('grind-instruction');
    const timerEl = document.getElementById('grind-time');
    const countEl = document.getElementById('grind-count');
    const progressEl = document.getElementById('grind-progress');
    const actionArea = document.getElementById('grind-action-area');
    const iconEl = document.getElementById('grind-icon');
    
    if (instr) instr.innerHTML = `⚡ <strong>جاري الطحن!</strong> انقر فوق الترس بأسرع ما يمكن!`;
    
    grindClicks = 0;
    grindTimeLeft = 7.00;
    
    // Track clicks on gear icon
    actionArea.addEventListener('click', () => {
        if (!grindGameActive) return;
        grindClicks++;
        playTickSound();
        
        if (countEl) countEl.textContent = `${grindClicks} / 60`;
        const pct = Math.min((grindClicks / 60) * 100, 100);
        if (progressEl) progressEl.style.width = `${pct}%`;
        
        // Spin animation effect on click
        if (iconEl) {
            iconEl.classList.add('active');
            setTimeout(() => iconEl.classList.remove('active'), 50);
        }
        
        // Success condition
        if (grindClicks >= 60) {
            endGrindChallenge(true);
        }
    });
    
    // Start countdown
    const startTime = Date.now();
    const duration = 7000;
    
    grindTimerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(duration - elapsed, 0);
        
        const seconds = Math.floor(remaining / 1000);
        const ms = Math.floor((remaining % 1000) / 10);
        
        if (timerEl) {
            timerEl.textContent = `${String(seconds).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
        }
        
        if (remaining <= 0) {
            endGrindChallenge(false);
        }
    }, 45);
}

function endGrindChallenge(success) {
    grindGameActive = false;
    clearInterval(grindTimerInterval);
    
    const instr = document.getElementById('grind-instruction');
    const actionArea = document.getElementById('grind-action-area');
    
    if (success) {
        if (instr) instr.innerHTML = `🏆 <strong>عمل رائع!</strong> لقد طحنت البن بسرعة خارقة وساعدت المعلم ماهر!`;
        playSuccessSound();
        triggerConfetti();
        
        cart.push({
            id: `pro-grind-${Date.now()}`,
            productId: 'pro',
            name: 'قهوجي ماهر برو (مكافأة الطحن)',
            price: 0,
            image: 'pro_new.jpg',
            options: { size: 'كبير', sugar: 'سكر وسط' },
            quantity: 1
        });
        updateCartUI();
        
        localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
        setTimeout(checkCooldownState, 3000);
    } else {
        if (instr) instr.innerHTML = `😢 <strong>انتهى الوقت!</strong> طحنك كان كسلاناً جداً ولم تملأ الخزان!`;
        playSadChime();
        
        // Let them retry immediately since they didn't lock
        const startBtn = document.getElementById('btn-start-grind');
        if (startBtn) {
            startBtn.style.display = 'block';
            startBtn.textContent = 'أعد محاولة التحدي!';
        }
    }
}

// ----------------------------------------------------------
// 4.1 Coffee Thief Car Chase event engine
// ----------------------------------------------------------
let chaseKeydownHandler = null;

function startCarChaseGame() {
    if (chaseActive) return;
    
    chaseActive = true;
    chaseScore = 0;
    chaseLives = 3;
    playerCarX = 50;
    chaseSpawnTimer = 0;
    chaseObjects = [];
    
    // UI elements
    const startBtn = document.getElementById('btn-start-chase');
    const roadEl = document.getElementById('chase-road');
    const scoreEl = document.getElementById('chase-score');
    const livesEl = document.getElementById('chase-lives');
    const playerCar = document.getElementById('player-car');
    
    if (startBtn) startBtn.style.display = 'none';
    if (roadEl) roadEl.classList.add('active');
    if (scoreEl) scoreEl.textContent = '0 / 3';
    if (livesEl) livesEl.textContent = '❤️❤️❤️';
    if (playerCar) playerCar.style.left = '50%';
    
    // Clear road elements
    const oldObjects = roadEl.querySelectorAll('.chase-thief-item, .chase-obstacle-item');
    oldObjects.forEach(el => el.remove());
    
    // Keyboard listener
    if (chaseKeydownHandler) window.removeEventListener('keydown', chaseKeydownHandler);
    chaseKeydownHandler = function(e) {
        if (!chaseActive) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            movePlayerCar(-1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            movePlayerCar(1);
        }
    };
    window.addEventListener('keydown', chaseKeydownHandler);
    
    // Mobile touch controls
    const btnLeft = document.getElementById('btn-chase-left');
    const btnRight = document.getElementById('btn-chase-right');
    
    if (btnLeft) {
        btnLeft.onclick = () => movePlayerCar(-1);
    }
    if (btnRight) {
        btnRight.onclick = () => movePlayerCar(1);
    }
    
    // Game Loop
    chaseInterval = setInterval(updateCarChaseFrame, 50);
}

function movePlayerCar(dir) {
    if (!chaseActive) return;
    playerCarX = Math.max(15, Math.min(85, playerCarX + dir * 10));
    const playerCar = document.getElementById('player-car');
    if (playerCar) {
        playerCar.style.left = playerCarX + '%';
    }
    playTickSound();
}

function updateCarChaseFrame() {
    if (!chaseActive) return;
    
    chaseSpawnTimer++;
    const roadEl = document.getElementById('chase-road');
    if (!roadEl) return;
    
    // Spawn objects every 20 frames (1 second at 50ms)
    if (chaseSpawnTimer % 20 === 0) {
        const type = Math.random() < 0.4 ? 'thief' : 'obstacle';
        const x = Math.floor(Math.random() * 65) + 18; // 18% to 82% to stay on road
        const el = document.createElement('div');
        el.className = type === 'thief' ? 'chase-thief-item' : 'chase-obstacle-item';
        el.style.left = x + '%';
        el.style.top = '-32px';
        el.textContent = type === 'thief' ? '🥷' : '🚧';
        
        roadEl.appendChild(el);
        chaseObjects.push({ type, x, y: -32, el });
    }
    
    // Move existing objects
    chaseObjects.forEach(obj => {
        obj.y += 6; // move speed (px per frame)
        obj.el.style.top = obj.y + 'px';
        
        // Collision check
        // Player is at bottom (bottom: 12px, so y is roughly 185px to 215px on a 230px container)
        if (obj.y > 180 && obj.y < 210) {
            // Check X proximity
            const xDist = Math.abs(obj.x - playerCarX);
            if (xDist < 12) {
                // Collided!
                obj.el.remove();
                obj.y = 999; // mark for deletion
                
                if (obj.type === 'thief') {
                    chaseScore++;
                    const scoreEl = document.getElementById('chase-score');
                    if (scoreEl) scoreEl.textContent = `${chaseScore} / 3`;
                    playSuccessSound();
                    
                    if (chaseScore >= 3) {
                        endCarChaseGame(true);
                    }
                } else {
                    chaseLives--;
                    const livesEl = document.getElementById('chase-lives');
                    if (livesEl) {
                        livesEl.textContent = '❤️'.repeat(Math.max(0, chaseLives)) || '💀';
                    }
                    playAlarmSound();
                    
                    if (chaseLives <= 0) {
                        endCarChaseGame(false);
                    }
                }
            }
        }
    });
    
    // Clean up off-screen objects
    chaseObjects = chaseObjects.filter(obj => {
        if (obj.y > 240) {
            obj.el.remove();
            return false;
        }
        return obj.y < 990;
    });
}

function endCarChaseGame(success) {
    chaseActive = false;
    clearInterval(chaseInterval);
    
    if (chaseKeydownHandler) {
        window.removeEventListener('keydown', chaseKeydownHandler);
        chaseKeydownHandler = null;
    }
    
    const roadEl = document.getElementById('chase-road');
    if (roadEl) roadEl.classList.remove('active');
    
    // Remove all remaining objects
    chaseObjects.forEach(obj => obj.el.remove());
    chaseObjects = [];
    
    const instr = document.getElementById('chase-instruction');
    
    if (success) {
        if (instr) instr.innerHTML = `🏆 <strong>تم القبض عليه!</strong> استعدت القهوة المسروقة وحصلت على كوب "سوبر برو" مجاناً كهدية القبض!`;
        playSuccessSound();
        triggerConfetti();
        
        cart.push({
            id: `superpro-thief-${Date.now()}`,
            productId: 'superpro',
            name: 'قهوجي ماهر سوبر برو (جائزة القبض)',
            price: 0,
            image: '5960730354593238427.jpg',
            options: { size: 'كبير', sugar: 'سكر وسط' },
            quantity: 1
        });
        updateCartUI();
        
        localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
        setTimeout(checkCooldownState, 3500);
    } else {
        if (instr) instr.innerHTML = `😢 <strong>لقد تحطمت سيارتك!</strong> هرب السارق بالقهوة. حاول تتبعه من جديد!`;
        playSadChime();
        
        const startBtn = document.getElementById('btn-start-chase');
        if (startBtn) {
            startBtn.style.display = 'block';
            startBtn.textContent = 'أعد محاولة المطاردة!';
        }
    }
}

// ----------------------------------------------------------
// 5. Maher's Vacation stock-market utility functions
// ----------------------------------------------------------
function updateStockGridHTML() {
    const gridContainer = document.getElementById('stock-grid-container');
    if (!gridContainer) return;
    
    const items = [
        { id: 'classic', name: 'القهوة الكلاسيكية', base: 1.5 },
        { id: 'pro', name: 'قهوة برو', base: 4 },
        { id: 'superpro', name: 'قهوة سوبر برو', base: 5 },
        { id: 'juice', name: 'عصير اليوم', base: 3 }
    ];
    
    gridContainer.innerHTML = items.map(item => {
        const curPrice = fluctuatedPrices[item.id];
        const isUp = curPrice >= item.base;
        const trendIcon = isUp ? '📈' : '📉';
        const trendClass = isUp ? 'trend-up' : 'trend-down';
        
        return `
            <div class="stock-item">
                <div class="stock-name">${item.name}</div>
                <div class="stock-value-wrapper">
                    <span class="stock-price">${curPrice} ر.س</span>
                    <span class="stock-trend ${trendClass}">${trendIcon}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ----------------------------------------------------------
// Main Initialization Hook for the active event
// ----------------------------------------------------------
function initActiveEventHooks() {
    // 1. Clear any active intervals
    if (priceInterval) clearInterval(priceInterval);
    if (priceFluctuationInterval) clearInterval(priceFluctuationInterval);
    
    // Remove neon styles
    document.body.classList.remove('neon-magic-active');
    
    // Reset product cards disabled states
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('disabled-mood');
        const btn = card.querySelector('.btn-add-cart');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> إضافة للسلة';
            btn.style.transform = '';
        }
    });

    // Reset escape counts
    cupEscapeCounts = { classic: 0, pro: 0, superpro: 0, juice: 0 };

    // Set Header Banner
    if (moodHeaderBanner) {
        if (ACTIVE_EVENT === 'none') {
            moodHeaderBanner.className = 'mood-header-banner success-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-mug-hot"></i> حالة المتجر: المعلم ماهر يروق ويصنع لكم القهوة بكل حب! الطلب متاح كالمعتاد.';
        } else if (ACTIVE_EVENT === 'anger') {
            moodHeaderBanner.className = 'mood-header-banner danger-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> الحدث النشط: غضب قهوجي ماهر! الطلبات موقوفة حالياً بسبب صنع قهوة خارجية!';
            
            // Disable ordering
            document.querySelectorAll('.product-card').forEach(card => {
                card.classList.add('disabled-mood');
                const btn = card.querySelector('.btn-add-cart');
                if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> الطلبات معطلة';
            });
            // Play alarm loop
            triggerAlarm("تنبيه: المعلم ماهر غاضب وتم إيقاف السلة والطلبات!");
            
        } else if (ACTIVE_EVENT === 'luck_wheel') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-circle-check"></i> بشرى سارة: قهوجي ماهر قبل الاعتذار ورجّع لكم الموقع طبيعي! جرب حظك الآن عبر الكمبيوتر القديم 🎰';
        } else if (ACTIVE_EVENT === 'cup_strike') {
            moodHeaderBanner.className = 'mood-header-banner warning-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-face-frown-open"></i> الحدث النشط: إضراب فناجين القهوة! الأزرار لا تستجيب بسهولة، تفاهم معهم عبر الكمبيوتر القديم ☕';
            
            // Setup button fleeing listener
            setupFleeingButtons();
            
        } else if (ACTIVE_EVENT === 'lie_detector') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-user-secret"></i> الحدث النشط: جهاز كشف كذب محبي القهوة! تفضل بالفحص عبر الكمبيوتر القديم واربح كوب سوبر برو مجاني! 🤥';
        } else if (ACTIVE_EVENT === 'maher_vacation') {
            moodHeaderBanner.className = 'mood-header-banner success-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-chart-line"></i> الحدث النشط: إجازة المعلم ماهر وبورصة القهوة! الأسعار تتذبذب كل 5 ثوانٍ، تتبع الكمبيوتر للشراء بأفضل سعر! 📈';
            
            // Start price fluctuation
            startPriceFluctuation();
            
        } else if (ACTIVE_EVENT === 'grind_challenge') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-gauge-high"></i> الحدث النشط: تحدي طحن حبوب البن السريع! ادخل عبر الكمبيوتر القديم واطحن واربح قهوتك مجاناً! ⚙️';
        } else if (ACTIVE_EVENT === 'neon_magic') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> الحدث النشط: خلطة قهوة ماهر السحرية المضيئة! استمتع بوضع النيون الليلي الخارق وجرب الماوس 🔮';
            
            // Activate Neon magic theme
            document.body.classList.add('neon-magic-active');
            setupNeonParticles();
        } else if (ACTIVE_EVENT === 'thief') {
            moodHeaderBanner.className = 'mood-header-banner danger-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> الحدث النشط: سارق القهوة يتجول في المتجر! إذا سرق سلتك، اقبض عليه بالكمبيوتر القديم! 🚓🥷';
        } else if (ACTIVE_EVENT === 'matcha') {
            moodHeaderBanner.className = 'mood-header-banner success-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-leaf"></i> الحدث النشط: أسبوع الماتشا الماهرة! 🍵 جرب الماتشا الجديدة بـ 6 ريال، واحصل على خصم خارق لسوبر برو بـ 2 ريال فقط! 💚';
            
            // Dynamic UI update for Super Pro price card
            const superProCard = document.querySelector('.product-card[data-id="superpro"]');
            if (superProCard) {
                const priceEl = superProCard.querySelector('.product-price');
                if (priceEl) {
                    priceEl.innerHTML = `2 ر.س <span class="old-price" style="text-decoration: line-through; color: #777; font-size: 0.95rem; margin-right: 5px;">5 ر.س</span> <span class="price-suffix">/ كوب</span>`;
                }
            }
        }
    }
}

// Helper: Setup fleeing buttons in Cup Strike
function setupFleeingButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = card.getAttribute('data-id');
        const btn = card.querySelector('.btn-add-cart');
        
        if (btn) {
            btn.addEventListener('mouseenter', () => {
                if (ACTIVE_EVENT !== 'cup_strike') return;
                
                if (!cupEscapeCounts[productId]) {
                    cupEscapeCounts[productId] = 0;
                }
                
                if (cupEscapeCounts[productId] < 2) {
                    // Escape!
                    const rx = (Math.random() - 0.5) * 120;
                    const ry = (Math.random() - 0.5) * 60;
                    btn.style.transform = `translate(${rx}px, ${ry}px)`;
                    cupEscapeCounts[productId]++;
                    playTickSound();
                }
            });
        }
    });
}

// Helper: Price fluctuation in Maher's Vacation
function startPriceFluctuation() {
    const updatePrices = () => {
        fluctuatedPrices.classic = Math.floor(Math.random() * 8) + 1; // 1-8 SAR
        fluctuatedPrices.pro = Math.floor(Math.random() * 12) + 2;    // 2-13 SAR
        fluctuatedPrices.superpro = Math.floor(Math.random() * 15) + 3; // 3-17 SAR
        fluctuatedPrices.juice = Math.floor(Math.random() * 10) + 1;    // 1-10 SAR
        
        // Update product card prices on the page
        const items = ['classic', 'pro', 'superpro', 'juice'];
        items.forEach(id => {
            const card = document.querySelector(`.product-card[data-id="${id}"]`);
            if (card) {
                const priceEl = card.querySelector('.product-price');
                if (priceEl) {
                    priceEl.innerHTML = `${fluctuatedPrices[id]} ر.س <span style="font-size:0.75rem; color:#d9534f; font-weight:normal;">(سعر البورصة 📊)</span>`;
                }
            }
        });
        
        // Update stock grid inside retro window if open
        updateStockGridHTML();
    };
    
    updatePrices();
    priceFluctuationInterval = setInterval(updatePrices, 5000);
}

// Helper: Mouse particle trail in Neon Magic
function setupNeonParticles() {
    window.addEventListener('mousemove', (e) => {
        if (ACTIVE_EVENT !== 'neon_magic') return;
        if (Math.random() > 0.15) return; // limit count
        
        const p = document.createElement('div');
        p.className = 'neon-particle';
        p.style.left = `${e.clientX - 4}px`;
        p.style.top = `${e.clientY - 4}px`;
        
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    });
}

// Retro Modal triggers
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
    
    // Stop clicker intervals if closing
    if (grindTimerInterval) {
        clearInterval(grindTimerInterval);
        grindGameActive = false;
    }
}

if (closeRetroModal) closeRetroModal.addEventListener('click', closeRetroModalFn);
if (retroModalOverlay) retroModalOverlay.addEventListener('click', closeRetroModalFn);

// Initialize Active Event system on load
initActiveEventHooks();

// Reset Matcha free redemption flag once to allow claiming again as requested
localStorage.removeItem('maher_matcha_redeemed');

// Populate the cart drawer UI from persistent storage on load
updateCartUI();


