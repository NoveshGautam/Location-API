require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


const authenticateToken = (req, res, next) => {
   
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: "Access Denied: No Token Provided." });
    }

    const token = authHeader.split(' ')[1];

    if (token !== process.env.MY_SECRET_TOKEN) {
        return res.status(403).json({ error: "Access Denied: Invalid Token." });
    }

    next(); 
};

app.get('/api/location', authenticateToken, async (req, res) => {
   
    const lat = req.query.lat;
    const lng = req.query.lng;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Please provide detailed coordinates. Example: /api/location?lat=40.71&lng=-74.00" });
    }

    try {
        console.log(`📡 Analyzing coordinates: ${lat}, ${lng}...`);

               // 1. Send coordinates to the BigDataCloud Free API
        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const geoResponse = await axios.get(geoUrl);

        // 2. Extract city and country from their JSON
        const cityOrTown = geoResponse.data.city || geoResponse.data.locality || "Unknown City";
        const country = geoResponse.data.countryName;
        
        // Let's create a formatted address since BigDataCloud separates them
        const fullAddress = `${cityOrTown}, ${geoResponse.data.principalSubdivision}, ${country}`;


               res.json({
            status: "success",
            coordinates: {
                latitude: lat,
                longitude: lng
            },
            discovered_location: {
                city: cityOrTown,
                country: country,
                full_address: fullAddress
            }
        });


    } catch (error) {
        console.error("Error identifying location:", error.message);
        res.status(500).json({ error: "Failed to process location data." });
    }
});



app.listen(PORT, () => {
    console.log(`🔒 Secure Server running on http://localhost:${PORT}`);
});
