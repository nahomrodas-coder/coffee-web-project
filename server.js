const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3005;

// Middleware to handle JSON and serve your files
app.use(express.json());
app.use(express.static('.'));

// Helper function to read/write files easily
function getData(file) {
    return JSON.parse(fs.readFileSync(path.join('data', file), 'utf8'));
}
function saveData(file, data) {
    fs.writeFileSync(path.join('data', file), JSON.stringify(data, null, 2));
}

// 1. LOGIN API
app.post('/api/login', (req, res) => {
    const users = getData('users.json');
    const user = users.find(u => u.email === req.body.email && u.password === req.body.password);

    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Login' });
    }
});

// 2. CHECKOUT API (Save Order)
app.post('/api/orders', (req, res) => {
    const orders = getData('orders.json');
    const newOrder = {
        id: Date.now(),
        items: req.body.items,
        total: req.body.total,
        date: new Date().toLocaleString()
    };
    orders.push(newOrder);
    saveData('orders.json', orders);
    res.json({ success: true });
});

// 3. ADMIN API (Show Orders)
app.get('/api/admin/orders', (req, res) => {
    const orders = getData('orders.json');
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`SERVER IS READY! Open: http://localhost:${PORT}/index.html`);
});
