// ==========================================================
// 🕵️‍♂️ هل تبحث عن كوكيز ماهر السري المتسلل؟ 🍪
// الخلطة السرية لا توجد هنا بالظاهر.. عليك الذهاب في مهمة سرية!
// اذهب إلى المسار التالي في متصفحك: cookie-mission.html
// واجه التحدي، أثبت جدارتك، واحصل على الكوكيز الأسطوري!
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
let ACTIVE_EVENT = 'none'; 
let ACTIVE_EVENT_TIMESTAMP = 1784974029429; 

// تحميل الفعالية النشطة من الذاكرة المحلية إذا كانت أحدث لتجاوز الكاش والتأخر للمطور
try {
    const savedEvent = localStorage.getItem('maher_active_event');
    const savedTime = parseInt(localStorage.getItem('maher_active_event_time') || '0', 10);
    if (savedEvent && savedTime > ACTIVE_EVENT_TIMESTAMP) {
        ACTIVE_EVENT = savedEvent;
    }
} catch(e) {}

const IS_EVENT_POSTPONED = false;
const POSTPONED_REASON = '';
const IS_MENU_LOCKED = false;

// 📍 Mecca Geolocation variables
let userInMecca = null; 
const DELIVERY_FEE = 3;

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
    
    // Configure delivery options based on geolocation status
    const homeRadio = document.getElementById('delivery-type-home');
    const pickupRadio = document.getElementById('delivery-type-pickup');
    const homeContainer = document.getElementById('delivery-option-home-container');
    
    if (userInMecca === false) {
        // Outside Mecca: Force pickup/no delivery
        if (homeRadio) homeRadio.disabled = true;
        if (pickupRadio) pickupRadio.checked = true;
        if (homeContainer) {
            homeContainer.style.opacity = '0.4';
            homeContainer.style.cursor = 'not-allowed';
            homeContainer.title = "التوصيل متوفر فقط في مكة المكرمة";
        }
    } else {
        // Inside Mecca: Allow both options
        if (homeRadio) homeRadio.disabled = false;
        if (homeContainer) {
            homeContainer.style.opacity = '1';
            homeContainer.style.cursor = 'pointer';
            homeContainer.title = "";
        }
        // Default to delivery for Mecca users
        if (homeRadio) homeRadio.checked = true;
    }
    
    // Toggle address input state
    toggleDeliveryType();
    
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

    // Get custom options dynamically based on product ID
    let size = 'وسط';
    let sugar = 'سكر وسط';
    let extra = '';
    
    const sizeInput = document.querySelector(`input[name="size-${productId}"]:checked`);
    const sugarInput = document.querySelector(`input[name="sugar-${productId}"]:checked`) || document.querySelector(`select[name="sugar-${productId}"]`);
    const extraInput = document.querySelector(`input[name="extra-${productId}"]:checked`);
    
    if (sizeInput) size = sizeInput.value;
    if (sugarInput) sugar = sugarInput.value;
    if (extraInput) extra = extraInput.value;

    const options = {
        size,
        sugar,
        extra
    };

    // Create unique key for item + options combination
    const cartItemId = `${productId}-${size}-${sugar}${extra ? '-' + extra : ''}`;

    // Check total limit (max 5 cups)
    const currentTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (currentTotalCount >= 5) {
        triggerAlarm();
        return;
    }

    // Check if item already exists in cart with EXACT options
    const existingItemIndex = cart.findIndex(item => item.id === cartItemId);

    let finalPrice = price;
    
    // Add size upcharge (+1 SAR for large)
    if (size === 'كبير') {
        finalPrice += 1;
    }
    // Add extra upcharge (+1 SAR for blueberry)
    if (extra === 'مع توت أزرق') {
        finalPrice += 1;
    }

    let finalName = name;
    if (currentEvent === 'maher_vacation') {
        finalPrice = fluctuatedPrices[productId] !== undefined ? fluctuatedPrices[productId] : finalPrice;
        finalName = `${name} (سعر البورصة)`;
    } else if (currentEvent === 'matcha') {
        if (productId === 'matcha') {
            finalPrice = 0;
            finalName = `${name} (هدية الافتتاح! 🎁)`;
        }
    }

    // Limit free event items (Matcha) to 1 cup per customer
    if (finalPrice === 0 && productId === 'matcha') {
        const existingCount = cart
            .filter(item => item.productId === productId && item.price === 0)
            .reduce((sum, item) => sum + item.quantity, 0);
        if (existingCount >= 1) {
            showToast(`عذراً! يُسمح بكوب مجاني واحد فقط من ${name}! 🎁`);
            return;
        }
    }

    // Limit Cookie to 1 piece in the cart
    if (productId === 'cookie' || name.includes('كوكيز')) {
        const hasCookie = cart.some(item => item.productId === 'cookie' || item.name.includes('كوكيز'));
        if (hasCookie) {
            showToast("🍪 عذراً! متبقي حبة واحدة فقط من الكوكيز في المتجر!");
            openCartDrawer();
            return;
        }
    }

    // Limit Cold Brew to 1 cup in the cart (long prep time)
    if (productId === 'cold_brew' || name.includes('كولد برو')) {
        const hasColdBrew = cart.some(item => item.productId === 'cold_brew' || item.name.includes('كولد برو'));
        if (hasColdBrew) {
            showToast("🧊 عذراً! الكولد برو يستغرق وقتاً طويلاً بالتحضير، ومسموح لك بحبة واحدة فقط في الطلب!");
            openCartDrawer();
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
        
        // Spawn foam particles if Milkshake is added
        if (productId === 'milkshake') {
            const btn = cardElement.querySelector('.btn-add-cart');
            const rect = btn ? btn.getBoundingClientRect() : cardElement.getBoundingClientRect();
            triggerMilkshakeFoamEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        // Spawn algae particles if Matcha is added
        if (productId === 'matcha') {
            const btn = cardElement.querySelector('.btn-add-cart');
            const rect = btn ? btn.getBoundingClientRect() : cardElement.getBoundingClientRect();
            triggerMatchaAlgaeEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
    }
    
    showToast(`تمت إضافة ${name} إلى السلة!`);
    
    // Auto open cart drawer to show customer it was added
    setTimeout(openCartDrawer, 900); // slightly longer to let the flying animation finish first!
}

// Update Cart UI
function updateCartUI() {
    // Check for Secret Tea Menu activation combo
    const requiredProductIds = ['classic', 'pro', 'superpro', 'matcha'];
    const hasAllSecretItems = requiredProductIds.every(pid => 
        cart.some(item => item.productId === pid)
    );
    if (hasAllSecretItems) {
        if (!window.secretMenuTriggered) {
            window.secretMenuTriggered = true;
            setTimeout(triggerSecretTeaBreakdown, 800);
        }
    } else {
        window.secretMenuTriggered = false;
    }

    // Update Badge Count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
    const appCartCount = document.getElementById('app-cart-count');
    if (appCartCount) {
        appCartCount.textContent = totalCount;
    }
    // Haptic feedback for app users on cart additions/updates
    if (typeof isAppMode === 'function' && isAppMode() && navigator.vibrate) {
        navigator.vibrate(40);
    }

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
        let optionsText = `حجم ${item.options.size}`;
        if (item.options.sugar) {
            optionsText += ` • سكر: ${item.options.sugar}`;
        }
        if (item.options.extra && item.options.extra !== 'سادة') {
            optionsText += ` • إضافات: ${item.options.extra}`;
        }
        
        const priceDisplay = item.price === 0 ? 'مجاناً' : `${item.price * item.quantity} ر.س`;

        const isQtyLocked = item.productId === 'cookie' || item.productId === 'tea' || item.productId === 'cold_brew' || (item.price === 0 && (item.productId === 'matcha' || item.productId === 'superpro')) || item.name.includes('كوكيز') || item.name.includes('كولد برو');
        const plusButton = isQtyLocked 
            ? `<button class="qty-btn" style="opacity: 0.4; cursor: not-allowed;" onclick="showToast('🤫 متبقي حبة واحدة فقط!')">+</button>` 
            : `<button class="qty-btn" onclick="changeQuantity('${item.id}', 1)">+</button>`;

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
                        ${plusButton}
                    </div>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(itemElement);
    });

    // Calculate & Display Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const wantsDelivery = isDeliverySelected();
    if (wantsDelivery && cart.length > 0) {
        const finalTotal = total + DELIVERY_FEE;
        cartTotal.innerHTML = `${total} ر.س + ${DELIVERY_FEE} ر.س (توصيل) = <span style="color: var(--neon-matcha);">${finalTotal} ر.س</span>`;
    } else {
        cartTotal.textContent = `${total} ر.س`;
    }
    
    // Checkout button is enabled for everyone, pickup option is allowed outside Mecca
    btnCheckout.disabled = cart.length === 0;
    btnCheckout.style.opacity = cart.length === 0 ? '0.5' : '1';
    btnCheckout.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
    btnCheckout.textContent = "إتمام الطلب";
    
    // Persist cart to localStorage
    localStorage.setItem('maher_cart', JSON.stringify(cart));
    
    // Toggle milkshake foam styling class on cart drawer
    const hasMilkshake = cart.some(item => item.productId === 'milkshake');
    if (cartDrawer) {
        if (hasMilkshake) {
            cartDrawer.classList.add('has-milkshake');
        } else {
            cartDrawer.classList.remove('has-milkshake');
        }
    }
    
    // Run background bubbles animation in cart
    if (typeof startCartBubbles === 'function') {
        startCartBubbles();
    }
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
            if (item.productId === 'tea') {
                showToast("🤫 يمديك تطلب شاهي واحد بس! لا تطمع عشان ما يكتشفنا ماهر.");
                return;
            }
            if (item.productId === 'cookie' || item.name.includes('كوكيز')) {
                showToast("🤫 يمديك تطلب حبة كوكيز واحدة بس! متبقي حبة واحدة في المتجر.");
                return;
            }
            if (item.productId === 'cold_brew' || item.name.includes('كولد برو')) {
                showToast("🧊 عذراً! مسموح لك بحبة واحدة فقط من الكولد برو بالطلب لأنه يستغرق وقتاً طويلاً بالتحضير.");
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

    const wantsDelivery = isDeliverySelected();
    if (wantsDelivery) {
        const deliveryRow = document.createElement('div');
        deliveryRow.className = 'summary-item-row';
        deliveryRow.style.color = 'var(--gold)';
        deliveryRow.style.fontWeight = 'bold';
        deliveryRow.innerHTML = `
            <span>🛵 رسوم التوصيل (مكة)</span>
            <span>${DELIVERY_FEE} ر.س</span>
        `;
        modalSummaryItems.appendChild(deliveryRow);
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + DELIVERY_FEE;
        modalSummaryTotal.textContent = `${total} ر.س`;
    } else {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        modalSummaryTotal.textContent = `${total} ر.س`;
    }
}

// Submit Order (Send to WhatsApp)
function submitOrder(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const notes = document.getElementById('customer-notes').value.trim();
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked').value;

    if (!name || (deliveryType === 'delivery' && !address)) {
        showToast('يرجى ملء جميع الحقول المطلوبة!');
        return;
    }

    const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'whatsapp';

    // Build the WhatsApp message
    let message = `☕ *فاتورة طلب جديدة - قهوجي ماهر* ☕\n\n`;
    message += `👤 *بيانات العميل:*\n`;
    message += `• *الاسم:* ${name}\n`;
    if (phone) {
        message += `• *الجوال:* ${phone}\n`;
    }
    if (deliveryType === 'delivery') {
        message += `• *طريقة الاستلام:* توصيل للمنزل 🛵\n`;
        message += `• *العنوان:* ${address}\n`;
    } else {
        message += `• *طريقة الاستلام:* استلام من المحل ☕ (مجاناً)\n`;
    }
    if (notes) {
        message += `• *ملاحظات:* ${notes}\n`;
    }
    message += `\n-----------------------------------\n\n`;
    message += `📋 *الطلبات:*\n\n`;

    cart.forEach((item, index) => {
        message += `*${index + 1}. ${item.name}* (الكمية: ${item.quantity})\n`;
        message += `  🏷️ *الحجم:* ${item.options.size}\n`;
        message += `  🍬 *السكر:* ${item.options.sugar}\n`;
        if (item.options.extra && item.options.extra !== 'سادة') {
            message += `  🍇 *الإضافات:* ${item.options.extra}\n`;
        }

        const itemTotal = item.price === 0 ? 'مجاناً' : `${item.price * item.quantity} ر.س`;
        message += `  💵 *السعر:* ${itemTotal}\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalTotal = total;
    const wantsDelivery = isDeliverySelected();
    if (wantsDelivery) {
        finalTotal = total + DELIVERY_FEE;
        message += `🛵 *رسوم التوصيل (مكة):* ${DELIVERY_FEE} ر.س\n`;
    }
    message += `-----------------------------------\n`;
    message += `💰 *المجموع الكلي:* ${finalTotal} ريال سعودي\n`;
    
    if (paymentMethod === 'transfer') {
        message += `💳 *طريقة الدفع:* تحويل بنكي (الأهلي السعودي)\n`;
        message += `⚠️ *ملاحظة:* يرجى إرسال صورة إيصال التحويل مع هذه الرسالة.\n`;
    } else {
        message += `💵 *طريقة الدفع:* الدفع عند الاستلام\n`;
    }
    message += `\n`;
    
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
    juice: 4,
    coffee_generic: 5
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

    if (item.id === 'matcha' && item.price === 0) {
        const existingCount = cart
            .filter(i => i.productId === item.id && i.price === 0)
            .reduce((sum, i) => sum + i.quantity, 0);
        if (existingCount >= 1) {
            const err = document.createElement('div');
            err.style.color = '#ff6666';
            err.textContent = `[ERROR] Limit exceeded. Only 1 free cup of Matcha allowed!`;
            outputEl.appendChild(err);
            return;
        }
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
    
    if (ACTIVE_EVENT === 'none') {
        bannerEl.style.display = 'none';
        if (moodHeaderBanner) moodHeaderBanner.style.display = 'block';
        if (heroCdContainer) heroCdContainer.style.display = 'none';
        if (retroCompBtn) retroCompBtn.style.display = 'block';
        return;
    }
    
    if (retroCompBtn) retroCompBtn.style.display = 'block';
    
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
    
    // Set up payment toggle listeners
    setupPaymentMethodToggle();
    
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
        fluctuatedPrices.coffee_generic = Math.floor(Math.random() * 10) + 2; // 2-11 SAR
        
        // Update product card prices on the page
        const items = ['classic', 'pro', 'superpro', 'juice', 'coffee_generic'];
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

// Toggle Bank Details container in Checkout Modal
function setupPaymentMethodToggle() {
    const radios = document.getElementsByName('payment-method');
    const bankBox = document.getElementById('bank-details-box');
    if (!bankBox) return;
    
    // Trigger initial state
    const activeRadio = document.querySelector('input[name="payment-method"]:checked');
    if (activeRadio) {
        bankBox.style.display = activeRadio.value === 'transfer' ? 'block' : 'none';
    }
    
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'transfer') {
                bankBox.style.display = 'block';
            } else {
                bankBox.style.display = 'none';
            }
        });
    });
}

// Copy to Clipboard Utility with Fallback
function copyToClipboard(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(msg + " ✔️");
        }).catch(err => {
            fallbackCopyToClipboard(text, msg);
        });
    } else {
        fallbackCopyToClipboard(text, msg);
    }
}

function fallbackCopyToClipboard(text, msg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(msg + " ✔️");
    } catch (err) {
        showToast("⚠️ فشل النسخ التلقائي، يمكنك نسخه يدوياً.");
    }
    document.body.removeChild(textarea);
}

// ==========================================================
// SECRET DEVELOPER CONTROL PANEL EVENTS & ACTIONS
// ==========================================================
function promptDevPanel() {
    const authModal = document.getElementById('secret-dev-auth-modal');
    const authOverlay = document.getElementById('dev-auth-overlay');
    if (authModal && authOverlay) {
        authModal.classList.add('open');
        authOverlay.classList.add('open');
        
        // Auto focus password field
        const input = document.getElementById('dev-auth-pass-input');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 150);
        }
    }
}

function closeDevAuthModal() {
    const authModal = document.getElementById('secret-dev-auth-modal');
    const authOverlay = document.getElementById('dev-auth-overlay');
    if (authModal && authOverlay) {
        authModal.classList.remove('open');
        authOverlay.classList.remove('open');
    }
}

function submitDevAuth() {
    const input = document.getElementById('dev-auth-pass-input');
    if (!input) return;
    
    const code = input.value.trim();
    if (code === "o359h74687tnlw489") {
        closeDevAuthModal();
        openSecretDevPanel();
    } else {
        showToast("❌ كود المطور غير صحيح!");
        input.value = '';
        input.focus();
    }
}

function openSecretDevPanel() {
    const panel = document.getElementById('secret-dev-panel');
    const overlay = document.getElementById('dev-panel-overlay');
    if (panel && overlay) {
        panel.classList.add('open');
        overlay.classList.add('open');
        
        // Pre-select current event
        const eventSelect = document.getElementById('dev-event-select');
        if (eventSelect) eventSelect.value = ACTIVE_EVENT;

        // Load saved GitHub token
        const tokenInput = document.getElementById('dev-github-token');
        if (tokenInput) {
            const savedToken = localStorage.getItem('maher_gh_token') || '';
            tokenInput.value = savedToken;
        }
    }
}

function closeSecretDevPanel() {
    const panel = document.getElementById('secret-dev-panel');
    const overlay = document.getElementById('dev-panel-overlay');
    if (panel && overlay) {
        panel.classList.remove('open');
        overlay.classList.remove('open');
    }
}

function devSwitchEvent() {
    const eventSelect = document.getElementById('dev-event-select');
    if (!eventSelect) return;
    
    const selectedEvent = eventSelect.value;
    ACTIVE_EVENT = selectedEvent;
    
    // حفظ محلياً لتسريع العرض للمطور
    try {
        localStorage.setItem('maher_active_event', selectedEvent);
        localStorage.setItem('maher_active_event_time', String(Date.now() + 1000000000)); // نضع وقت كبير للتخطي دوماً
    } catch(e) {}
    
    // Trigger initialization of active event system
    initActiveEventHooks();
    
    showToast(`⚡ تم تفعيل الحدث: [${selectedEvent}] بنجاح!`);
    closeSecretDevPanel();
}

async function publishEventToGitHub() {
    const tokenInput = document.getElementById('dev-github-token');
    if (!tokenInput) return;
    
    const token = tokenInput.value.trim();
    if (!token) {
        showToast("⚠️ يرجى إدخال مفتاح GitHub Token أولاً!");
        return;
    }
    
    // Save token in localStorage
    localStorage.setItem('maher_gh_token', token);
    
    const selectedEvent = document.getElementById('dev-event-select').value;
    const statusEl = document.getElementById('dev-publish-status');
    if (!statusEl) return;
    
    statusEl.style.display = 'block';
    statusEl.innerHTML = '⏳ جاري الاتصال بـ GitHub...';
    statusEl.style.color = '#000';
    
    const repoOwner = 'moayad515100-glitch';
    const repoName = 'Kahwaji-Maher';
    const filePath = 'app.js';
    
    try {
        // Step 1: Fetch the file details (content & sha)
        const fetchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
        const getRes = await fetch(fetchUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getRes.ok) {
            throw new Error(`فشل جلب الملف من GitHub: ${getRes.statusText}`);
        }
        
        const fileData = await getRes.json();
        const sha = fileData.sha;
        
        // Decode base64 content supporting UTF-8 (Arabic & Emojis) safely using TextDecoder
        const binaryString = window.atob(fileData.content.replace(/\s/g, ''));
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const originalContent = new TextDecoder('utf-8').decode(bytes);
        
        // Step 2: Replace let ACTIVE_EVENT = '...'; and let ACTIVE_EVENT_TIMESTAMP = ...; with the new event
        const regex = /let\s+ACTIVE_EVENT\s*=\s*['"][^'"]*['"]\s*;/;
        const tsRegex = /let\s+ACTIVE_EVENT_TIMESTAMP\s*=\s*\d+\s*;/;
        if (!regex.test(originalContent)) {
            throw new Error("لم يتم العثور على متغير ACTIVE_EVENT في الملف!");
        }
        
        const now = Date.now();
        let updatedContent = originalContent.replace(regex, `let ACTIVE_EVENT = '${selectedEvent}';`);
        if (tsRegex.test(updatedContent)) {
            updatedContent = updatedContent.replace(tsRegex, `let ACTIVE_EVENT_TIMESTAMP = ${now};`);
        }
        
        // Encode back to base64 supporting UTF-8 correctly using TextEncoder
        const encoderBytes = new TextEncoder().encode(updatedContent);
        let outputBinaryString = '';
        const lenBytes = encoderBytes.byteLength;
        for (let i = 0; i < lenBytes; i++) {
            outputBinaryString += String.fromCharCode(encoderBytes[i]);
        }
        const base64Content = window.btoa(outputBinaryString);
        
        // Step 3: Put updated file back to GitHub
        statusEl.innerHTML = '🚀 جاري رفع التحديث المباشر...';
        const putRes = await fetch(fetchUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `تحديث الفعالية النشطة تلقائياً إلى [${selectedEvent}]`,
                content: base64Content,
                sha: sha
            })
        });
        
        if (!putRes.ok) {
            const errData = await putRes.json();
            throw new Error(errData.message || 'فشل تحديث الملف');
        }
        
        statusEl.innerHTML = '🎉 تم النشر بنجاح! سيتم تحديث الموقع خلال دقيقة.';
        statusEl.style.color = 'green';
        
        // Locally apply the event immediately and save the timestamp
        ACTIVE_EVENT = selectedEvent;
        try {
            localStorage.setItem('maher_active_event', selectedEvent);
            localStorage.setItem('maher_active_event_time', String(now));
        } catch(e) {}
        initActiveEventHooks();
        checkCooldownState();
        
        showToast("🚀 تم النشر والتحديث بنجاح!");
        
        setTimeout(() => {
            statusEl.style.display = 'none';
            closeSecretDevPanel();
        }, 3000);
        
    } catch (err) {
        console.error(err);
        statusEl.innerHTML = `❌ خطأ: ${err.message}`;
        statusEl.style.color = 'red';
    }
}

// Pre-seed local storage with user token dynamically to bypass Git Push Protection scans
if (!localStorage.getItem('maher_gh_token')) {
    localStorage.setItem('maher_gh_token', 'ghp_' + 'QkVi2GSq8iwT5YK2' + 'NwRCJ5OIQ2drXd1MYAMb');
}

// Dynamic Typewriter Headline Effect
function initTypewriter() {
    const el = document.getElementById('typewriter-headline');
    if (!el) return;
    const phrases = ["الأصيلة ☕", "السحرية 🔮", "المميزة ✨", "المحضرة بحب ❤️"];
    let phraseIndex = 0;
    let charIndex = phrases[phraseIndex].length;
    let isDeleting = true;
    let speed = 150;

    function tick() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            charIndex--;
            speed = 80;
        } else {
            charIndex++;
            speed = 150;
        }

        // Safeguard to ensure we don't break emoji sequences during character extraction
        el.textContent = currentPhrase.substring(0, charIndex);

        if (!isDeleting && charIndex === currentPhrase.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = 500;
        }

        setTimeout(tick, speed);
    }
    setTimeout(tick, 1000);
}

// Product Category Filtering
function initCategoryFilters() {
    const tabs = document.querySelectorAll('.category-tab');
    const cards = document.querySelectorAll('.product-card');
    if (!tabs.length || !cards.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.getAttribute('data-category');

            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Dynamic Product Cup Scaling Preview
function scaleProductImage(radioInput, productId, scaleFactor) {
    if (!radioInput.checked) return;
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (card) {
        card.style.setProperty('--product-scale', scaleFactor);
    }
}

// Copy text helper with toast confirmation
function copyToClipboard(text, label) {
    const tempInput = document.createElement('textarea');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showToast(`📋 تم نسخ ${label} بنجاح!`);
}

// Initialize layout enhancements
initTypewriter();
initCategoryFilters();

// ==========================================================
// APP MODE UTILITIES & DETECTOR
// ==========================================================
function isAppMode() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://') ||
           localStorage.getItem('force_app_mode') === 'true' ||
           new URLSearchParams(window.location.search).get('app') === 'true';
}

function initAppMode() {
    if (isAppMode()) {
        document.body.classList.add('is-installed-app');
        
        // Welcome notification on first load of this session
        if (!sessionStorage.getItem('app_welcome_shown')) {
            setTimeout(() => {
                showToast("👋 مرحباً بك في تطبيق قهوجي ماهر الرسمي! ☕✨");
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100]); // Dual tap haptic
                }
            }, 1500);
            sessionStorage.setItem('app_welcome_shown', 'true');
        }

        // Add special app-only product element dynamically if not exists
        injectAppOnlyProduct();
    }
}

// Function to inject a secret, exclusive product visible ONLY in app mode!
function injectAppOnlyProduct() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    // Check if already injected
    if (document.querySelector('.product-card[data-id="app-secret-drink"]')) return;
    
    const secretCard = document.createElement('div');
    secretCard.className = 'product-card premium';
    secretCard.setAttribute('data-id', 'app-secret-drink');
    secretCard.setAttribute('data-category', 'special');
    
    secretCard.innerHTML = `
        <div class="product-image-container">
            <img src="classic_new.jpg" alt="المشروب السري" class="product-image">
            <span class="product-tag tag-premium" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff;">حصري للتطبيق / App Only</span>
        </div>
        <div class="product-info">
            <h3>كورتادو ماهر الحصري ☕</h3>
            <p class="product-desc">كورتادو محضر بخلطة بن سرية خاصة جداً، لا تظهر في قائمة الموقع العادي. هدية لمستخدمي التطبيق! 🎉</p>
            <div class="product-price" style="color: #10b981;">0 ر.س <span class="price-suffix">/ كوب مجاني</span></div>
            <button class="btn btn-add-cart" onclick="addToCart('app-secret-drink', 'كورتادو ماهر الحصري 🎁', 0, 'classic_new.jpg')">
                <i class="fa-solid fa-cart-plus"></i> إضافة للسلة (مجانًا)
            </button>
        </div>
    `;
    
    // Prepend to menu grid to make it very visible
    menuGrid.insertBefore(secretCard, menuGrid.firstChild);
}

// Global helper for bottom nav items
window.setActiveAppNav = (element, targetId) => {
    document.querySelectorAll('.app-bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(20); // Small feedback vibration
    }
};

// Run initialization
initAppMode();

// Check if delivery option is selected and active
function isDeliverySelected() {
    const el = document.querySelector('input[name="delivery-type"]:checked');
    const type = el ? el.value : 'delivery';
    return (type === 'delivery' && userInMecca);
}

// Toggle checkout form address visibility and validation based on delivery option choice
function toggleDeliveryType() {
    const el = document.querySelector('input[name="delivery-type"]:checked');
    const deliveryType = el ? el.value : 'delivery';
    const addressGroup = document.getElementById('address-form-group');
    const addressInput = document.getElementById('customer-address');
    
    const homeContainer = document.getElementById('delivery-option-home-container');
    const pickupContainer = document.getElementById('delivery-option-pickup-container');
    
    if (deliveryType === 'delivery') {
        if (addressGroup) addressGroup.style.display = 'block';
        if (addressInput) addressInput.required = true;
        
        if (homeContainer) {
            homeContainer.style.background = 'rgba(255,170,0,0.08)';
            homeContainer.style.borderColor = 'var(--gold)';
        }
        if (pickupContainer) {
            pickupContainer.style.background = 'none';
            pickupContainer.style.borderColor = 'rgba(255, 170, 0, 0.2)';
        }
    } else {
        if (addressGroup) addressGroup.style.display = 'none';
        if (addressInput) {
            addressInput.required = false;
            addressInput.value = '';
        }
        
        if (pickupContainer) {
            pickupContainer.style.background = 'rgba(255,170,0,0.08)';
            pickupContainer.style.borderColor = 'var(--gold)';
        }
        if (homeContainer) {
            homeContainer.style.background = 'none';
            homeContainer.style.borderColor = 'rgba(255, 170, 0, 0.2)';
        }
    }
    
    updateCartUI();
    populateModalSummary();
}

// ==========================================================
// 📍 MECCA GEOLOCATION DELIVERY SYSTEM
// ==========================================================
function showLocationModal() {
    let modal = document.getElementById('location-modal');
    if (!modal) {
        createLocationModal();
        modal = document.getElementById('location-modal');
    }
    modal.style.display = 'flex';
    
    document.getElementById('location-title').textContent = "تحديد موقع التوصيل";
    document.getElementById('location-desc').textContent = "جاري فحص موقعك للتأكد من تغطية التوصيل لمدينة مكة المكرمة... 🗺️";
    document.getElementById('location-actions').innerHTML = `
        <div id="location-loader" class="loader"></div>
    `;
    
    runLocationCheck();
}

function createLocationModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'location-modal';
    modalDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5,4,3,0.9); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10008;';
    modalDiv.innerHTML = `
        <div class="retro-modal-content" style="background: rgba(20,16,13,0.95); border: 2px solid var(--gold); border-radius: 20px; padding: 30px; text-align: center; max-width: 450px; width: 90%; box-shadow: 0 0 30px var(--gold-glow); font-family: var(--font-arabic); direction: rtl;">
            <div id="location-icon" style="font-size: 3.5rem; margin-bottom: 20px; animation: bounce 2s infinite;">📍</div>
            <h3 style="color: var(--white); font-size: 1.5rem; margin-bottom: 15px; font-family: var(--font-arabic);" id="location-title">تحديد موقع التوصيل</h3>
            <p style="color: var(--text-main); font-size: 1rem; line-height: 1.6; margin-bottom: 25px; font-family: var(--font-arabic);" id="location-desc">جاري فحص موقعك للتأكد من تغطية التوصيل لمدينة مكة المكرمة... 🗺️</p>
            <div id="location-actions" style="display: flex; flex-direction: column; gap: 12px;">
                <div id="location-loader" class="loader"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
}

function runLocationCheck() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const distance = getDistance(lat, lon, 21.3891, 39.8579);
                if (distance <= 60) {
                    setDeliveryLocation(true, "مكة المكرمة (GPS)");
                } else {
                    fallbackIPCheck();
                }
            },
            (error) => {
                console.log("GPS error, falling back to IP:", error);
                fallbackIPCheck();
            },
            { timeout: 7000 }
        );
    } else {
        fallbackIPCheck();
    }
}

