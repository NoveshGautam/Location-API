

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const token = req.headers['x-api-key'];
    if (!token || token !== process.env.MY_SECRET_TOKEN) {
        return res.status(403).json({ error: "Access Denied: Invalid VIP API Key." });
    }
    next(); 
};

app.get('/api/location', authenticateToken, async (req, res) => {
    const lat = req.query.lat;
    const lng = req.query.lng;
    
    const geminiKey = req.headers['x-gemini-key'];
    const openaiKey = req.headers['x-openai-key'];
    const grokKey = req.headers['x-grok-key'];

    if (!lat || !lng) {
        return res.status(400).json({ error: "Please provide lat and lng coordinates." });
    }
    
    if (!geminiKey && !openaiKey && !grokKey) {
         return res.status(400).json({ error: "Please provide at least one AI key (x-gemini-key, x-openai-key, or x-grok-key)." });
    }

    try {
        console.log(`📡 Analyzing coordinates: ${lat}, ${lng}...`);

        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const geoResponse = await axios.get(geoUrl);
        const cityOrTown = geoResponse.data.city || geoResponse.data.locality || "Unknown City";
        const country = geoResponse.data.countryName;
        
        console.log(`🧠 Launching AI Swarm for ${cityOrTown}...`);

        const prompt = `
            Act as a medical epidemiologist. The user is in ${cityOrTown}, ${country}.
            Return ONLY a raw JSON array of 3 objects (weather, food, general health risks). No markdown formatting.
            Structure: [{"type": "...", "advisory": "..."}]
        `;

        const aiPromises = [];
        const aiNames = []; 

        if (geminiKey) {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const geminiPromise = model.generateContent(prompt).then(res => {
                return JSON.parse(res.response.text().replace(/```json/g, "").replace(/```/g, "").trim());
            });
            aiPromises.push(geminiPromise);
            aiNames.push("Google Gemini");
        }

        if (openaiKey) {
            const openaiClient = new OpenAI({ apiKey: openaiKey });
            const openaiPromise = openaiClient.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }]
            }).then(res => {
                return JSON.parse(res.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim());
            });
            aiPromises.push(openaiPromise);
            aiNames.push("OpenAI ChatGPT");
        }

        if (grokKey) {

            const grokClient = new OpenAI({ apiKey: grokKey, baseURL: "https://api.x.ai/v1" });
            const grokPromise = grokClient.chat.completions.create({
                model: "grok-2-latest",
                messages: [{ role: "user", content: prompt }]
            }).then(res => {
                return JSON.parse(res.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim());
            });
            aiPromises.push(grokPromise);
            aiNames.push("xAI Grok");
        }


        const results = await Promise.all(aiPromises);

        const finalAdvisories = {};
        for (let i = 0; i < results.length; i++) {
            finalAdvisories[aiNames[i]] = results[i];
        }

        res.json({
            location: `${cityOrTown}, ${country}`,
            status: `Successfully generated data from ${results.length} AI models simultaneously!`,
            advisories: finalAdvisories
        });


    } catch (error) {
        console.error("Error processing multi-AI request:", error.message);
        res.status(500).json({ error: "One or more of the provided API keys were invalid, or an AI service timed out." });
    }
});

app.listen(PORT, () => {
    console.log(`🔒 Multi-AI Engine running on http://localhost:${PORT}`);
});
