function getCart() {
  return JSON.parse(localStorage.getItem('shop_cart') || '[]');
}

function saveCart(c) {
  localStorage.setItem('shop_cart', JSON.stringify(c));
  renderCart();
}

function renderCart() {
  const cont = document.getElementById('cart-items');
  const cart = getCart();
  cont.innerHTML = '';

  if (cart.length === 0) {
    cont.innerHTML = '<p>No items in cart.</p>';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = "cart-row";

    div.innerHTML = `
      <img src="${item.img}" 
           style="width:70px;height:60px;object-fit:cover;border-radius:6px">
      <div style="flex:1;">
        <strong>${item.name}</strong>
        <p>₹${item.price} × ${item.qty}</p>
      </div>
      <button class="remove" data-id="${item.id}">Remove</button>
    `;

    cont.appendChild(div);
  });

  const totalDiv = document.createElement('div');
  totalDiv.innerHTML = `<h3>Total: ₹${total}</h3>`;
  cont.appendChild(totalDiv);

  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const cart = getCart().filter(i => i.id !== e.target.dataset.id);
      saveCart(cart);
    });
  });
}

renderCart();

// Checkout (COD)
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) return alert("Cart is empty!");

  const formData = Object.fromEntries(new FormData(e.target));
  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  const payload = {
    ...formData,
    items: cart,
    total,
    paymentMethod: "COD"
  };

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const j = await res.json();

  if (j.success) {
    localStorage.removeItem('shop_cart');
    renderCart();
    document.getElementById('msg').innerText = "Order placed successfully! (COD)";
  } else {
    document.getElementById('msg').innerText = "Failed to place order.";
  }
});
