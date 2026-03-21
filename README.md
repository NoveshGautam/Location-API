# 🌍 Location & AI Health Advisory API
A secured, token-based Reverse Geocoding and Epidemiological REST API built with Node.js, Express, and Google Gemini AI.

## 📌 Overview
This backend service accepts GPS coordinates (Latitude and Longitude) and reverse-geocodes them into a structured city/country object. It then utilizes a **Bring Your Own Key (BYOK)** architecture to dynamically generate specific clinical health, weather, and food advisories for that exact geographic location using Google Gemini AI.

## 🔒 Security Architecture
This API is secured via two distinct mechanisms:
1. **Server Authentication:** A custom Express Middleware function enforces fixed-string token authentication via the `x-api-key` header to prevent unauthorized server access.
2. **AI Authentication (BYOK):** To manage AI generation costs, clients must provide their own Google Gemini API key via the `x-gemini-key` header. The server dynamically instances the AI model using the client's provided key.

## 🚀 Live Demo
**Base URL:** `https://location-api-8rri.onrender.com`

## 🛣️ Endpoints

### 1. Reverse Geocode & Health Advisory
Converts coordinates into a location object and returns clinical risk advisories.
- **URL:** `/api/location`
- **Method:** `GET`
- **Headers Required:** 
  - `x-api-key: <your_x_API_KEY>`
  - `x-gemini-key: <your_google_gemini_api_key>`
  - `Content-Type: application/json`
- **Query Parameters:**
  - `lat` (Required): The latitude coordinate.
  - `lng` (Required): The longitude coordinate.

#### Example Request (Client-Side JS):
\`\`\`javascript
fetch('https://location-api-8rri.onrender.com/api/location?lat=28.6139&lng=77.2090', {
    method: 'GET',
    headers: { 
        'x-api-key': 'novesh_production_master_key_8x99Q!',
        'x-gemini-key': 'AIzaS...YOUR_GEMINI_KEY'
    }
})
\`\`\`

#### Example Success Response (200 OK):
\`\`\`json
{
  "location": "Delhi, India",
  "health_advisories": [
    {
      "type": "weather",
      "advisory": "Heat exhaustion is a critical risk due to Delhi's extreme pre-monsoon temperatures; maintain electrolyte balance and avoid direct sun exposure."
    },
    {
      "type": "food",
      "advisory": "Typhoid fever is a common food and water-borne risk in the National Capital Region; ensure all water is boiled or bottled."
    },
    {
      "type": "general",
      "advisory": "Delhi faces severe environmental health risks from PM2.5 air pollution; use N95 respirators during periods of poor air quality."
    }
  ]
}
\`\`\`

## 🛡️ Edge Case & Error Handling
- **400 Bad Request:** Triggered if `lat` or `lng` parameters are missing.
- **400 Bad Request:** Triggered if the client fails to provide an active `x-gemini-key` header.
- **401 Unauthorized:** Triggered if the HTTP request is missing the `x-api-key` server token.
- **401 Unauthorized:** Triggered by Google Generative AI if the provided `x-gemini-key` is invalid, restricted, or expired.
- **403 Forbidden:** Triggered if the provided `x-api-key` is an invalid mismatch.
- **500 Internal Server Error:** Fallback triggered if external geocoding services (BigDataCloud) time out or fail to resolve. 
