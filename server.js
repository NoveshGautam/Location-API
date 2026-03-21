// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());


// const authenticateToken = (req, res, next) => {
    
//     const token = req.headers['x-api-key'];
    
//     if (!token) {
//         return res.status(401).json({ error: "Access Denied: No API Key Provided." });
//     }

//     if (token !== process.env.MY_SECRET_TOKEN) {
//         return res.status(403).json({ error: "Access Denied: Invalid API Key." });
//     }

//     next(); 
// };


// app.get('/api/location', authenticateToken, async (req, res) => {
   
//     const lat = req.query.lat;
//     const lng = req.query.lng;

//     if (!lat || !lng) {
//         return res.status(400).json({ error: "Please provide detailed coordinates. Example: /api/location?lat=40.71&lng=-74.00" });
//     }

//     try {
//         console.log(`📡 Analyzing coordinates: ${lat}, ${lng}...`);

//         const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
//         const geoResponse = await axios.get(geoUrl);

//         const cityOrTown = geoResponse.data.city || geoResponse.data.locality || "Unknown City";
//         const country = geoResponse.data.countryName;
        
//         const fullAddress = `${cityOrTown}, ${geoResponse.data.principalSubdivision}, ${country}`;

//               res.json({
//             status: "success",
//             coordinates: {
//                 latitude: lat,
//                 longitude: lng
//             },
//             discovered_location: {
//                 city: cityOrTown,
//                 country: country,
//                 full_address: fullAddress
//             }
//         });


//     } catch (error) {
//         console.error("Error identifying location:", error.message);
//         res.status(500).json({ error: "Failed to process location data." });
//     }
// });


// app.listen(PORT, () => {
//     console.log(` Secure Server running on http://localhost:${PORT}`);
// });









require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. The VIP Bouncer (Fixed String Security)
const authenticateToken = (req, res, next) => {
    const token = req.headers['x-api-key'];
    
    if (!token) {
        return res.status(401).json({ error: "Access Denied: No API Key Provided." });
    }

    if (token !== process.env.MY_SECRET_TOKEN) {
        return res.status(403).json({ error: "Access Denied: Invalid API Key." });
    }

    next(); 
};

// 2. The Master Route
app.get('/api/location', authenticateToken, async (req, res) => {
   
    const lat = req.query.lat;
    const lng = req.query.lng;
    
    // The "Bring Your Own Key" AI feature 
    const clientGeminiKey = req.headers['x-gemini-key'];

    if (!lat || !lng) {
        return res.status(400).json({ error: "Please provide detailed coordinates. Example: /api/location?lat=40.71&lng=-74.00" });
    }
    
    if (!clientGeminiKey) {
         return res.status(400).json({ error: "Authentication Error: Please provide your own Gemini API Key in the 'x-gemini-key' header to generate Health Advisories." });
    }

    try {
        console.log(`📡 Analyzing coordinates: ${lat}, ${lng}...`);

        // A. Fetch Geographic Location
        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const geoResponse = await axios.get(geoUrl);

        const cityOrTown = geoResponse.data.city || geoResponse.data.locality || "Unknown City";
        const country = geoResponse.data.countryName;
        
        console.log(`🧠 Asking AI for strict health advisories in ${cityOrTown}...`);

        // B. Load AI using the Client's Provided Key
        const genAI = new GoogleGenerativeAI(clientGeminiKey);
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        // Strict JSON Array Prompt
        const prompt = `
            Act as a medical epidemiologist. The user is currently in ${cityOrTown}, ${country}.
            Identify specific clinical health risks that exist in this exact location based on its climate and geography.
            You MUST return ONLY a raw JSON array of objects with no markdown formatting. Do not wrap it in a parent object. 
            Use this EXACT structure with 3 specific advisories:
            [
                {
                    "type": "weather",
                    "advisory": "Name a specific health condition caused by the current historical weather/climate of this city, and a 1-sentence medical prevention tip."
                },
                {
                    "type": "food",
                    "advisory": "Name a specific food/water-borne illness risk common to this region, and a 1-sentence prevention tip."
                },
                {
                    "type": "general",
                    "advisory": "One major environmental health risk (e.g. Air Quality, Dengue, Ultraviolet Index) specific to this city."
                }
            ]
        `;

        const aiResponse = await model.generateContent(prompt);
        
        // Remove markdown formatting to preserve valid JSON
        const cleanJsonText = aiResponse.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const advisoriesArray = JSON.parse(cleanJsonText);

        // C. Send the exact formatted payload requested by the Senior!
        res.json({
            location: `${cityOrTown}, ${country}`,
            health_advisories: advisoriesArray
        });


    } catch (error) {
        console.error("Error identifying location:", error.message);
        
        // Catch invalid Gemini Keys
        if (error.message.includes("API key not valid")) {
            return res.status(401).json({ error: "The x-gemini-key you provided is invalid or expired."});
        }
        
        res.status(500).json({ error: "Failed to process location and advisory data." });
    }
});

app.listen(PORT, () => {
    console.log(`🔒 Secure AI Server running on http://localhost:${PORT}`);
});
