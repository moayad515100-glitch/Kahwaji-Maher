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
    }

    const options = {
        size,
        sugar
    };

    // Create unique key for item + options combination
    const cartItemId = `${productId}-${size}-${sugar}`;

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
    showToast(`تمت إضافة ${name} إلى السلة!`);
    
    // Auto open cart drawer to show customer it was added
    setTimeout(openCartDrawer, 400);
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

    // Open WhatsApp
    window.open(waLink, '_blank');
    
    // Clear Cart and Close Modal
    cart = [];
    updateCartUI();
    closeCheckoutModal();
    checkoutForm.reset();
    showToast('تم إرسال الطلب بنجاح! شكراً لك.');
}
