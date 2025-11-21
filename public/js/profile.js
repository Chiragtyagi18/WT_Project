document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const out = document.getElementById('orders');
  out.innerHTML = "Loading...";

  const res = await fetch(`/api/orders/${email}`);
  const orders = await res.json();

  out.innerHTML = '';

  if (!orders.length) {
    out.innerHTML = "<p>No orders found for this email.</p>";
    return;
  }

  orders.forEach(o => {
    const div = document.createElement('div');
    div.className = "card";
    div.innerHTML = `
      <h4>Order ID: ${o._id}</h4>
      <small>${o.date}</small>
      <p><strong>Items:</strong> ${o.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</p>
      <p><strong>Total:</strong> ₹${o.total}</p>
      <p><strong>Payment:</strong> ${o.paymentMethod}</p>
    `;
    out.appendChild(div);
  });
});