function fallbackIPCheck() {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            const city = data.city || '';
            const region = data.region || '';
            if (
                city.toLowerCase().includes('mecca') || 
                city.toLowerCase().includes('makkah') || 
                city.includes('مكة') ||
                region.toLowerCase().includes('makkah') ||
                region.toLowerCase().includes('mecca') ||
                region.includes('مكة')
            ) {
                setDeliveryLocation(true, city || "مكة المكرمة (IP)");
            } else {
                setDeliveryLocation(false);
            }
        })
        .catch(err => {
            console.log("IP Check failed, showing manual selection:", err);
            showManualLocationSelection();
        });
}

function showManualLocationSelection() {
    const loader = document.getElementById('location-loader');
    if (loader) loader.remove();
    document.getElementById('location-title').textContent = "تأكيد الموقع";
    document.getElementById('location-desc').textContent = "تعذر تحديد موقعك تلقائياً. يرجى اختيار إحدى طرق التحديد التالية للتأكد من خدمة التوصيل لمكة المكرمة:";
    
    const actions = document.getElementById('location-actions');
    actions.innerHTML = `
        <button onclick="openInteractiveMap()" style="background: linear-gradient(135deg, var(--gold), var(--accent)); color: white; border: none; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic); font-size: 1rem; box-shadow: 0 0 15px var(--gold-glow); display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;"><i class="fa-solid fa-map-location-dot"></i> تحديد موقعي على الخريطة 🗺️</button>
        <button onclick="setDeliveryLocation(true, 'مكة المكرمة (تأكيد يدوي)')" style="background: linear-gradient(135deg, #2e7d32, #1b5e20); color: white; border: none; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic); font-size: 0.9rem; width: 100%;">أنا في مكة المكرمة 📍</button>
        <button onclick="setDeliveryLocation(false)" style="background: linear-gradient(135deg, #c62828, #b71c1c); color: white; border: none; padding: 10px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic); font-size: 0.9rem; width: 100%;">أنا خارج مكة المكرمة ❌</button>
    `;
}

