# Location API Service
A secured, token-based Reverse Geocoding REST API built with Node.js and Express.

## Overview
This backend service accepts GPS coordinates (Latitude and Longitude) and returns structured JSON containing the specific city, country, and formatted address of that location using the BigDataCloud Geocoding API. 

## Security Architecture
This API is secured via a custom Express Middleware function that enforces **Token-Based Authentication**. 
All client requests must include a valid Bearer Token in the HTTP `Authorization` header to access the geolocation endpoints.

##  Live Demo
**Base URL:** `https://location-api-8rri.onrender.com`


## Endpoints

### 1. Reverse Geocode
Converts coordinates into a structured location object.
- **URL:** `/api/location`
- **Method:** `GET`
- **Headers Required:** 
  - `Authorization: Bearer <your_secret_token>`
  - `Content-Type: application/json`
- **Query Parameters:**
  - `lat` (Required): The latitude coordinate.
  - `lng` (Required): The longitude coordinate.

#### Example Request (Client-Side JS):
\`\`\`javascript
fetch('https://location-api-8rri.onrender.com/api/location?lat=40.71&lng=-74.00', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer YOUR_SECRET_TOKEN' }
})
\`\`\`

#### Example Success Response (200 OK):
\`\`\`json
{
  "status": "success",
  "coordinates": {
    "latitude": "40.71",
    "longitude": "-74.00"
  },
  "discovered_location": {
    "city": "New York",
    "country": "United States",
    "full_address": "New York, New York, United States"
  }
}
\`\`\`

## 🛡️ Edge Case & Error Handling
- **400 Bad Request:** Triggered if `lat` or `lng` parameters are missing from the URL.
- **401 Unauthorized:** Triggered if the HTTP request is missing the Authorization header.
- **403 Forbidden:** Triggered if the provided Bearer token is invalid or expired.
- **500 Internal Server Error:** Fallback triggered if the external geocoding service times out or fails to resolve the coordinates. 
