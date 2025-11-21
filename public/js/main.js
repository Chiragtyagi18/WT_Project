async function fetchProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const cont = document.getElementById('products');

  cont.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <button class="btn" 
        data-id="${p._id}" 
        data-name="${p.name}" 
        data-price="${p.price}" 
        data-img="${p.image}">
        Add to cart
      </button>
    `;
    cont.appendChild(div);
  });

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const item = {
        id: e.target.dataset.id,
        name: e.target.dataset.name,
        price: Number(e.target.dataset.price),
        img: e.target.dataset.img,
        qty: 1
      };
      addToCart(item);
    });
  });
}

function getCart() {
  return JSON.parse(localStorage.getItem('shop_cart') || '[]');
}

function saveCart(c) {
  localStorage.setItem('shop_cart', JSON.stringify(c));
  updateCartCount();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);

  if (existing) existing.qty++;
  else cart.push(item);

  saveCart(cart);
}

function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').innerText = count;
}

window.onload = () => {
  fetchProducts();
  updateCartCount();
};