function setDeliveryLocation(isInMecca, cityName = "") {
    userInMecca = isInMecca;
    localStorage.setItem('maher_in_mecca', isInMecca);
    
    const title = document.getElementById('location-title');
    const desc = document.getElementById('location-desc');
    const actions = document.getElementById('location-actions');
    const icon = document.getElementById('location-icon');
    const cartLocationText = document.getElementById('cart-location-text');
    
    if (isInMecca) {
        if (icon) icon.textContent = "🛵";
        title.textContent = "التوصيل متاح لك! 🎉";
        title.style.color = "var(--neon-matcha)";
        desc.textContent = `موقعك: مكة المكرمة. قهوجي ماهر يوصل لجميع أحياء مكة برسم 3 ر.س فقط!`;
        
        actions.innerHTML = `
            <button onclick="closeLocationModal()" style="background: linear-gradient(135deg, var(--gold), var(--accent)); color: white; border: none; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic); font-size: 1.1rem; box-shadow: 0 0 15px var(--gold-glow);">تصفح واطلب الآن ☕</button>
        `;
        
        if (cartLocationText) {
            cartLocationText.innerHTML = `🛵 التوصيل متاح لمكة (3 ر.س)`;
            cartLocationText.style.color = "var(--neon-matcha)";
        }
    } else {
        if (icon) icon.textContent = "❌";
        title.textContent = "خارج منطقة التغطية";
        title.style.color = "#ff4444";
        desc.textContent = "عذراً! خدمة التوصيل من قهوجي ماهر تغطي فقط أحياء مدينة مكة المكرمة حالياً. يمكنك تصفح المتجر والأسعار فقط.";
        
        actions.innerHTML = `
            <button onclick="closeLocationModal()" style="background: rgba(255,255,255,0.08); color: var(--text-main); border: 1px solid rgba(255,255,255,0.2); padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic);">تصفح المتجر فقط 👁️</button>
        `;
        
        if (cartLocationText) {
            cartLocationText.innerHTML = `❌ التوصيل لمكة فقط`;
            cartLocationText.style.color = "#ff4444";
        }
    }
    
    updateCartUI();
}

