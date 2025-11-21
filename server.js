require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/shopeasy";

mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  pid: Number,
  name: String,
  price: Number,
  image: String,
  category: String
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  items: Array,
  total: Number,
  paymentMethod: String,
  date: String
});
const Order = mongoose.model('Order', orderSchema);

// Seed products
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const arr = [];
      const cats = ["Electronics", "Fashion", "Home", "Sports"];

      for (let i = 1; i <= 40; i++) {
        arr.push({
          pid: i,
          name: `Product ${i}`,
          price: Math.floor(Math.random() * 200) + 50,
          image: `https://picsum.photos/seed/p${i}/400/300`,
          // image:`https://source.unsplash.com/random/400x300/?product&sig=${i}`,

          category: cats[Math.floor(Math.random() * cats.length)]
        });
      }

      await Product.insertMany(arr);
      console.log("Products Seeded!");
    }
  } catch (err) {
    console.error("Seed Error:", err);
  }
}
seedProducts();

// Routes
app.post("/api/auth", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Simple signup
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, password, phone, address });
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Place Order (COD)
app.post("/api/orders", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;

    const order = new Order({
      name,
      email,
      phone,
      address,
      items,
      total,
      paymentMethod: "COD",
      date: new Date().toLocaleString()
    });

    const saved = await order.save();

    await User.findOneAndUpdate(
      { email },
      { $push: { orders: saved._id } }
    );

    res.json({ success: true, order: saved });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Orders by Email
app.get("/api/orders/:email", async (req, res) => {
  const orders = await Order.find({ email: req.params.email }).sort({ _id: -1 });
  res.json(orders);
});

// Server Start
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
