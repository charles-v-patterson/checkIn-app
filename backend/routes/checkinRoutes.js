const express = require('express')
const axios = require('axios');
const router = express.Router()
const { isOnSpecificNetwork } = require('../controllers/networkController.js');

// endpoint to check if user is on a specific network
router.get('/api/check-network', async (req, res) => {
    const response = await axios.get("https://api.ipify.org?format=json");
    const userIPAddress = response.data.ip;
    const networkCIDR = '129.41.87.0/24'; // network CIDR notation
    try {
        const result = await isOnSpecificNetwork(userIPAddress, networkCIDR);
        res.json({ onSpecificNetwork: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while checking network status.' });
    }
});

module.exports = router;