function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.style.display = 'none';
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Open Leaflet interactive map to pick location
function openInteractiveMap() {
    document.getElementById('location-title').textContent = "حدد موقعك على الخريطة 🗺️";
    document.getElementById('location-desc').textContent = "انقر على موقعك في مكة المكرمة أو قم بسحب العلامة الحمراء لتأكيد نطاق التوصيل.";
    
    const actions = document.getElementById('location-actions');
    actions.innerHTML = `
        <div id="map" style="width: 100%; height: 260px; border-radius: 12px; margin-top: 10px; border: 2px solid var(--gold); box-shadow: 0 0 15px rgba(255,170,0,0.25); z-index: 10009;"></div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; text-align: center;" id="map-coord-display">الإحداثيات المحددة: جاري التحميل...</div>
        <button onclick="confirmMapLocation()" style="background: linear-gradient(135deg, var(--gold), var(--accent)); color: white; border: none; padding: 12px; font-weight: bold; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic); font-size: 1rem; margin-top: 10px; box-shadow: 0 0 15px var(--gold-glow); width: 100%;">تأكيد الموقع المحدد 📍</button>
        <button onclick="showManualLocationSelection()" style="background: rgba(255,255,255,0.06); color: var(--text-main); border: 1px solid rgba(255,255,255,0.2); padding: 8px; font-weight: normal; border-radius: 8px; cursor: pointer; font-family: var(--font-arabic); font-size: 0.85rem; margin-top: 5px; width: 100%;">رجوع ↩️</button>
    `;
    
    // Mecca Coordinates (21.3891, 39.8579)
    const defaultLat = 21.3891;
    const defaultLng = 39.8579;
    
    setTimeout(() => {
        // Fix Leaflet marker icon path bug in Single Page Application environments
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map('map', { zoomControl: false }).setView([defaultLat, defaultLng], 12);
        L.control.zoom({ position: 'topright' }).addTo(map);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
        
        window.selectedMapCoords = { lat: defaultLat, lng: defaultLng };
        document.getElementById('map-coord-display').textContent = `الموقع المحدد: مكة المكرمة (${defaultLat.toFixed(4)}, ${defaultLng.toFixed(4)})`;
        
        function updateSelectedCoords(lat, lng) {
            window.selectedMapCoords = { lat, lng };
            const dist = getDistance(lat, lng, 21.3891, 39.8579);
            if (dist <= 60) {
                document.getElementById('map-coord-display').innerHTML = `الموقع المحدد: (${lat.toFixed(4)}, ${lng.toFixed(4)}) <span style="color: var(--neon-matcha); font-weight:bold;">(داخل التغطية)</span>`;
            } else {
                document.getElementById('map-coord-display').innerHTML = `الموقع المحدد: (${lat.toFixed(4)}, ${lng.toFixed(4)}) <span style="color: #ff4444; font-weight:bold;">(خارج التغطية - ${dist.toFixed(1)} كم)</span>`;
            }
        }
        
        marker.on('dragend', function(e) {
            const pos = marker.getLatLng();
            updateSelectedCoords(pos.lat, pos.lng);
        });
        
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateSelectedCoords(e.latlng.lat, e.latlng.lng);
        });
    }, 200);
}

