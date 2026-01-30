const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3005;

// Middleware to handle JSON and serve your files
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString()} - ${req.method} ${req.url}`);
    next();
});

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
    try {
        const orders = getData('orders.json');

        // Calculate the next sequential ID
        const maxId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) : 0;
        const newId = maxId + 1;

        const newOrder = {
            id: newId,
            user: req.body.user || 'Guest',
            items: req.body.items,
            total: req.body.total,
            date: new Date().toLocaleString(),
            status: 'Pending'
        };
        orders.push(newOrder);
        saveData('orders.json', orders);
        console.log('Order saved successfully:', newOrder.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ success: false, message: 'Server error saving order' });
    }
});

// 3. ADMIN API (Show Orders)
app.get('/api/admin/orders', (req, res) => {
    const orders = getData('orders.json');
    res.json(orders);
});

// 4. UPDATE ORDER STATUS API
app.patch('/api/admin/orders/:id/status', (req, res) => {
    try {
        const orders = getData('orders.json');
        const orderId = parseInt(req.params.id);
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        orders[orderIndex].status = req.body.status;
        saveData('orders.json', orders);
        console.log(`Order ${orderId} status updated to: ${req.body.status}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
});

app.listen(PORT, () => {
    console.log(`SERVER IS READY! Open: http://localhost:${PORT}/index.html`);
});
