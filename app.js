// ==========================================
// MAHER MOOD SYSTEM
// Options: 'angry' (غاضب) | 'moderate' (متوسط) | 'happy' (سعيد)
// ==========================================
const MAHER_MOOD = 'angry'; 

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

// Retro Event Elements
const retroCompBtn = document.getElementById('retro-computer-btn');
const retroEventModal = document.getElementById('retro-event-modal');
const retroModalOverlay = document.getElementById('retro-modal-overlay');
const closeRetroModal = document.getElementById('close-retro-modal');
const retroBtnOk = document.getElementById('retro-btn-ok');
const moodHeaderBanner = document.getElementById('mood-header-banner');
const moodDescBox = document.getElementById('mood-desc-box');

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
    if (MAHER_MOOD === 'angry') {
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
    // Check mood restrictions
    if (MAHER_MOOD === 'angry') {
        triggerAlarm("عذراً! لا يمكنك الطلب الآن لأن قهوجي ماهر غاضب! 😡");
        return;
    }
    if (MAHER_MOOD === 'moderate' && productId === 'classic') {
        triggerAlarm("عذراً! القهوة المجانية غير متاحة حالياً لأن مزاج قهوجي ماهر متوسط! 😐");
        return;
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
// Retro Computer Widget & Mood Setup
// ==========================================================================

function initMaherMood() {
    // Reset all card states and texts
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('disabled-mood');
        const btn = card.querySelector('.btn-add-cart');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> إضافة للسلة';
    });
    
    // Remove active state from LEDs
    const ledBars = ['led-happy', 'led-moderate', 'led-angry'];
    ledBars.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    const ledHappy = document.getElementById('led-happy');
    const ledModerate = document.getElementById('led-moderate');
    const ledAngry = document.getElementById('led-angry');
    
    if (MAHER_MOOD === 'angry') {
        if (ledAngry) ledAngry.classList.add('active');
        if (moodDescBox) {
            moodDescBox.innerHTML = `
                <div style="color: #ff3333; font-weight: bold; margin-bottom: 5px;"><i class="fa-solid fa-circle-exclamation"></i> غضب عارم 😡</div>
                <div>قهوجي ماهر غاضب جداً اليوم لأن في شخص سوى قهوة للبيت غيره! جميع أزرار الطلب معطلة حالياً.</div>
            `;
        }
        if (moodHeaderBanner) {
            moodHeaderBanner.className = 'mood-header-banner mood-angry';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> تنبيه: جميع الطلبات معطلة لأن في شخص سوى قهوة للبيت غير ماهر! 😡';
        }
        
        // Disable all product cards visually
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('disabled-mood');
            const btn = card.querySelector('.btn-add-cart');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-ban"></i> الطلبات معطلة حالياً';
        });
    } else if (MAHER_MOOD === 'moderate') {
        if (ledModerate) ledModerate.classList.add('active');
        if (moodDescBox) {
            moodDescBox.innerHTML = `
                <div style="color: #d47a00; font-weight: bold; margin-bottom: 5px;"><i class="fa-solid fa-circle-info"></i> مزاج متوسط 😐</div>
                <div>قهوجي ماهر في مزاج متوسط. يسمح بطلب المشروبات المدفوعة كالمعتاد، ولكن القهوة المجانية (العادي) مغلقة حالياً.</div>
            `;
        }
        if (moodHeaderBanner) {
            moodHeaderBanner.className = 'mood-header-banner mood-moderate';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-circle-info"></i> تنبيه: قهوجي ماهر في مزاج متوسط. القهوة المجانية غير متاحة حالياً 😐';
        }
        
        // Disable only classic (free) card
        const classicCard = document.querySelector('.product-card[data-id="classic"]');
        if (classicCard) {
            classicCard.classList.add('disabled-mood');
            const btn = classicCard.querySelector('.btn-add-cart');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-ban"></i> غير متاح حالياً';
        }
    } else {
        // Happy
        if (ledHappy) ledHappy.classList.add('active');
        if (moodDescBox) {
            moodDescBox.innerHTML = `
                <div style="color: #28a745; font-weight: bold; margin-bottom: 5px;"><i class="fa-solid fa-circle-check"></i> سعيد ومروّق 😊</div>
                <div>قهوجي ماهر سعيد اليوم ويرحب بجميع طلباتكم كالمعتاد. القهوة المجانية متاحة للجميع بالصحة والعافية!</div>
            `;
        }
        if (moodHeaderBanner) {
            moodHeaderBanner.className = 'mood-header-banner mood-happy';
            moodHeaderBanner.innerHTML = '<i class="fa-solid fa-circle-check"></i> بشرى سارة: قهوجي ماهر سعيد اليوم! المتجر يعمل بشكل طبيعي والقهوة المجانية متاحة 😊';
        }
    }
}

// Retro Modal Events
if (retroCompBtn) {
    retroCompBtn.addEventListener('click', () => {
        if (retroEventModal) retroEventModal.classList.add('open');
        if (retroModalOverlay) retroModalOverlay.classList.add('open');
    });
}

function closeRetroModalFn() {
    if (retroEventModal) retroEventModal.classList.remove('open');
    if (retroModalOverlay) retroModalOverlay.classList.remove('open');
}

if (closeRetroModal) closeRetroModal.addEventListener('click', closeRetroModalFn);
if (retroBtnOk) retroBtnOk.addEventListener('click', closeRetroModalFn);
if (retroModalOverlay) retroModalOverlay.addEventListener('click', closeRetroModalFn);

// Initialize Mood System
initMaherMood();

// Clean existing cart if mood is restrictive
if (MAHER_MOOD === 'angry') {
    cart = [];
    updateCartUI();
} else if (MAHER_MOOD === 'moderate') {
    cart = cart.filter(item => item.productId !== 'classic');
    updateCartUI();
}