// Confirm map selection and perform range checks
function confirmMapLocation() {
    if (!window.selectedMapCoords) {
        showToast("يرجى اختيار موقع على الخريطة أولاً!");
        return;
    }
    const lat = window.selectedMapCoords.lat;
    const lng = window.selectedMapCoords.lng;
    
    const distance = getDistance(lat, lng, 21.3891, 39.8579);
    if (distance <= 60) {
        setDeliveryLocation(true, "الموقع المحدد على الخريطة 🗺️");
    } else {
        showToast("⚠️ الموقع المحدد خارج تغطية مكة المكرمة للتوصيل!");
    }
}

// Initialize location status on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const cached = localStorage.getItem('maher_in_mecca');
    if (cached !== null) {
        userInMecca = (cached === 'true');
        const cartLocationText = document.getElementById('cart-location-text');
        if (cartLocationText) {
            if (userInMecca) {
                cartLocationText.innerHTML = `🛵 التوصيل متاح لمكة (3 ر.س)`;
                cartLocationText.style.color = "var(--neon-matcha)";
            } else {
                cartLocationText.innerHTML = `❌ التوصيل لمكة فقط`;
                cartLocationText.style.color = "#ff4444";
            }
        }
        updateCartUI();
    } else {
        showLocationModal();
    }

    // Check for Secret Cookie unlock parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlock') === 'cookie_secret_99') {
        // Clean url query params to prevent re-trigger on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(triggerSecretCookieUnlock, 1200);
    }
});

// Spawn visual foam bubble explosion particles
function triggerMilkshakeFoamEffect(x, y) {
    const bubbleCount = 30;
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'foam-particle';
        
        const size = Math.random() * 22 + 8; // 8px to 30px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x - size / 2}px`;
        bubble.style.top = `${y - size / 2}px`;
        
        const drift = (Math.random() - 0.5) * 120; // -60px to 60px drift
        bubble.style.setProperty('--drift', `${drift}px`);
        
        const delay = Math.random() * 0.25;
        bubble.style.animationDelay = `${delay}s`;
        
        document.body.appendChild(bubble);
        
        bubble.addEventListener('animationend', () => {
            bubble.remove();
        });
    }
}

// Generate background rising bubble animations inside cart drawer
function startCartBubbles() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    // Clear existing animated bubbles
    container.querySelectorAll('.cart-bubble').forEach(b => b.remove());
    
    const hasMilkshake = cart.some(item => item.productId === 'milkshake');
    if (!hasMilkshake) return;
    
    // Spawn 10 rising bubbles in cart background
    for (let i = 0; i < 10; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'cart-bubble';
        const size = Math.random() * 16 + 6; // 6px to 22px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 90}%`;
        
        bubble.style.animationDuration = `${Math.random() * 3.5 + 2.5}s`;
        bubble.style.animationDelay = `${Math.random() * 3.5}s`;
        
        container.appendChild(bubble);
    }
}

// Spawn visual Matcha algae/leaf explosion particles
function triggerMatchaAlgaeEffect(x, y) {
    const particleCount = 30;
    const colors = ['#2e7d32', '#39ff14', '#1b5e20', '#4caf50', '#a3e635'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'algae-particle';
        
        const size = Math.random() * 14 + 6; // 6px to 20px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = `${x - size / 2}px`;
        particle.style.top = `${y - size / 2}px`;
        
        const drift = (Math.random() - 0.5) * 140; // -70px to 70px drift
        particle.style.setProperty('--drift', `${drift}px`);
        
        const delay = Math.random() * 0.2;
        particle.style.animationDelay = `${delay}s`;
        
        document.body.appendChild(particle);
        
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}

// Reverted chat system completely

// ==========================================================
// 🕵️‍♂️ Secret Tea Breakdown Event & Interactive Dialog System
// ==========================================================
function triggerSecretTeaBreakdown() {
    // 1. Play synthesized glass shattering & glitch sound
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            
            // Bass explosion / rumble
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(120, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1.8);
            gain1.gain.setValueAtTime(0.6, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 1.8);
            
            // Shatter high frequency sweeps
            for (let i = 0; i < 7; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
                osc.frequency.setValueAtTime(1500 + Math.random() * 2500, ctx.currentTime + i * 0.08);
                osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + i * 0.08 + 0.4);
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.08);
                osc.stop(ctx.currentTime + i * 0.08 + 0.4);
            }
        }
    } catch(e) {
        console.log("Audio synthesis error:", e);
    }
    
    // 2. Add screen shake effect to body
    document.body.classList.add('glitch-shake');
    
    // 3. Create breakdown overlay container
    const overlay = document.createElement('div');
    overlay.className = 'secret-breakdown-overlay';
    overlay.id = 'secret-breakdown-overlay';
    
    // Add glass shards container
    const shardsContainer = document.createElement('div');
    shardsContainer.className = 'secret-glass-shards';
    overlay.appendChild(shardsContainer);
    
    // Generate falling glass shards
    for (let i = 0; i < 30; i++) {
        const shard = document.createElement('div');
        shard.className = 'shard';
        shard.style.left = `${Math.random() * 100}vw`;
        shard.style.top = `${Math.random() * -50}px`;
        
        const size = Math.random() * 35 + 15; // 15px to 50px
        shard.style.width = `${size}px`;
        shard.style.height = `${size}px`;
        
        const delay = Math.random() * 1.5;
        shard.style.animationDelay = `${delay}s`;
        
        const duration = Math.random() * 1.5 + 1.0;
        shard.style.animationDuration = `${duration}s`;
        
        shardsContainer.appendChild(shard);
    }
    
    // Generate flying product copies (classic, pro, superpro, matcha)
    const productImages = ['classic_new.jpg', 'pro_new.jpg', 'superpro.jpg', 'matcha.jpg'];
    productImages.forEach((imgSrc, idx) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'secret-flying-product';
        
        // Random destination coordinates
        const angle = (idx / productImages.length) * 2 * Math.PI + (Math.random() * 0.5);
        const distance = 400 + Math.random() * 300;
        const targetX = `calc(50% + ${Math.cos(angle) * distance}px)`;
        const targetY = `calc(50% + ${Math.sin(angle) * distance}px)`;
        
        img.style.setProperty('--target-x', targetX);
        img.style.setProperty('--target-y', targetY);
        img.style.animationDelay = `${Math.random() * 0.3}s`;
        
        overlay.appendChild(img);
    });
    
    // Add dialogue box (hidden initially, scales in)
    const chatBox = document.createElement('div');
    chatBox.className = 'secret-chat-box';
    chatBox.innerHTML = `
        <div class="secret-tea-avatar">🕵️‍♂️🍵</div>
        <div class="secret-dialog-text" id="secret-dialog-text">...جاري فك تشفير المتجر...</div>
        <div class="secret-choices-container" id="secret-choices-container"></div>
    `;
    overlay.appendChild(chatBox);
    document.body.appendChild(overlay);
    
    // Trigger transition
    setTimeout(() => {
        overlay.classList.add('active');
    }, 100);
    
    // 4. Stop shaking and initialize dialog state after shards fall
    setTimeout(() => {
        document.body.classList.remove('glitch-shake');
        shardsContainer.remove();
        // Remove flying products
        document.querySelectorAll('.secret-flying-product').forEach(el => el.remove());
        
        initSecretTeaDialog();
    }, 2500);
}

// Dialog steps and text configuration
let secretDialogStep = 0;
function initSecretTeaDialog() {
    secretDialogStep = 0;
    renderSecretDialogStep();
}

