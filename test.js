/**
 * TEST CLIENT FOR LOCATION API
 * -----------------------------
 * This script simulates a Frontend Application or a 3rd-party Backend 
 * securely requesting location data from the protected Location API.
 */

const fetchSecureLocation = async () => {
    try {
        // Example Coordinates (New Delhi, India)
        const lat = 28.6139;
        const lng = 77.2090;
        
        console.log(`\n📡 Sending secured request for coordinates: ${lat}, ${lng}...`);

        // The live API endpoint hosted on Render
        const API_ENDPOINT = `https://location-api-8rri.onrender.com/api/location?lat=${lat}&lng=${lng}`;

        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                // The required token-based authentication header
                'Authorization': 'Bearer novesh_secure_token_2026',
                'Content-Type': 'application/json'
            }
        });

        // Parse and display the JSON response
        const data = await response.json();
        
        console.log("\n✅ SERVER RESPONSE (JSON):");
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("❌ Failed to fetch:", error.message);
    }
};

fetchSecureLocation();
