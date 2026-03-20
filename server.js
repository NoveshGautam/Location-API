require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


const authenticateToken = (req, res, next) => {
    // Look for a simple fixed string in the custom "x-api-key" header
    const token = req.headers['x-api-key'];
    
    if (!token) {
        return res.status(401).json({ error: "Access Denied: No API Key Provided." });
    }

    if (token !== process.env.MY_SECRET_TOKEN) {
        return res.status(403).json({ error: "Access Denied: Invalid API Key." });
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

        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const geoResponse = await axios.get(geoUrl);

        const cityOrTown = geoResponse.data.city || geoResponse.data.locality || "Unknown City";
        const country = geoResponse.data.countryName;
        
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