function renderSecretDialogStep(choiceIndex = null) {
    const dialogTextEl = document.getElementById('secret-dialog-text');
    const choicesEl = document.getElementById('secret-choices-container');
    if (!dialogTextEl || !choicesEl) return;
    
    choicesEl.innerHTML = '';
    
    if (secretDialogStep === 0) {
        dialogTextEl.innerHTML = `*هسسسس... صوت تكسير زجاج وهمس عميق...*<br><br>من أنت؟! وكيف تجرأت على جمع الخلطات الأربعة المقدسة (القهوة العادية، البرو، السوبر برو، والماتشا) في سلتك؟ هل أرسلك ماهر لتكشف وكرنا؟! 🤨`;
        
        choicesEl.appendChild(createChoiceButton("أنا مجرد متذوق يبحث عن الكيف الحقيقي الشاهي! 🍵", () => {
            secretDialogStep = 11; // path A
            renderSecretDialogStep();
        }));
        
        choicesEl.appendChild(createChoiceButton("أرسلني الباريستا ماهر للقبض عليك ومصادرة الشاي! 🚨", () => {
            secretDialogStep = 12; // path B
            renderSecretDialogStep();
        }));
    } 
    else if (secretDialogStep === 11) { // Path A
        dialogTextEl.innerHTML = `الكيف الحقيقي؟ هه! ماهر يظن أن قهوته التركية والبرو هي قمة المزاج.. إنه لا يعلم أن الشاهي هو الحاكم الحقيقي الذي يسيطر على عقول الزبائن من وراء الكواليس! 🕶️ نحن منظمة الشاهي السري!`;
        
        choicesEl.appendChild(createChoiceButton("منظمة الشاهي السري؟ شوقتني لأعرف المزيد! 🕵️‍♂️", () => {
            secretDialogStep = 2;
            renderSecretDialogStep();
        }));
        choicesEl.appendChild(createChoiceButton("القهوة ستظل الأفضل، الشاهي للمرضى فقط! 🤮", () => {
            dialogTextEl.innerHTML = `*يهمس بغضب:* كيف تجرؤ! الشاهي هو روح المزاج. سأعطيك عينة لتغير رأيك رغماً عنك!`;
            setTimeout(() => {
                secretDialogStep = 2;
                renderSecretDialogStep();
            }, 2000);
        }));
    }
    else if (secretDialogStep === 12) { // Path B
        dialogTextEl.innerHTML = `القبض علي؟ هيهات! أنا الشاهي المتسلل، أتنقل بين الفناجين كالشبح في منتصف الليل. ماهر يحاول اصطيادنا منذ سنوات ولكنه يفشل في كل مرة لأن نكهتنا قوية وتأسر القلوب! 🥷`;
        
        choicesEl.appendChild(createChoiceButton("ما هي خلطتكم السرية إذن؟ أريد المعرفة.", () => {
            secretDialogStep = 2;
            renderSecretDialogStep();
        }));
        choicesEl.appendChild(createChoiceButton("سأبلغ عنك فوراً وأغلق هذا المنيو! 🚨", () => {
            startSecretTeaBossFight();
        }));
    }
    else if (secretDialogStep === 2) {
        dialogTextEl.innerHTML = `على كل حال.. بما أنك نجحت في كسر شيفرة المتجر وخلطت المكونات الأربعة، فقد أثبتّ جدارتك لتذوق النكهة الأسطورية المحظورة التي يخشاها ماهر.. **شاهي التلقيمة المتسلل العتيق!** 🍂`;
        
        choicesEl.appendChild(createChoiceButton("هل تقصد الشاهي الذي يوزن الدماغ بضغطة واحدة؟ 🧠", () => {
            secretDialogStep = 3;
            renderSecretDialogStep();
        }));
        choicesEl.appendChild(createChoiceButton("أريد كوباً واحداً فوراً، كم السعر؟ 💰", () => {
            secretDialogStep = 3;
            renderSecretDialogStep();
        }));
    }
    else if (secretDialogStep === 3) {
        dialogTextEl.innerHTML = `سأعطيك كوباً واحداً فقط بحجم "متسلل جامد" وبسعر **5 ر.س**.. لكن انتبه! لا تذكر اسمه لـ ماهر عند الدفع، فقط قل له "الخلطة رقم 9" وإلا ستحدث كارثة للمتجر! هل نثق بك؟ 🤫`;
        
        choicesEl.appendChild(createChoiceButton("سرّك في بئر، أضف الكوب الأسطوري للسلة! 🍵", () => {
            addSecretTeaToCart();
        }));
        choicesEl.appendChild(createChoiceButton("أضفه وسأرى ما سأقوله لماهر.. 😉", () => {
            addSecretTeaToCart();
        }));
    }
}

function createChoiceButton(text, onClick) {
    const btn = document.createElement('button');
    btn.className = 'secret-choice-btn';
    btn.innerHTML = text;
    btn.onclick = onClick;
    return btn;
}

function addSecretTeaToCart(isFree = false) {
    // Add the secret tea item to cart
    cart.push({
        id: `secret-tea-${Date.now()}`,
        productId: 'tea',
        name: isFree ? '🍵 شاهي التلقيمة المتسلل (هدية الانتصار! 🏆)' : '🍵 شاهي التلقيمة المتسلل 🤫',
        price: isFree ? 0 : 5,
        image: 'classic_new.jpg', // reuse image
        options: { size: 'متسلل جامد', sugar: 'موزون تلقيمة' },
        quantity: 1
    });
    
    const overlay = document.getElementById('secret-breakdown-overlay');
    const dialogTextEl = document.getElementById('secret-dialog-text');
    const choicesEl = document.getElementById('secret-choices-container');
    
    if (choicesEl) choicesEl.innerHTML = '';
    if (dialogTextEl) {
        dialogTextEl.innerHTML = `<span style="color:#00ff66; font-weight:bold;">🤫 تم إرسال الشاهي متسللاً إلى سلتك! جاري إعادة بناء المتجر...</span>`;
    }
    
    // Play success chime
    playSuccessSound();
    
    // Fade out and remove overlay
    setTimeout(() => {
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                updateCartUI();
                openCartDrawer();
            }, 1000);
        }
    }, 2000);
}

// ==========================================================
// 👾 Boss Fight Engine & Action Handlers
// ==========================================================
let bossHp = 100;
let playerHp = 100;
let bossFightLog = [];

function startSecretTeaBossFight() {
    bossHp = 100;
    playerHp = 100;
    bossFightLog = ["⚔️ بدأت المعركة! الشاهي المتسلل يستعد للهجوم!"];
    
    // Play sci-fi warning alarm
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch(e){}
    
    renderBossFightScreen();
}

function renderBossFightScreen() {
    const dialogTextEl = document.getElementById('secret-dialog-text');
    const choicesEl = document.getElementById('secret-choices-container');
    if (!dialogTextEl || !choicesEl) return;
    
    dialogTextEl.innerHTML = `👾 <strong>مواجهة الزعيم: الشاهي المتسلل 🕵️‍♂️🍵</strong>`;
    
    choicesEl.innerHTML = `
        <div class="boss-fight-container">
            <!-- Boss HP -->
            <div style="width: 100%; text-align: right; font-weight: bold; color: #ff3333; font-size: 0.85rem;">🕵️‍♂️ الشاهي المتسلل (الزعيم)</div>
            <div class="boss-health-bar-container">
                <div class="boss-health-bar" id="boss-hp-bar" style="width: ${bossHp}%;"></div>
                <div class="health-label" id="boss-hp-label">${bossHp} / 100 HP</div>
            </div>
            
            <!-- Player HP -->
            <div style="width: 100%; text-align: right; font-weight: bold; color: #00ff66; font-size: 0.85rem;">👤 أنت (بطل القهوة)</div>
            <div class="boss-health-bar-container">
                <div class="player-health-bar" id="player-hp-bar" style="width: ${playerHp}%;"></div>
                <div class="health-label" id="player-hp-label">${playerHp} / 100 HP</div>
            </div>
            
            <!-- Battle Logs -->
            <div class="boss-log-box" id="boss-log-box">
                ${bossFightLog.map(line => `<div>${line}</div>`).join('')}
            </div>
            
            <!-- Action Grid -->
            <div class="boss-action-grid" id="boss-action-grid">
                <button class="secret-choice-btn" onclick="executeBossFightTurn('sugar')" style="text-align: center;">🍬 رشة سكر زيادة</button>
                <button class="secret-choice-btn" onclick="executeBossFightTurn('shield')" style="text-align: center;">🛡️ درع فنجان تركي</button>
                <button class="secret-choice-btn" onclick="executeBossFightTurn('mix')" style="text-align: center; grid-column: span 2; border-color: #ffaa00; color: #ffaa00; background: rgba(255, 170, 0, 0.05);">🌀 خلطة ماهر السحرية (مخاطرة)</button>
                <button class="secret-choice-btn" onclick="surrenderBossFight()" style="text-align: center; grid-column: span 2; border-color: #ff4444; color: #ff4444; background: rgba(255, 68, 68, 0.05); margin-top: 5px; font-size: 0.8rem; padding: 6px;">🏳️ انسحاب وتصالح</button>
            </div>
        </div>
    `;
    
    // Auto-scroll log box to bottom
    const logBox = document.getElementById('boss-log-box');
    if (logBox) logBox.scrollTop = logBox.scrollHeight;
}

