// State management
const state = {
  selectedFlavor: null,
  selectedBrand: null,
  selectedPrice: 0,
  quantity: 500,
  cart: [],
  currentScreen: 'flavor-selection'
};

// DOM Elements
const screens = {
  flavorSelection: document.getElementById('flavor-selection'),
  brandSelection: document.getElementById('brand-selection'),
  quantitySelection: document.getElementById('quantity-selection'),
  cartScreen: document.getElementById('cart-screen'),
  paymentScreen: document.getElementById('payment-screen'),
  confirmationScreen: document.getElementById('confirmation-screen')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateCartCount();
  updateProgressBar('flavor');
});

// Set up all event listeners
function setupEventListeners() {
  // Flavor selection
  const flavorItems = document.querySelectorAll('#flavor-selection .selection-item');
  flavorItems.forEach(item => {
    item.addEventListener('click', () => {
      state.selectedFlavor = item.getAttribute('data-flavor');
      navigateTo('brand-selection');
      updateProgressBar('brand');
    });
  });

  // Brand selection
  const brandItems = document.querySelectorAll('#brand-selection .selection-item');
  brandItems.forEach(item => {
    item.addEventListener('click', () => {
      state.selectedBrand = item.getAttribute('data-brand');
      state.selectedPrice = parseFloat(item.getAttribute('data-price'));
      
      // Update quantity selection screen with selected info
      document.getElementById('selected-flavor').textContent = state.selectedFlavor;
      document.getElementById('selected-brand').textContent = state.selectedBrand;
      document.getElementById('price-per-gram').textContent = state.selectedPrice.toFixed(2);
      
      updateTotalPrice();
      navigateTo('quantity-selection');
      updateProgressBar('quantity');
    });
  });

  // Back buttons
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => {
      if (state.currentScreen === 'brand-selection') {
        navigateTo('flavor-selection');
        updateProgressBar('flavor');
      } else if (state.currentScreen === 'quantity-selection') {
        navigateTo('brand-selection');
        updateProgressBar('brand');
      } else if (state.currentScreen === 'cart-screen') {
        // If we have a selected flavor and brand, go back to quantity selection
        if (state.selectedFlavor && state.selectedBrand) {
          navigateTo('quantity-selection');
          updateProgressBar('quantity');
        } else {
          // Otherwise go back to flavor selection
          navigateTo('flavor-selection');
          updateProgressBar('flavor');
        }
      } else if (state.currentScreen === 'payment-screen') {
        navigateTo('cart-screen');
        updateProgressBar('cart');
      }
    });
  });

  // Quantity controls
  document.getElementById('decrease-quantity').addEventListener('click', () => {
    if (state.quantity > 100) {
      state.quantity -= 100;
      document.getElementById('quantity-input').value = state.quantity;
      updateTotalPrice();
    }
  });

  document.getElementById('increase-quantity').addEventListener('click', () => {
    if (state.quantity < 5000) {
      state.quantity += 100;
      document.getElementById('quantity-input').value = state.quantity;
      updateTotalPrice();
    }
  });

  document.getElementById('quantity-input').addEventListener('change', (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 500;
    if (value < 100) value = 100;
    if (value > 5000) value = 5000;
    
    state.quantity = value;
    e.target.value = value;
    updateTotalPrice();
  });

  // Add to cart button
  document.getElementById('add-to-cart').addEventListener('click', () => {
    const item = {
      id: Date.now(),
      flavor: state.selectedFlavor,
      brand: state.selectedBrand,
      price: state.selectedPrice,
      quantity: state.quantity,
      total: state.quantity * state.selectedPrice
    };
    
    state.cart.push(item);
    updateCartCount();
    renderCartItems();
    navigateTo('cart-screen');
    updateProgressBar('cart');
  });

  // Cart icon
  document.querySelector('.cart-icon').addEventListener('click', () => {
    renderCartItems();
    navigateTo('cart-screen');
    updateProgressBar('cart');
  });

  // Checkout button
  document.getElementById('checkout-button').addEventListener('click', () => {
    if (state.cart.length > 0) {
      document.getElementById('payment-amount').textContent = calculateCartTotal().toFixed(2);
      navigateTo('payment-screen');
      updateProgressBar('payment');
    }
  });

  // Payment button
  document.getElementById('pay-button').addEventListener('click', () => {
    // Generate random order number
    document.getElementById('order-number').textContent = Math.floor(100000 + Math.random() * 900000);
    navigateTo('confirmation-screen');
    updateProgressBar('confirmation');
    
    // Make the confirmation step green
    document.querySelector('.progress-step[data-step="confirmation"]').classList.add('success');
  });

  // New order button
  document.getElementById('new-order-button').addEventListener('click', () => {
    // Reset the state
    state.selectedFlavor = null;
    state.selectedBrand = null;
    state.selectedPrice = 0;
    state.quantity = 500;
    state.cart = [];
    
    // Reset UI
    document.getElementById('quantity-input').value = 500;
    updateCartCount();
    
    // Navigate to first screen
    navigateTo('flavor-selection');
    updateProgressBar('flavor');
  });

  // Format credit card number with spaces
  document.getElementById('card-number').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
  });

  // Format expiry date
  document.getElementById('expiry-date').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    e.target.value = value;
  });

  // Only allow numbers in CVV
  document.getElementById('cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
}

// Navigation between screens
function navigateTo(screenId) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show the target screen
  screens[camelCase(screenId)].classList.add('active');
  state.currentScreen = screenId;
}

// Helper function to convert kebab-case to camelCase
function camelCase(str) {
  return str.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
}

// Update the total price on the quantity selection screen
function updateTotalPrice() {
  const total = state.quantity * state.selectedPrice;
  document.getElementById('total-price').textContent = total.toFixed(2);
}

// Update the cart count in the header
function updateCartCount() {
  const count = state.cart.length;
  document.getElementById('cart-count').textContent = count;
}

// Render cart items
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  cartItemsContainer.innerHTML = '';
  
  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    return;
  }
  
  state.cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-title">${item.flavor} Protein by ${item.brand}</div>
        <div class="cart-item-details">${item.quantity}g at ${item.price.toFixed(2)}/g</div>
      </div>
      <div class="cart-item-price">${item.total.toFixed(2)}</div>
      <div class="remove-item" data-id="${item.id}">
        <i class="fas fa-trash"></i>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      removeFromCart(id);
    });
  });
  
  // Update cart total
  document.getElementById('cart-total').textContent = calculateCartTotal().toFixed(2);
}

// Remove item from cart
function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  updateCartCount();
  renderCartItems();
  
  // If cart is empty, go back to flavor selection
  if (state.cart.length === 0) {
    navigateTo('flavor-selection');
    updateProgressBar('flavor');
  }
}

// Calculate cart total
function calculateCartTotal() {
  return state.cart.reduce((total, item) => total + item.total, 0);
}

// Update progress bar based on current step
function updateProgressBar(currentStep) {
  const steps = ['flavor', 'brand', 'quantity', 'cart', 'payment', 'confirmation'];
  const currentIndex = steps.indexOf(currentStep);
  
  // Reset all steps
  document.querySelectorAll('.progress-step').forEach(step => {
    step.classList.remove('active', 'completed', 'success');
  });
  
  // Mark current step as active
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
  
  // Mark previous steps as completed
  for (let i = 0; i < currentIndex; i++) {
    document.querySelector(`.progress-step[data-step="${steps[i]}"]`).classList.add('completed');
  }
  
  // If we're on the confirmation step, make it green
  if (currentStep === 'confirmation') {
    document.querySelector(`.progress-step[data-step="confirmation"]`).classList.add('success');
  }
}