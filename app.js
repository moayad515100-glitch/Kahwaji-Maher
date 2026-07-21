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

const IS_EVENT_POSTPONED = false;
const POSTPONED_REASON = '';
const IS_MENU_LOCKED = false;

// Fixed synchronized launch timestamp for all users (2026-07-21 13:32:16 UTC+3)
const EVENT_LAUNCH_TIME = 1784629936000; 
let globalCountdownInterval = null;

function isEventLaunched() {
    if (typeof IS_EVENT_POSTPONED !== 'undefined' && IS_EVENT_POSTPONED) {
        return false;
    }
    if (localStorage.getItem('maher_launch_bypass') === 'true') {
        return true;
    }
    return Date.now() >= EVENT_LAUNCH_TIME;
}

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
    if (typeof IS_MENU_LOCKED !== 'undefined' && IS_MENU_LOCKED) {
        closeCartDrawer();
        triggerAlarm("🔒 المنيو والطلبات مغلقة حالياً لأن قهوجي ماهر غير متواجد اليوم!");
        return;
    }
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
    if (typeof IS_MENU_LOCKED !== 'undefined' && IS_MENU_LOCKED) {
        showToast("🔒 المنيو مقفل حالياً لأن قهوجي ماهر غير متواجد اليوم!");
        return;
    }

    let currentEvent = ACTIVE_EVENT;
    if (ACTIVE_EVENT === 'matcha' && !isEventLaunched()) {
        currentEvent = 'none';
    }

    if (currentEvent === 'anger') {
        triggerAlarm("عذراً! لا يمكنك الطلب الآن لأن قهوجي ماهر غاضب! 😡");
        return;
    }

    if (currentEvent === 'thief' && Math.random() < 0.25) {
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
    if (currentEvent === 'maher_vacation') {
        finalPrice = fluctuatedPrices[productId] !== undefined ? fluctuatedPrices[productId] : price;
        finalName = `${name} (سعر البورصة)`;
    } else if (currentEvent === 'matcha') {
        if (productId === 'matcha' || productId === 'superpro') {
            finalPrice = 0;
            finalName = `${name} (هدية الافتتاح! 🎁)`;
        }
    }

    // Limit free event items (Matcha / Super Pro) to 1 cup per customer
    if (finalPrice === 0 && (productId === 'matcha' || productId === 'superpro')) {
        const existingCount = cart
            .filter(item => item.productId === productId && item.price === 0)
            .reduce((sum, item) => sum + item.quantity, 0);
        if (existingCount >= 1) {
            showToast(`عذراً! يُسمح بكوب مجاني واحد فقط من ${name}! 🎁`);
            return;
        }
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
            const item = cart[itemIndex];
            // Enforce limit of 1 for free event items on increase
            if (item.price === 0 && (item.productId === 'matcha' || item.productId === 'superpro')) {
                showToast(`عذراً! يُسمح بكوب مجاني واحد فقط من ${item.name}! 🎁`);
                return;
            }
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
        if (typeof IS_EVENT_POSTPONED !== 'undefined' && IS_EVENT_POSTPONED) {
            retroEventDynamicBody.innerHTML = `
                <div class="win95-body" style="padding: 20px; text-align: center; font-family: var(--font-arabic); background: #8b0000; color: #fff; min-height: 300px;">
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">*** تنبيه: تجميد الوقت وتأجيل الحدث ***</div>
                    <p style="font-size: 1rem; line-height: 1.6; text-align: center; font-weight: bold;">
                        🛑 ${POSTPONED_REASON}
                    </p>
                    <div class="countdown-display" style="margin-top: 25px;">
                        <div class="countdown-label" style="font-size: 0.8rem; color: #ffcccc;">حالة المؤقت:</div>
                        <div class="countdown-timer" id="prelaunch-comp-timer" style="font-size: 1.8rem; font-weight: bold; margin-top: 5px; color: #ffeb3b;">مُجمّد ❄️ (00:00:00)</div>
                    </div>
                    <hr style="margin: 25px 0; border-color: #555;">
                    <button class="win95-btn" onclick="closeRetroModalFn()" style="width: 100%;">إغلاق</button>
                </div>
            `;
        } else if (!isEventLaunched()) {
            // Pre-launch state: preparation screen
            retroEventDynamicBody.innerHTML = `
                <div class="win95-body" style="padding: 20px; text-align: center; font-family: var(--font-arabic); background: #000080; color: #fff; min-height: 300px;">
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">*** شاشة استعداد ماهر 95 ***</div>
                    <p style="font-size: 0.85rem; line-height: 1.6; text-align: right;">
                        نظام التشغيل يستعد حالياً للترقية التلقائية وتنشيط أكبر حدث في تاريخ قهوجي ماهر مجاناً.
                    </p>
                    <div class="countdown-display" style="margin-top: 25px;">
                        <div class="countdown-label" style="font-size: 0.8rem; color: #ffff00;">الوقت المتبقي للترقية:</div>
                        <div class="countdown-timer" id="prelaunch-comp-timer" style="font-size: 1.8rem; font-weight: bold; margin-top: 5px;">--:--:--</div>
                    </div>
                    <hr style="margin: 25px 0; border-color: #555;">
                    <button class="win95-btn" onclick="closeRetroModalFn()" style="width: 100%;">إغلاق</button>
                </div>
            `;
            const updateCompTimer = () => {
                const remaining = EVENT_LAUNCH_TIME - Date.now();
                const timerEl = document.getElementById('prelaunch-comp-timer');
                if (!timerEl) return;
                if (remaining <= 0) {
                    clearInterval(compTimerInterval);
                    location.reload();
                    return;
                }
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            };
            updateCompTimer();
            const compTimerInterval = setInterval(() => {
                if (document.getElementById('prelaunch-comp-timer')) {
                    updateCompTimer();
                } else {
                    clearInterval(compTimerInterval);
                }
            }, 1000);
        } else {
            // Post-launch: render full Win95 Desktop environment!
            const redeemed = localStorage.getItem('maher_matcha_redeemed') === 'true';
            retroEventDynamicBody.innerHTML = `
                <div class="maher-os-desktop" id="maher-desktop">
                    <!-- Icons Grid -->
                    <div class="desktop-icons">
                        <div class="desktop-icon" onclick="openOSWindow('win-event')">
                            <span class="desktop-icon-img">📁</span>
                            <span class="desktop-icon-text">لوحة الفعاليات</span>
                        </div>
                        <div class="desktop-icon" onclick="openOSWindow('win-cmd')">
                            <span class="desktop-icon-img">🖥️</span>
                            <span class="desktop-icon-text">Terminal CMD</span>
                        </div>
                        <div class="desktop-icon" onclick="openOSWindow('win-barista')">
                            <span class="desktop-icon-img">🎮</span>
                            <span class="desktop-icon-text">بارستا ماهر</span>
                        </div>
                        <div class="desktop-icon" onclick="openOSWindow('win-paint')">
                            <span class="desktop-icon-img">🎨</span>
                            <span class="desktop-icon-text">لاتيه آرت</span>
                        </div>
                        <div class="desktop-icon" onclick="openOSWindow('win-radio')">
                            <span class="desktop-icon-img">📻</span>
                            <span class="desktop-icon-text">راديو لوفي</span>
                        </div>
                        <div class="desktop-icon" onclick="openOSWindow('win-notepad')">
                            <span class="desktop-icon-img">📝</span>
                            <span class="desktop-icon-text">المفكرة</span>
                        </div>
                    </div>

                    <!-- Windows -->
                    <!-- Window 1: Event Console -->
                    <div class="os-window" id="win-event" style="display: none;">
                        <div class="window-titlebar" onmousedown="dragOSWindow(event, 'win-event')">
                            <span class="window-title">📁 لوحة الفعاليات</span>
                            <div class="window-controls">
                                <button class="win-btn" onclick="closeOSWindow('win-event')">X</button>
                            </div>
                        </div>
                        <div class="window-body">
                            <div style="text-align: center; background: #e8f5e9; padding: 8px; border: 1px solid #81c784; border-radius: 4px; direction: rtl; font-family: var(--font-arabic);">
                                <h4 style="color:#2e7d32;">🍵 أسبوع الماتشا الماهرة نشط!</h4>
                                <p style="font-size:0.75rem; margin-top:5px; color:#333;">لقد قمنا بتوفير الماتشا وسوبر برو مجاناً بالكامل للجميع! يمكنك طلب الأكواب الآن من المتجر.</p>
                                <hr style="margin: 8px 0; border: none; border-top: 1px dotted #ccc;">
                                <div style="font-size: 0.8rem; font-weight: bold; color: #2e7d32; margin-bottom: 6px;">🎁 هدية أسبوع الماتشا الخاصة بك:</div>
                                <button class="win95-btn" id="btn-claim-free-matcha" style="width: 100%; font-weight: bold; background: #2e7d32; color: #fff; border-color: #2e7d32; cursor: pointer; padding: 6px 12px; user-select:none;" ${redeemed ? 'disabled' : ''}>
                                    ${redeemed ? 'تم استلام الكوب المجاني بنجاح! ✔️' : 'ماتشا ماهرة مجاناً (كوب واحد فقط!) 🍵'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Window: CMD Terminal -->
                    <div class="os-window" id="win-cmd" style="display: none; min-width: 320px;">
                        <div class="window-titlebar" onmousedown="dragOSWindow(event, 'win-cmd')">
                            <span class="window-title">🖥️ Command Prompt (cmd.exe)</span>
                            <div class="window-controls">
                                <button class="win-btn" onclick="closeOSWindow('win-cmd')">X</button>
                            </div>
                        </div>
                        <div class="window-body" style="background: #000; color: #00ff00; font-family: 'Courier New', Courier, monospace; font-size: 0.75rem; padding: 10px; height: 230px; display: flex; flex-direction: column; direction: ltr; text-align: left;">
                            <div id="cmd-output" style="flex: 1; overflow-y: auto; margin-bottom: 6px; line-height: 1.4; word-break: break-all;">
                                <div>Microsoft(R) Windows 95 [Version 4.00.950]</div>
                                <div>(C)Copyright Kahwaji Maher Corp 1981-1995.</div>
                                <br>
                                <div>Type <span style="color:#ffff00;">'help'</span> to view commands list.</div>
                                <div>Try typing <span style="color:#ffff00;">'buy classic'</span> or secret command <span style="color:#ffff00;">'cmd Kahwaji Maher'</span>!</div>
                            </div>
                            <div style="display: flex; align-items: center; border-top: 1px solid #333; padding-top: 4px;">
                                <span style="color: #00ff00; font-weight: bold; margin-right: 4px;">C:\\MAHER95&gt;</span>
                                <input type="text" id="cmd-input-field" style="flex: 1; background: transparent; border: none; outline: none; color: #00ff00; font-family: monospace; font-size: 0.75rem;" placeholder="type command..." onkeydown="handleCmdKeyDown(event)">
                            </div>
                        </div>
                    </div>

                    <!-- Window 2: Barista Game -->
                    <div class="os-window" id="win-barista" style="display: none;">
                        <div class="window-titlebar" onmousedown="dragOSWindow(event, 'win-barista')">
                            <span class="window-title">🎮 بارستا ماهر</span>
                            <div class="window-controls">
                                <button class="win-btn" onclick="closeOSWindow('win-barista')">X</button>
                            </div>
                        </div>
                        <div class="window-body" style="background:#f4f4f4; padding:6px;">
                            <div id="barista-menu-view" style="display: block; text-align:center;">
                                <p style="font-size:0.75rem; color:#555; margin-bottom:8px; line-height:1.4;">
                                    محاكي بارستا ماهر: قم بتحضير المشروبات المطلوبة بالترتيب الصحيح لكسب النقاط. حضّر 5 طلبات صحيحة لتربح!
                                </p>
                                <button class="win95-btn" onclick="startBaristaGame()" style="width:100%; padding:6px; font-weight:bold;">ابدأ الطبخ! ☕🎮</button>
                            </div>
                            <div id="barista-game-view" style="display: none;">
                                <div class="barista-order-bubble" id="barista-order-text">طلب الزبون: ...</div>
                                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:5px;">
                                    <span>النقاط: <strong id="barista-points">0 / 5</strong></span>
                                    <span>الوقت: <strong id="barista-time">45s</strong></span>
                                </div>
                                <div class="barista-progress-cup" id="barista-cup-display">كوب فارغ</div>
                                <div class="barista-ingredients-grid">
                                    <div class="ingredient-group-title">الأكواب:</div>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('cup', 'وسط')">🥤 وسط</button>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('cup', 'كبير')">🥤 كبير</button>
                                    
                                    <div class="ingredient-group-title">المشروبات:</div>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('drink', 'كلاسيك')">☕ كلاسيك</button>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('drink', 'برو')">☕ برو</button>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('drink', 'ماتشا')">🍵 ماتشا</button>
                                    
                                    <div class="ingredient-group-title">السكر والحليب:</div>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('sugar', 'بدون')">🍬 بدون</button>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('sugar', 'سكر وسط')">🍬 وسط</button>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('milk', 'milk')">🥛 حليب</button>
                                    <button class="barista-btn" onclick="selectBaristaIngredient('milk', 'nomilk')">🥛 بدون حليب</button>
                                </div>
                                <div style="display:flex; gap:6px; margin-top:8px;">
                                    <button class="win95-btn" onclick="submitBaristaOrder()" style="flex:1; background:#2e7d32; color:#fff;">تقديم 📤</button>
                                    <button class="win95-btn" onclick="resetBaristaCup()" style="flex:1; background:#d9534f; color:#fff;">تفريغ 🗑️</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Window 3: Paint -->
                    <div class="os-window" id="win-paint" style="display: none;">
                        <div class="window-titlebar" onmousedown="dragOSWindow(event, 'win-paint')">
                            <span class="window-title">🎨 لاتيه آرت</span>
                            <div class="window-controls">
                                <button class="win-btn" onclick="closeOSWindow('win-paint')">X</button>
                            </div>
                        </div>
                        <div class="window-body" style="display:flex; flex-direction:column; align-items:center; padding:5px;">
                            <div class="paint-canvas-container">
                                <canvas id="paint-canvas" width="130" height="130"></canvas>
                            </div>
                            <div class="paint-palette">
                                <div class="paint-color active" style="background:#3d2314;" onclick="setPaintColor('#3d2314', this)"></div>
                                <div class="paint-color" style="background:#fdf6e2;" onclick="setPaintColor('#fdf6e2', this)"></div>
                                <div class="paint-color" style="background:#b37d14;" onclick="setPaintColor('#b37d14', this)"></div>
                                <div class="paint-color" style="background:#4c7c3c;" onclick="setPaintColor('#4c7c3c', this)"></div>
                            </div>
                            <button class="win95-btn" onclick="clearPaintCanvas()" style="width:100%; margin-top:6px; padding:3px;">مسح الكوب 🧹</button>
                        </div>
                    </div>

                    <!-- Window 4: Radio -->
                    <div class="os-window" id="win-radio" style="display: none;">
                        <div class="window-titlebar" onmousedown="dragOSWindow(event, 'win-radio')">
                            <span class="window-title">📻 راديو لوفي</span>
                            <div class="window-controls">
                                <button class="win-btn" onclick="closeOSWindow('win-radio')">X</button>
                            </div>
                        </div>
                        <div class="window-body" style="padding:10px;">
                            <div class="radio-display" id="radio-track-name">📻 راديو ماهر: مغلق 💤</div>
                            <div class="radio-controls">
                                <button class="win95-btn" onclick="toggleOSRadio()" style="padding:4px 10px; font-weight:bold;" id="btn-radio-play">تشغيل ▶</button>
                            </div>
                        </div>
                    </div>

                    <!-- Window 5: Notepad -->
                    <div class="os-window" id="win-notepad" style="display: none;">
                        <div class="window-titlebar" onmousedown="dragOSWindow(event, 'win-notepad')">
                            <span class="window-title">📝 المفكرة</span>
                            <div class="window-controls">
                                <button class="win-btn" onclick="closeOSWindow('win-notepad')">X</button>
                            </div>
                        </div>
                        <div class="window-body" style="background:#fff; color:#000; font-family:monospace; font-size:0.7rem; direction:rtl; text-align:right;">
                            <strong>مذكرات المعلم ماهر:</strong><br>
                            - لا تخبر أحداً بالشيفرات السرية للموقع!<br>
                            🗝️ اكتب الكود في أي مكان بالموقع لتفعيله:<br>
                            • <code>MAHERMATCHAFREE</code> : تصفير مؤشر الماتشا المجانية مجدداً.<br>
                            • <code>FASTCAR</code> : تفعيل وضع السرعة الفائقة والحياة اللانهائية لسيارتك في مطاردة السارق.<br>
                            • <code>BARISTAPASS</code> : الفوز فوراً بلعبة البارستا مجاناً كوب ماتشا.<br>
                            • <code>cmd Kahwaji Maher</code> : تحويل المنيو إلى كمبيوتر قديم.<br>
                        </div>
                    </div>

                    <!-- Taskbar -->
                    <div class="os-taskbar">
                        <button class="start-btn" id="os-start-btn" onclick="toggleStartMenu()">☕ ابدأ</button>
                        <div class="taskbar-tabs" id="taskbar-tabs-container"></div>
                        <div class="taskbar-clock" id="taskbar-clock-display">--:-- م</div>
                    </div>

                    <!-- Start Menu Dropdown -->
                    <div class="start-menu" id="start-menu-dropdown">
                        <div style="display: flex;">
                            <div class="start-menu-sidebar">MAHER 95</div>
                            <div style="flex-grow: 1;">
                                <div class="start-menu-item" onclick="openOSWindow('win-event')">📁 لوحة الفعاليات</div>
                                <div class="start-menu-item" onclick="openOSWindow('win-cmd')">🖥️ Terminal CMD</div>
                                <div class="start-menu-item" onclick="openOSWindow('win-barista')">🎮 بارستا ماهر</div>
                                <div class="start-menu-item" onclick="openOSWindow('win-paint')">🎨 لاتيه آرت</div>
                                <div class="start-menu-item" onclick="openOSWindow('win-radio')">📻 راديو لوفي</div>
                                <div class="start-menu-item" onclick="openOSWindow('win-notepad')">📝 المفكرة</div>
                                <hr style="margin: 4px 0; border: none; border-top: 1px solid #808080;">
                                <div class="start-menu-item" onclick="closeRetroModalFn()">🔌 إيقاف التشغيل</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // Init Clock and Event button
            updateOSClock();
            setInterval(updateOSClock, 30000);
            
            const claimBtn = document.getElementById('btn-claim-free-matcha');
            if (claimBtn && !redeemed) {
                claimBtn.addEventListener('click', claimFreeMatchaDrink);
            }
            
            // Init paint app canvas events
            initPaintCanvas();
        }
    }
}

// ==========================================================
// MaherOS 95 Desktop Engine & Helper Functions
// ==========================================================
let activeOSWindows = [];

function updateOSClock() {
    const clockEl = document.getElementById('taskbar-clock-display');
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    clockEl.textContent = `${hours}:${minutes} ${ampm}`;
}

function toggleStartMenu() {
    const menu = document.getElementById('start-menu-dropdown');
    const btn = document.getElementById('os-start-btn');
    if (!menu) return;
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        btn.classList.remove('active');
    } else {
        menu.style.display = 'block';
        btn.classList.add('active');
    }
}

function openOSWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Hide Start menu
    const menu = document.getElementById('start-menu-dropdown');
    const btn = document.getElementById('os-start-btn');
    if (menu) menu.style.display = 'none';
    if (btn) btn.classList.remove('active');
    
    win.style.display = 'flex';
    
    if (!activeOSWindows.includes(winId)) {
        activeOSWindows.push(winId);
    }
    
    focusOSWindow(winId);
    updateTaskbarTabs();
}

function closeOSWindow(winId) {
    const win = document.getElementById(winId);
    if (win) win.style.display = 'none';
    
    activeOSWindows = activeOSWindows.filter(id => id !== winId);
    updateTaskbarTabs();
    
    // Stop barista game if closed
    if (winId === 'win-barista') {
        clearInterval(baristaTimer);
        baristaActive = false;
    }
}

function focusOSWindow(winId) {
    document.querySelectorAll('.os-window').forEach(w => {
        w.classList.remove('active');
        w.classList.add('inactive');
    });
    const win = document.getElementById(winId);
    if (win) {
        win.classList.add('active');
        win.classList.remove('inactive');
    }
}

function updateTaskbarTabs() {
    const container = document.getElementById('taskbar-tabs-container');
    if (!container) return;
    
    const titles = {
        'win-event': '📁 الفعاليات',
        'win-cmd': '🖥️ Terminal',
        'win-barista': '🎮 بارستا',
        'win-paint': '🎨 الرسام',
        'win-radio': '📻 الراديو',
        'win-notepad': '📝 المفكرة'
    };
    
    container.innerHTML = activeOSWindows.map(id => {
        return `<div class="taskbar-tab active" onclick="focusOSWindow('${id}')">${titles[id] || id}</div>`;
    }).join('');
}

// CMD Terminal Helper Functions
function handleCmdKeyDown(e) {
    if (e.key === 'Enter') {
        const inputEl = document.getElementById('cmd-input-field');
        if (!inputEl) return;
        const rawCmd = inputEl.value.trim();
        if (!rawCmd) return;
        
        processCmdCommand(rawCmd);
        inputEl.value = '';
    }
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function processCmdCommand(rawCmd) {
    const outputEl = document.getElementById('cmd-output');
    if (!outputEl) return;

    const cmdLine = document.createElement('div');
    cmdLine.innerHTML = `<span style="color:#00ff00;">C:\\MAHER95&gt;</span> ${escapeHtml(rawCmd)}`;
    outputEl.appendChild(cmdLine);

    const cleanCmd = rawCmd.toLowerCase().trim();

    // Secret Command: cmd Kahwaji Maher
    if (cleanCmd === 'cmd kahwaji maher') {
        enableRetroComputerMenuTheme();
        const res = document.createElement('div');
        res.style.color = '#ffff00';
        res.style.fontWeight = 'bold';
        res.innerHTML = '[SUCCESS] Kahwaji Maher Old Computer Mode Activated! 💻<br>The entire menu has transformed into Retro Win95 Computer theme!';
        outputEl.appendChild(res);
    }
    // Buy Command: buy <item>
    else if (cleanCmd.startsWith('buy ')) {
        const targetItemName = cleanCmd.replace('buy ', '').trim();
        executeBuyCmd(targetItemName, outputEl);
    }
    else if (cleanCmd === 'help') {
        const res = document.createElement('div');
        res.style.color = '#00ffff';
        res.innerHTML = `
            --- MAHER OS 95 COMMAND HELP ---<br>
            • <b>buy &lt;coffee_name&gt;</b> : Buy &amp; add item to cart (e.g. buy classic, buy pro, buy superpro, buy juice, buy matcha)<br>
            • <b>cmd Kahwaji Maher</b> : Secret command to transform full menu to old computer theme<br>
            • <b>list</b> : List all available drinks to buy<br>
            • <b>clear</b> : Clear CMD terminal output<br>
        `;
        outputEl.appendChild(res);
    }
    else if (cleanCmd === 'list') {
        const res = document.createElement('div');
        res.style.color = '#00ffff';
        res.innerHTML = `
            Available Drinks to Buy:<br>
            1. classic / عادي (0 SAR)<br>
            2. pro / برو (3 SAR)<br>
            3. superpro / سوبر برو (5 SAR)<br>
            4. juice / عصير (4 SAR)<br>
            5. matcha / ماتشا (0 SAR)<br>
            Example: type 'buy classic' or 'buy pro'
        `;
        outputEl.appendChild(res);
    }
    else if (cleanCmd === 'clear') {
        outputEl.innerHTML = '';
    }
    else {
        const res = document.createElement('div');
        res.style.color = '#ff6666';
        res.textContent = `'${rawCmd}' is not recognized as an internal command. Type 'help' for commands.`;
        outputEl.appendChild(res);
    }

    outputEl.scrollTop = outputEl.scrollHeight;
}

function executeBuyCmd(itemName, outputEl) {
    const cmdMap = {
        'classic': { id: 'classic', name: 'قهوجي ماهر العادي', price: 0, image: 'classic_new.jpg' },
        'عادي': { id: 'classic', name: 'قهوجي ماهر العادي', price: 0, image: 'classic_new.jpg' },
        'العادي': { id: 'classic', name: 'قهوجي ماهر العادي', price: 0, image: 'classic_new.jpg' },
        
        'pro': { id: 'pro', name: 'قهوجي ماهر برو', price: 3, image: 'pro_new.jpg' },
        'برو': { id: 'pro', name: 'قهوجي ماهر برو', price: 3, image: 'pro_new.jpg' },

        'superpro': { id: 'superpro', name: 'قهوجي ماهر سوبر برو', price: 5, image: '5960730354593238427.jpg' },
        'سوبر برو': { id: 'superpro', name: 'قهوجي ماهر سوبر برو', price: 5, image: '5960730354593238427.jpg' },
        'سوبربرو': { id: 'superpro', name: 'قهوجي ماهر سوبر برو', price: 5, image: '5960730354593238427.jpg' },

        'juice': { id: 'juice', name: 'عصير طازج', price: 4, image: '5963013000862043793.jpg' },
        'عصير': { id: 'juice', name: 'عصير طازج', price: 4, image: '5963013000862043793.jpg' },

        'matcha': { id: 'matcha', name: 'ماتشا ماهرة', price: 0, image: 'matcha.jpg' },
        'ماتشا': { id: 'matcha', name: 'ماتشا ماهرة', price: 0, image: 'matcha.jpg' }
    };

    const item = cmdMap[itemName.toLowerCase()];
    if (!item) {
        const err = document.createElement('div');
        err.style.color = '#ff6666';
        err.textContent = `[ERROR] Coffee '${itemName}' not found. Type 'list' for valid drink names.`;
        outputEl.appendChild(err);
        return;
    }

    const cartItemId = `${item.id}-وسط-بدون سكر`;
    const existingIndex = cart.findIndex(i => i.id === cartItemId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            options: { size: 'وسط', sugar: 'بدون سكر' },
            quantity: 1
        });
    }
    updateCartUI();
    showToast(`🛒 [CMD Terminal] تمت إضافة ${item.name} إلى السلة بنجاح!`);

    const ok = document.createElement('div');
    ok.style.color = '#00ff00';
    ok.textContent = `[SUCCESS] Item '${item.name}' added to cart successfully!`;
    outputEl.appendChild(ok);
}

function enableRetroComputerMenuTheme() {
    document.body.classList.add('retro-cmd-menu-active');
    
    // Add Win95 window headers to product cards if not added
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, idx) => {
        if (!card.querySelector('.win95-card-header')) {
            const header = document.createElement('div');
            header.className = 'win95-card-header';
            header.innerHTML = `
                <span>💻 MAHER_DRINK_0${idx + 1}.EXE</span>
                <div class="win95-card-controls"><span>_</span><span>□</span><span>×</span></div>
            `;
            card.prepend(header);
        }
    });

    playSuccessSound();
    triggerConfetti();
    showToast('🖥️ تم تحويل المنيو بالكامل إلى شكل الكمبيوتر القديم (Win95)!');
}

function dragOSWindow(event, winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    focusOSWindow(winId);
    
    let shiftX = event.clientX - win.getBoundingClientRect().left;
    let shiftY = event.clientY - win.getBoundingClientRect().top;
    
    const container = document.getElementById('maher-desktop');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    
    function moveAt(clientX, clientY) {
        let left = clientX - containerRect.left - shiftX;
        let top = clientY - containerRect.top - shiftY;
        
        left = Math.max(0, Math.min(containerRect.width - win.offsetWidth, left));
        top = Math.max(0, Math.min(containerRect.height - win.offsetHeight - 32, top));
        
        win.style.left = left + 'px';
        win.style.top = top + 'px';
    }
    
    function onMouseMove(e) {
        moveAt(e.clientX, e.clientY);
    }
    
    document.addEventListener('mousemove', onMouseMove);
    
    document.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.onmouseup = null;
    };
}

// ----------------------------------------------------------
// MaherOS 95 Barista Game Logic
// ----------------------------------------------------------
let baristaActive = false;
let baristaOrder = null;
let baristaSelection = { cup: null, drink: null, sugar: null, milk: null };
let baristaScore = 0;
let baristaTimeLeft = 45;
let baristaTimer = null;

function startBaristaGame() {
    document.getElementById('barista-menu-view').style.display = 'none';
    document.getElementById('barista-game-view').style.display = 'block';
    
    baristaActive = true;
    baristaScore = 0;
    baristaTimeLeft = 45;
    
    document.getElementById('barista-points').textContent = '0 / 5';
    document.getElementById('barista-time').textContent = '45s';
    
    resetBaristaCup();
    generateBaristaOrder();
    
    clearInterval(baristaTimer);
    baristaTimer = setInterval(() => {
        baristaTimeLeft--;
        const timeEl = document.getElementById('barista-time');
        if (timeEl) timeEl.textContent = `${baristaTimeLeft}s`;
        
        if (baristaTimeLeft <= 0) {
            clearInterval(baristaTimer);
            endBaristaGame(false);
        }
    }, 1000);
}

function generateBaristaOrder() {
    const cups = ['وسط', 'كبير'];
    const drinks = ['كلاسيك', 'برو', 'ماتشا'];
    const sugars = ['بدون', 'سكر وسط', 'زيادة'];
    const milks = ['milk', 'nomilk'];
    
    const cup = cups[Math.floor(Math.random() * cups.length)];
    const drink = drinks[Math.floor(Math.random() * drinks.length)];
    const sugar = sugars[Math.floor(Math.random() * sugars.length)];
    const milk = milks[Math.floor(Math.random() * milks.length)];
    
    baristaOrder = { cup, drink, sugar, milk };
    
    const orderTxt = `طلب الزبون: كوب ${cup} ${drink === 'ماتشا' ? 'ماتشا' : 'قهوة ' + drink}، ${sugar === 'بدون' ? 'بدون سكر' : sugar === 'سكر وسط' ? 'سكر وسط' : 'سكر زيادة'}، ${milk === 'milk' ? 'مع حليب 🥛' : 'بدون حليب ❌'}`;
    const orderEl = document.getElementById('barista-order-text');
    if (orderEl) orderEl.textContent = orderTxt;
}

function selectBaristaIngredient(type, value) {
    if (!baristaActive) return;
    baristaSelection[type] = value;
    updateBaristaCupUI();
    playTickSound();
}

function resetBaristaCup() {
    baristaSelection = { cup: null, drink: null, sugar: null, milk: null };
    updateBaristaCupUI();
}

function updateBaristaCupUI() {
    const cupEl = document.getElementById('barista-cup-display');
    if (!cupEl) return;
    
    const parts = [];
    if (baristaSelection.cup) parts.push(`🥤 حجم ${baristaSelection.cup}`);
    if (baristaSelection.drink) parts.push(`🧪 ${baristaSelection.drink}`);
    if (baristaSelection.sugar) parts.push(`🍬 سكر: ${baristaSelection.sugar}`);
    if (baristaSelection.milk) parts.push(baristaSelection.milk === 'milk' ? '🥛 حليب' : '💧 سادة');
    
    cupEl.textContent = parts.join(' + ') || 'كوب فارغ';
}

function submitBaristaOrder() {
    if (!baristaActive) return;
    
    const isCorrect = 
        baristaSelection.cup === baristaOrder.cup &&
        baristaSelection.drink === baristaOrder.drink &&
        baristaSelection.sugar === baristaOrder.sugar &&
        baristaSelection.milk === baristaOrder.milk;
        
    if (isCorrect) {
        baristaScore++;
        const ptsEl = document.getElementById('barista-points');
        if (ptsEl) ptsEl.textContent = `${baristaScore} / 5`;
        playSuccessSound();
        resetBaristaCup();
        
        if (baristaScore >= 5) {
            clearInterval(baristaTimer);
            endBaristaGame(true);
        } else {
            generateBaristaOrder();
        }
    } else {
        playAlarmSound();
        showToast('ترتيب التحضير غير صحيح! أعد المحاولة.');
        resetBaristaCup();
    }
}

function endBaristaGame(success) {
    baristaActive = false;
    const viewEl = document.getElementById('barista-game-view');
    const menuEl = document.getElementById('barista-menu-view');
    if (viewEl) viewEl.style.display = 'none';
    if (menuEl) menuEl.style.display = 'block';
    
    if (success) {
        playSuccessSound();
        triggerConfetti();
        showToast('تهانينا! لقد طهوت كبارستا محترف واستلمت كوب ماتشا مجاني!');
        
        cart.push({
            id: `matcha-barista-${Date.now()}`,
            productId: 'matcha',
            name: 'ماتشا ماهرة (مكافأة بارستا 🎮)',
            price: 0,
            image: 'matcha.jpg',
            options: { size: 'وسط', sugar: 'سكر وسط' },
            quantity: 1
        });
        updateCartUI();
        closeOSWindow('win-barista');
        
        localStorage.setItem(`maher_cooldown_${ACTIVE_EVENT}`, String(Date.now() + COOLDOWN_DURATION));
        setTimeout(checkCooldownState, 2000);
    } else {
        playSadChime();
        showToast('انتهى الوقت! فشلت في الوردية.');
    }
}

// ----------------------------------------------------------
// MaherOS 95 Latte Art Paint Logic
// ----------------------------------------------------------
let paintColor = '#3d2314';
let painting = false;
let paintCtx = null;

function initPaintCanvas() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) return;
    paintCtx = canvas.getContext('2d');
    clearPaintCanvas();
    
    const startDrawing = (e) => {
        painting = true;
        draw(e);
    };
    
    const stopDrawing = () => {
        painting = false;
        if (paintCtx) paintCtx.beginPath();
    };
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        painting = true;
        drawTouch(t.clientX - rect.left, t.clientY - rect.top);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        if (painting) drawTouch(t.clientX - rect.left, t.clientY - rect.top);
    });
    
    canvas.addEventListener('touchend', stopDrawing);
}

function setPaintColor(color, el) {
    paintColor = color;
    document.querySelectorAll('.paint-color').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    playTickSound();
}

function clearPaintCanvas() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas || !paintCtx) return;
    paintCtx.fillStyle = '#fdf6e2'; // Coffee Foam Base
    paintCtx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw(e) {
    if (!painting || !paintCtx) return;
    const canvas = document.getElementById('paint-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    paintCtx.lineWidth = 4;
    paintCtx.lineCap = 'round';
    paintCtx.strokeStyle = paintColor;
    
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
}

function drawTouch(x, y) {
    if (!painting || !paintCtx) return;
    paintCtx.lineWidth = 4;
    paintCtx.lineCap = 'round';
    paintCtx.strokeStyle = paintColor;
    
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
}

// ----------------------------------------------------------
// MaherOS 95 Retro Radio Synthesizer (Ambient Chords)
// ----------------------------------------------------------
let radioSynthInterval = null;
let synthCtx = null;

function toggleOSRadio() {
    const btn = document.getElementById('btn-radio-play');
    const displayEl = document.getElementById('radio-track-name');
    if (!btn || !displayEl) return;
    
    if (radioSynthInterval) {
        clearInterval(radioSynthInterval);
        radioSynthInterval = null;
        displayEl.textContent = '📻 راديو ماهر: مغلق 💤';
        btn.textContent = 'تشغيل ▶';
        playTickSound();
    } else {
        displayEl.textContent = '📻 يعزف الآن: ريترو لوفي روقان... ✨';
        btn.textContent = 'إيقاف ⏸';
        startRadioSynth();
    }
}

function startRadioSynth() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!synthCtx) synthCtx = new AudioContext();
    
    const notes = [
        [261.63, 329.63, 392.00], // C Maj
        [293.66, 349.23, 440.00], // D Min
        [329.63, 392.00, 493.88], // E Min
        [349.23, 440.00, 523.25]  // F Maj
    ];
    
    const playChord = () => {
        if (!radioSynthInterval) return;
        const chord = notes[Math.floor(Math.random() * notes.length)];
        chord.forEach(freq => {
            const osc = synthCtx.createOscillator();
            const gain = synthCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, synthCtx.currentTime);
            gain.gain.setValueAtTime(0.0, synthCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, synthCtx.currentTime + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, synthCtx.currentTime + 2.8);
            osc.connect(gain);
            gain.connect(synthCtx.destination);
            osc.start();
            osc.stop(synthCtx.currentTime + 3.0);
        });
    };
    
    radioSynthInterval = setInterval(playChord, 3000);
    playChord();
}

// ----------------------------------------------------------
// MaherOS 95 Secrets & Cheat Codes Interpreter
// ----------------------------------------------------------
let cheatBuffer = "";
window.addEventListener('keydown', (e) => {
    // Only register alphabetical letters
    if (e.key.length === 1 && /[a-zA-Z]/i.test(e.key)) {
        cheatBuffer += e.key.toUpperCase();
        if (cheatBuffer.length > 30) cheatBuffer = cheatBuffer.substring(cheatBuffer.length - 20);
        
        // Check cheat codes
        if (cheatBuffer.endsWith("MAHERMATCHAFREE")) {
            localStorage.removeItem('maher_matcha_redeemed');
            showToast('🗝️ تم تفعيل الغش: إعادة تفعيل كوب الماتشا المجاني!');
            playSuccessSound();
            triggerConfetti();
            checkCooldownState();
            cheatBuffer = "";
        } else if (cheatBuffer.endsWith("FASTCAR")) {
            chaseLives = 99;
            const livesEl = document.getElementById('chase-lives');
            if (livesEl) livesEl.textContent = '❤️ x99 (حياة لانهائية!)';
            showToast('🗝️ تم تفعيل الغش: سيارة خارقة وحياة لانهائية!');
            playSuccessSound();
            cheatBuffer = "";
        } else if (cheatBuffer.endsWith("BARISTAPASS")) {
            if (baristaActive) {
                baristaScore = 5;
                endBaristaGame(true);
                showToast('🗝️ تم تفعيل الغش: تخطي الوردية والربح الفوري!');
                cheatBuffer = "";
            }
        } else if (cheatBuffer.endsWith("LAUNCHNOW")) {
            localStorage.setItem('maher_launch_bypass', 'true');
            showToast('🗝️ تم تفعيل الغش: إطلاق الحدث فوراً وتخطي عداد الـ 24 ساعة!');
            playSuccessSound();
            triggerConfetti();
            setTimeout(() => location.reload(), 1500);
            cheatBuffer = "";
        } else if (cheatBuffer.endsWith("CMDKAHWAJIMAHER") || cheatBuffer.endsWith("CMDKAHWAJI MAHER")) {
            enableRetroComputerMenuTheme();
            cheatBuffer = "";
        }
    }
});

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
function checkGlobalCountdown() {
    const bannerEl = document.getElementById('prelaunch-timer-banner');
    const heroCdContainer = document.getElementById('hero-countdown-container');
    if (!bannerEl) return;
    
    if (typeof IS_EVENT_POSTPONED !== 'undefined' && IS_EVENT_POSTPONED) {
        bannerEl.style.display = 'block';
        bannerEl.style.background = '#8b0000';
        bannerEl.style.color = '#ffffff';
        bannerEl.style.textAlign = 'center';
        bannerEl.style.padding = '10px 15px';
        bannerEl.style.fontWeight = 'bold';
        bannerEl.innerHTML = `🛑 <strong>تنويه هام:</strong> ${POSTPONED_REASON} (التايمر مُجمّد ❄️)`;
        
        if (moodHeaderBanner) moodHeaderBanner.style.display = 'none';
        if (heroCdContainer) {
            heroCdContainer.style.display = 'flex';
            const titleEl = heroCdContainer.querySelector('.countdown-title');
            if (titleEl) {
                titleEl.innerHTML = `🛑 <strong>تم تجميد الوقت وتأجيل الحدث:</strong><br><span style="color: #ffeb3b; font-size: 1.1rem; display: block; margin-top: 5px;">${POSTPONED_REASON}</span>`;
            }
            const hoursEl = document.getElementById('cd-hours');
            const minutesEl = document.getElementById('cd-minutes');
            const secondsEl = document.getElementById('cd-seconds');
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
        }
        if (globalCountdownInterval) {
            clearInterval(globalCountdownInterval);
            globalCountdownInterval = null;
        }
        return;
    }

    if (!isEventLaunched()) {
        // Pre-launch state
        bannerEl.style.display = 'block';
        bannerEl.style.background = '';
        bannerEl.style.color = '';
        bannerEl.style.padding = '';
        if (moodHeaderBanner) moodHeaderBanner.style.display = 'none';
        if (heroCdContainer) {
            heroCdContainer.style.display = 'flex';
            const titleEl = heroCdContainer.querySelector('.countdown-title');
            if (titleEl) {
                titleEl.innerHTML = `🔥 أكبر حدث في تاريخ قهوجي ماهر ينطلق خلال:`;
            }
        }
        
        const updateBanner = () => {
            const timeRemaining = EVENT_LAUNCH_TIME - Date.now();
            if (timeRemaining <= 0) {
                clearInterval(globalCountdownInterval);
                location.reload();
                return;
            }
            
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
            
            const formattedHrs = String(hours).padStart(2, '0');
            const formattedMins = String(minutes).padStart(2, '0');
            const formattedSecs = String(seconds).padStart(2, '0');
            
            bannerEl.innerHTML = `⏳ ترقبوا! انطلاق أكبر حدث في تاريخ قهوجي ماهر خلال: ${formattedHrs}:${formattedMins}:${formattedSecs}`;
            
            // Update hero countdown digits
            const hoursEl = document.getElementById('cd-hours');
            const minutesEl = document.getElementById('cd-minutes');
            const secondsEl = document.getElementById('cd-seconds');
            if (hoursEl) hoursEl.textContent = formattedHrs;
            if (minutesEl) minutesEl.textContent = formattedMins;
            if (secondsEl) secondsEl.textContent = formattedSecs;
        };
        
        if (!globalCountdownInterval) {
            updateBanner();
            globalCountdownInterval = setInterval(updateBanner, 1000);
        }
    } else {
        // Post-launch state
        bannerEl.style.display = 'none';
        if (moodHeaderBanner) moodHeaderBanner.style.display = 'block';
        if (heroCdContainer) heroCdContainer.style.display = 'none';
    }
}

function initActiveEventHooks() {
    // Check countdown
    checkGlobalCountdown();
    
    // Determine local active event
    let currentEvent = ACTIVE_EVENT;
    if (ACTIVE_EVENT === 'matcha' && !isEventLaunched()) {
        currentEvent = 'none';
    }

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

    if (typeof IS_MENU_LOCKED !== 'undefined' && IS_MENU_LOCKED) {
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('disabled-mood');
            const btn = card.querySelector('.btn-add-cart');
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-lock"></i> المنيو مغلق';
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            }
            const inputs = card.querySelectorAll('input, select');
            inputs.forEach(inp => inp.disabled = true);
        });

        const menuSection = document.getElementById('menu');
        if (menuSection) {
            const sectionHeader = menuSection.querySelector('.section-header');
            if (sectionHeader && !document.getElementById('menu-locked-notice')) {
                const banner = document.createElement('div');
                banner.id = 'menu-locked-notice';
                banner.style.cssText = 'background: rgba(139, 0, 0, 0.95); color: #fff; padding: 14px 20px; border-radius: 12px; margin: 15px auto 0; max-width: 600px; font-weight: bold; border: 2px solid #ff4444; font-size: 1.05rem; text-align: center; box-shadow: 0 4px 15px rgba(255,0,0,0.3); font-family: var(--font-arabic);';
                banner.innerHTML = `🔒 <strong>المنيو مقفل:</strong> قهوجي ماهر غير متواجد اليوم 😴`;
                sectionHeader.appendChild(banner);
            }
        }
    }

    // Reset escape counts
    cupEscapeCounts = { classic: 0, pro: 0, superpro: 0, juice: 0 };

    // Set Header Banner
    if (moodHeaderBanner) {
        if (currentEvent === 'none') {
            moodHeaderBanner.className = 'mood-header-banner success-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-mug-hot"></i> حالة المتجر: المعلم ماهر يروق ويصنع لكم القهوة بكل حب! الطلب متاح كالمعتاد.';
        } else if (currentEvent === 'anger') {
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
            
        } else if (currentEvent === 'luck_wheel') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-circle-check"></i> بشرى سارة: قهوجي ماهر قبل الاعتذار ورجّع لكم الموقع طبيعي! جرب حظك الآن عبر الكمبيوتر القديم 🎰';
        } else if (currentEvent === 'cup_strike') {
            moodHeaderBanner.className = 'mood-header-banner warning-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-face-frown-open"></i> الحدث النشط: إضراب فناجين القهوة! الأزرار لا تستجيب بسهولة، تفاهم معهم عبر الكمبيوتر القديم ☕';
            setupFleeingButtons();
            
        } else if (currentEvent === 'lie_detector') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-user-secret"></i> الحدث النشط: جهاز كشف كذب محبي القهوة! تفضل بالفحص عبر الكمبيوتر القديم واربح كوب سوبر برو مجاني! 🤥';
        } else if (currentEvent === 'maher_vacation') {
            moodHeaderBanner.className = 'mood-header-banner success-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-chart-line"></i> الحدث النشط: إجازة المعلم ماهر وبورصة القهوة! الأسعار تتذبذب كل 5 ثوانٍ، تتبع الكمبيوتر للشراء بأفضل سعر! 📈';
            startPriceFluctuation();
            
        } else if (currentEvent === 'grind_challenge') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-gauge-high"></i> الحدث النشط: تحدي طحن حبوب البن السريع! ادخل عبر الكمبيوتر القديم واطحن واربح قهوتك مجاناً! ⚙️';
        } else if (currentEvent === 'neon_magic') {
            moodHeaderBanner.className = 'mood-header-banner';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> الحدث النشط: خلطة قهوة ماهر السحرية المضيئة! استمتع بوضع النيون الليلي الخارق وجرب الماوس 🔮';
            document.body.classList.add('neon-magic-active');
            setupNeonParticles();
        } else if (currentEvent === 'thief') {
            moodHeaderBanner.className = 'mood-header-banner danger-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> الحدث النشط: سارق القهوة يتجول في المتجر! إذا سرق سلتك, اقبض عليه بالكمبيوتر القديم! 🚓🥷';
        } else if (currentEvent === 'matcha') {
            moodHeaderBanner.className = 'mood-header-banner success-mood';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-leaf"></i> الحدث النشط: بدء أكبر حدث قهوجي ماهر 95! 🍵 الماتشا وسوبر برو مجاناً بالكامل! اطلب كوبك الآن! 💚';
            
            // Dynamic UI update for Super Pro and Matcha price cards to show free
            const superProCard = document.querySelector('.product-card[data-id="superpro"]');
            if (superProCard) {
                const priceEl = superProCard.querySelector('.product-price');
                if (priceEl) {
                    priceEl.innerHTML = `مجاناً <span class="old-price" style="text-decoration: line-through; color: #777; font-size: 0.95rem; margin-right: 5px;">5 ر.س</span> <span class="price-suffix">/ كوب</span>`;
                }
            }
            const matchaCard = document.querySelector('.product-card[data-id="matcha"]');
            if (matchaCard) {
                const priceEl = matchaCard.querySelector('.product-price');
                if (priceEl) {
                    priceEl.innerHTML = `مجاناً <span class="old-price" style="text-decoration: line-through; color: #777; font-size: 0.95rem; margin-right: 5px;">6 ر.س</span> <span class="price-suffix">/ كوب</span>`;
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