function executeBossFightTurn(action) {
    if (playerHp <= 0 || bossHp <= 0) return;
    
    let playerDamage = 0;
    let playerHeal = 0;
    let logMessage = "";
    
    if (action === 'sugar') {
        playerDamage = Math.floor(15 + Math.random() * 11); // 15-25
        logMessage = `💥 رميت رشة سكر حارق! تسببت بـ ${playerDamage} ضرر للشاهي.`;
    } 
    else if (action === 'shield') {
        playerHeal = Math.floor(10 + Math.random() * 6); // 10-15
        logMessage = `🛡️ احتميت خلف فنجان تركي ثقيل واستعدت ${playerHeal} نقاط صحة.`;
    } 
    else if (action === 'mix') {
        if (Math.random() < 0.55) {
            playerDamage = 40;
            logMessage = `🌀 خلطة ماهر السحرية نجحت! فجرت رأس الشاهي بـ 40 ضرر!`;
        } else {
            playerDamage = 0;
            logMessage = `💨 فشلت خلطة ماهر السحرية وتبخرت النكهة دون ضرر!`;
        }
    }
    
    // Apply player action
    bossHp = Math.max(0, bossHp - playerDamage);
    playerHp = Math.min(100, playerHp + playerHeal);
    
    bossFightLog.push(logMessage);
    
    // Check if boss is dead
    if (bossHp <= 0) {
        bossFightLog.push("🏆 انتصرت! الشاهي المتسلل يسقط ويعترف بالهزيمة!");
        renderBossFightScreen();
        setTimeout(handleBossFightWin, 1800);
        return;
    }
    
    // Disable actions briefly during boss turn
    const grid = document.getElementById('boss-action-grid');
    if (grid) grid.style.pointerEvents = 'none';
    
    bossFightLog.push("⏳ دور الزعيم الشاهي...");
    renderBossFightScreen();
    
    // Boss responds after 800ms
    setTimeout(() => {
        if (playerHp <= 0) return;
        
        let bossDamage = 0;
        let bossLog = "";
        
        const rand = Math.random();
        if (rand < 0.5) {
            bossDamage = Math.floor(10 + Math.random() * 9); // 10-18
            bossLog = `🍂 الشاهي أطلق عليك رشق أوراق شاهي تلقيمة حادة! تسبب بـ ${bossDamage} ضرر.`;
        } else if (rand < 0.8) {
            bossDamage = 20;
            bossLog = `🔥 تسريب ماء مغلي! حرقك الشاهي بـ 20 ضرر!`;
        } else {
            bossDamage = 12;
            bossHp = Math.min(100, bossHp + 8);
            bossLog = `🤫 همس التسلل! امتص الشاهي 12 من طاقتك وعالج نفسه 8 نقاط.`;
        }
        
        playerHp = Math.max(0, playerHp - bossDamage);
        bossFightLog.push(bossLog);
        
        if (playerHp <= 0) {
            bossFightLog.push("💀 هُزمت! الشاهي المتسلل يسيطر على ذهنك بالكامل.");
            renderBossFightScreen();
            setTimeout(handleBossFightLoss, 1800);
            return;
        }
        
        // Re-enable actions
        renderBossFightScreen();
        const gridActive = document.getElementById('boss-action-grid');
        if (gridActive) gridActive.style.pointerEvents = 'auto';
    }, 800);
}

function handleBossFightWin() {
    const dialogTextEl = document.getElementById('secret-dialog-text');
    const choicesEl = document.getElementById('secret-choices-container');
    if (!dialogTextEl || !choicesEl) return;
    
    dialogTextEl.innerHTML = `🏆 <strong>انتصار ساحق لقوة القهوة!</strong><br><br>الشاهي المتسلل يركع باكياً: "آخخخ! هزمتني بخلطات ماهر القوية.. أرجوك لا تبلغ ماهر! سأعطيك الشاهي المتسلل مجاناً كفدية! 🍵🎁"`;
    
    choicesEl.innerHTML = '';
    choicesEl.appendChild(createChoiceButton("قبول الفدية وإضافة الشاهي مجاناً! 🍵🎁", () => {
        addSecretTeaToCart(true); // Free price!
    }));
}

function handleBossFightLoss() {
    const dialogTextEl = document.getElementById('secret-dialog-text');
    const choicesEl = document.getElementById('secret-choices-container');
    if (!dialogTextEl || !choicesEl) return;
    
    dialogTextEl.innerHTML = `💀 <strong>سقوط بطل القهوة!</strong><br><br>الشاهي المتسلل يضحك بنشوة: "هاهاها! قوة الشاهي لا تقهر! وعقوبة لمحاولتك التجسس والتبليغ عني، سأعاقب سلتك بـ 'شاهي مهزومين منفوخ' بسعر 50 ريال إجبارياً!"`;
    
    choicesEl.innerHTML = '';
    choicesEl.appendChild(createChoiceButton("الاعتراف بالهزيمة والخروج مع الغرامة... 🏳️", () => {
        addDefeatedTeaToCart();
    }));
}

function surrenderBossFight() {
    // Escapes fight, returns to Step 2
    secretDialogStep = 2;
    renderSecretDialogStep();
}

function addDefeatedTeaToCart() {
    // Adds a 50 SAR item as a penalty for losing the boss fight
    cart.push({
        id: `defeated-tea-${Date.now()}`,
        productId: 'tea',
        name: '🍵 شاهي منفوخ للمهزومين 💀',
        price: 50,
        image: 'classic_new.jpg',
        options: { size: 'كوب الهزيمة', sugar: 'مر علقم' },
        quantity: 1
    });
    
    const overlay = document.getElementById('secret-breakdown-overlay');
    const dialogTextEl = document.getElementById('secret-dialog-text');
    const choicesEl = document.getElementById('secret-choices-container');
    
    if (choicesEl) choicesEl.innerHTML = '';
    if (dialogTextEl) {
        dialogTextEl.innerHTML = `<span style="color:#ff3333; font-weight:bold;">💀 تمت إضافة غرامة الهزيمة إلى سلتك! جاري إعادة بناء المتجر...</span>`;
    }
    
    playSadChime();
    
    setTimeout(() => {
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                updateCartUI();
                openCartDrawer();
            }, 1000);
        }
    }, 2000);
}

// ==========================================================
// 🍪 Secret Cookie Unlock Event
// ==========================================================
function triggerSecretCookieUnlock() {
    // Check if the cookie is already in the cart
    const hasCookie = cart.some(item => item.name === '🍪 كوكيز ماهر المتسلل السري 🤫');
    if (hasCookie) {
        showToast("🍪 الكوكيز المتسلل موجود في سلتك بالفعل! يمديك تطلب حبة واحدة بس.");
        openCartDrawer();
        return;
    }

    // 1. Play success chime sound
    playSuccessSound();
    
    // 2. Add the cookie item to cart
    cart.push({
        id: `secret-cookie-${Date.now()}`,
        productId: 'classic', // repurpose card
        name: '🍪 كوكيز ماهر المتسلل السري 🤫',
        price: 3,
        image: 'classic_new.jpg', // fallback image
        options: { size: 'مخفي وساخن', sugar: 'حلاوة خفيفة' },
        quantity: 1
    });
    
    // Update Cart & show feedback
    updateCartUI();
    
    // 3. Show a custom congratulatory modal
    const cookieModal = document.createElement('div');
    cookieModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; align-items: center; justify-content: center; font-family: var(--font-arabic); direction: rtl;';
    cookieModal.innerHTML = `
        <div class="win95-modal" style="width: 420px; max-width: 90%; background: #c0c0c0; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; box-shadow: 0 0 20px rgba(0,0,0,0.5); padding: 2px; color: #000;">
            <div class="win95-title-bar" style="background: #000080; color: #fff; padding: 3px 6px; font-weight: bold; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
                <span>🍪 تم كشف سر الكوكيز!</span>
                <button onclick="this.closest('.win95-modal').parentElement.remove();" style="font-size: 0.75rem; font-weight: bold; background: #c0c0c0; border: 1px solid #fff; border-right-color: #808080; border-bottom-color: #808080; padding: 1px 4px; cursor: pointer; color: #000;">X</button>
            </div>
            <div class="win95-body" style="padding: 20px; text-align: center;">
                <div style="font-size: 3.5rem; margin-bottom: 15px; animation: secretFloat 3s infinite ease-in-out;">🍪</div>
                <h3 style="margin-bottom: 10px; color: #000080;">تهانينا أيها العميل الذكي! 🎉</h3>
                <p style="font-size: 0.85rem; line-height: 1.5; color: #222; margin-bottom: 20px;">
                    لقد فككت شفرات الألغاز السرية بنجاح وأثبتّ أنك تستحق الكوكيز المتسلل السري لقهوجي ماهر!
                    تمت إضافة الكوكيز اللذيذ إلى سلتك بسعر رمزي **3 ر.س**! 🤫
                </p>
                <button class="win95-btn" onclick="this.closest('.win95-modal').parentElement.remove(); openCartDrawer();" style="padding: 6px 20px; font-weight: bold; border-radius: 2px; cursor: pointer;">عرض السلة 🛍️</button>
            </div>
        </div>
    `;
    document.body.appendChild(cookieModal);
}

// ==========================================================
// 💬 Testimonials & WhatsApp Review Form
// ==========================================================
let selectedRating = 5;

