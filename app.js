// === Initialize cart from localStorage or create empty ===
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === Update cart count on page load ===
updateCartCount();

// === Add to Cart Function ===
function addToCart(productName, price) {
  price = parseFloat(price).toFixed(2);

  // Check if item already exists
  const existingItem = cart.find(item => item.name === productName);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name: productName, price, quantity: 1 });
  }

  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Update cart count
  updateCartCount();

  // Optional feedback
  alert(`${productName} has been added to your cart.`);
}

// === Update cart badge count ===
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = count;
}

// === Open cart panel ===
document.getElementById("cart-icon").addEventListener("click", () => {
  showCart();
});

// === Show Cart Panel ===
function showCart() {
  document.getElementById("cart-panel").classList.add("show");
  renderCartItems();
}

// === Close Cart Panel ===
function closeCart() {
  document.getElementById("cart-panel").classList.remove("show");
}

// === Render Cart Items ===
function renderCartItems() {
  const container = document.getElementById("cart-items-container");
  container.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.quantity * parseFloat(item.price);
    total += subtotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div>Price: $${item.price}</div>
      <div>
        Quantity: 
        <input 
          type="number" 
          class="quantity-input" 
          value="${item.quantity}" 
          min="1" 
          onchange="changeQuantity(${index}, this.value)"
        />
      </div>
      <div>Subtotal: $${subtotal.toFixed(2)}</div>
      <button onclick="removeItem(${index})">Remove</button>
    `;
    container.appendChild(div);
  });

  document.getElementById("cart-total").textContent = total.toFixed(2);
}

// === Change Item Quantity ===
function changeQuantity(index, newQty) {
  const qty = parseInt(newQty);
  if (qty > 0) {
    cart[index].quantity = qty;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
  }
}

// === Remove Item ===
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartItems();
  updateCartCount();
}


// === Load PayPal button ===
paypal.Buttons({
  createOrder: function(data, actions) {
    const total = cart.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price)), 0);

    return actions.order.create({
      purchase_units: [{
        amount: {
          value: total.toFixed(2) // Total cart amount
        }
      }]
    });
  },

  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      alert('Transaction completed by ' + details.payer.name.given_name);

      // Clear the cart after successful payment
      cart = [];
      localStorage.removeItem('cart');
      renderCartItems();
      updateCartCount();
      closeCart();
    });
  },

  onError: function(err) {
    console.error('PayPal Checkout Error:', err);
    alert('An error occurred during the payment process.');
  }
}).render('#paypal-button-container');