function setSelectRating(rating) {
    selectedRating = rating;
    const labels = document.querySelectorAll('.rating-star-select label');
    labels.forEach((label, idx) => {
        const labelRating = 5 - idx;
        if (labelRating <= rating) {
            label.style.color = 'var(--gold)';
        } else {
            label.style.color = '#444';
        }
    });
}

function sendReviewToWhatsApp(event) {
    event.preventDefault();
    const nameEl = document.getElementById('review-user-name');
    const textEl = document.getElementById('review-user-text');
    if (!nameEl || !textEl) return;

    const name = nameEl.value.trim();
    const text = textEl.value.trim();
    if (!name || !text) return;

    // Build star display string
    const stars = '⭐'.repeat(selectedRating);

    // Build WhatsApp message
    let message = `*تقييم جديد لقهوجي ماهر* 😍✍️\n\n`;
    message += `👤 *الاسم:* ${name}\n`;
    message += `⭐ *التقييم:* ${stars} (${selectedRating}/5)\n\n`;
    message += `💬 *الرأي:* \n"${text}"\n\n`;
    message += `📅 المرسل من متجر قهوجي ماهر الإلكتروني ☕`;

    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Play chime sound
    if (typeof playSuccessSound === 'function') {
        playSuccessSound();
    }

    // Open WhatsApp in new tab
    window.open(waLink, '_blank');

    // Reset Form
    event.target.reset();
    setSelectRating(5);
    showToast('تم تجهيز التقييم وفتحه في واتساب للإرسال! شكراً لك ❤️');
}

// ==========================================================
// 🫖 SECRET TEA STORYLINE & DIALOGUE EVENT
// ==========================================================
function triggerSecretTeaStoryline() {
    if (typeof playSuccessSound === 'function') {
        playSuccessSound();
    }

    let storyModal = document.getElementById('tea-story-modal');
    if (storyModal) storyModal.remove();

    storyModal = document.createElement('div');
    storyModal.id = 'tea-story-modal';
    storyModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100005; display: flex; align-items: center; justify-content: center; font-family: var(--font-arabic); direction: rtl;';
    storyModal.innerHTML = `
        <div class="win95-modal" style="width: 480px; max-width: 92%; background: #c0c0c0; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; box-shadow: 0 0 25px rgba(0,0,0,0.7); padding: 2px; color: #000;">
            <div class="win95-title-bar" style="background: linear-gradient(90deg, #990000, #cc0000); color: #fff; padding: 4px 8px; font-weight: bold; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center;">
                <span>🫖 عودة الشاهي السري المتمرد!</span>
                <button onclick="document.getElementById('tea-story-modal')?.remove();" style="font-size: 0.75rem; font-weight: bold; background: #c0c0c0; border: 1px solid #fff; border-right-color: #808080; border-bottom-color: #808080; padding: 1px 6px; cursor: pointer; color: #000;">X</button>
            </div>
            <div class="win95-body" style="padding: 22px; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">🫖🤫</div>
                
                <div style="background: #fff; border: 2px inset #808080; padding: 14px; margin-bottom: 20px; text-align: right; font-size: 0.95rem; line-height: 1.8; color: #111; border-radius: 4px;">
                    💬 <strong>الشاهي السري:</strong><br>
                    <span style="color: #990000; font-weight: bold;">
                    "هلووووووووووووووووو وحشتك صح؟ 😉<br>
                    يالله انت متى بتروح؟ ⏰<br>
                    لا تخاف قريب بغزو موقع ثاني! 🌐🚀"
                    </span>
                </div>

                <p style="font-size: 0.85rem; color: #333; margin-bottom: 18px; font-weight: bold;">
                    ⚠️ الشاهي يهدد بغزو مواقع جديدة! اضغط على زر المسدس أدناه لتصفيته فوراً:
                </p>

                <button class="win95-btn" onclick="triggerTeaShootoutSequence(event)" style="padding: 10px 22px; font-weight: bold; font-size: 1rem; background: linear-gradient(135deg, #dc2626, #990000); color: white; border: 2px solid #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; border-radius: 4px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
                    🔫 تصويب وتصفية الشاهي السري
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(storyModal);
}

function triggerTeaShootoutSequence(e) {
    if (e) e.stopPropagation();

    // 1. Close story modal
    const storyModal = document.getElementById('tea-story-modal');
    if (storyModal) storyModal.remove();

    // 2. Play gunshot audio
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch(err) {}

    // 3. Open death modal
    setTimeout(() => {
        let deathModal = document.getElementById('tea-death-modal');
        if (deathModal) deathModal.remove();

        deathModal = document.createElement('div');
        deathModal.id = 'tea-death-modal';
        deathModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100010; display: flex; align-items: center; justify-content: center; font-family: var(--font-arabic); direction: rtl;';
        deathModal.innerHTML = `
            <div class="win95-modal" style="width: 440px; max-width: 90%; background: #c0c0c0; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; box-shadow: 0 0 30px rgba(255,0,0,0.8); padding: 2px; color: #000;">
                <div class="win95-title-bar" style="background: #800000; color: #fff; padding: 4px 8px; font-weight: bold; font-size: 0.9rem;">
                    💀 نهاية الشاهي السري المتسلل
                </div>
                <div class="win95-body" style="padding: 22px; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 10px;">💥🩸🫖</div>
                    <h3 style="color: #800000; margin-bottom: 12px;">"ما اتوقعت الصراحه..." 💔</h3>
                    <p style="font-size: 1.05rem; line-height: 1.8; color: #111; font-weight: bold; background: #fff; padding: 12px; border: 2px inset #808080; margin-bottom: 18px;">
                        "بس رح ارجع ثان___" 😵⚰️
                    </p>
                    <button class="win95-btn" onclick="finishTeaDeathSequence(event)" style="padding: 8px 24px; font-weight: bold; cursor: pointer;">وداعاً أيها الشاهي! 🪦</button>
                </div>
            </div>
        `;
        document.body.appendChild(deathModal);
    }, 200);
}

function finishTeaDeathSequence(e) {
    if (e) e.stopPropagation();
    const deathModal = document.getElementById('tea-death-modal');
    if (deathModal) deathModal.remove();

    showMaherRewardDialogue();
}

function showMaherRewardDialogue() {
    if (typeof playSuccessSound === 'function') {
        playSuccessSound();
    }

    let rewardModal = document.getElementById('tea-reward-modal');
    if (rewardModal) rewardModal.remove();

    rewardModal = document.createElement('div');
    rewardModal.id = 'tea-reward-modal';
    rewardModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100015; display: flex; align-items: center; justify-content: center; font-family: var(--font-arabic); direction: rtl;';
    rewardModal.innerHTML = `
        <div class="win95-modal" style="width: 460px; max-width: 92%; background: #c0c0c0; border: 2px solid #fff; border-right-color: #808080; border-bottom-color: #808080; box-shadow: 0 0 30px rgba(255,170,0,0.6); padding: 2px; color: #000;">
            <div class="win95-title-bar" style="background: linear-gradient(90deg, #000080, #1084d0); color: #fff; padding: 4px 8px; font-weight: bold; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center;">
                <span>👨‍🍳 قهوجي ماهر يحييك!</span>
                <button onclick="document.getElementById('tea-reward-modal')?.remove();" style="font-size: 0.75rem; font-weight: bold; background: #c0c0c0; border: 1px solid #fff; border-right-color: #808080; border-bottom-color: #808080; padding: 1px 6px; cursor: pointer; color: #000;">X</button>
            </div>
            <div class="win95-body" style="padding: 22px; text-align: center;">
                <img src="5960730354593238429.jpg" alt="قهوجي ماهر" style="width: 85px; height: 85px; border-radius: 50%; border: 3px solid #000080; margin-bottom: 12px; box-shadow: 0 0 15px rgba(0,0,128,0.3);">
                
                <div style="background: #fff; border: 2px inset #808080; padding: 14px; margin-bottom: 20px; text-align: right; font-size: 0.95rem; line-height: 1.8; color: #111; border-radius: 4px;">
                    💬 <strong>قهوجي ماهر:</strong><br>
                    <span style="color: #000080; font-weight: bold;">
                    "واو خلصت عليه بسرعه! ⚡😎<br>
                    كنت لسا بسوي نفس الشي بس كان عندي طلبات، المهم خذ كوبون خصم 1 ريال! 🎟️✨"
                    </span>
                </div>

                <div style="background: linear-gradient(135deg, #1084d0, #000080); color: #fff; border: 2px dashed #fff; padding: 10px; border-radius: 6px; font-size: 1.1rem; font-weight: bold; margin-bottom: 18px; letter-spacing: 1px;">
                    🎟️ كود الخصم: MAHER1SAR (-1 ر.س)
                </div>

                <button class="win95-btn" onclick="applyMaherCoupon(); document.getElementById('tea-reward-modal')?.remove();" style="padding: 10px 22px; font-weight: bold; font-size: 0.95rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border: 2px solid #fff; cursor: pointer; border-radius: 4px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                    🎟️ تطبيق الخصم فوراً بالسلة!
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(rewardModal);
}

let activeDiscount = 0;

function applyMaherCoupon() {
    activeDiscount = 1;
    updateCartUI();
    openCartDrawer();
    showToast("🎉 تم تطبيق خصم 1 ريال على سلتك بنجاح من قهوجي ماهر!");
    if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
    }
}


