# Test Cases: NutriMinar Backend API (`/api/analyze-meal`)

## TC-001: Successful Meal Analysis with Valid Bearer Token and Payload

**Test Level:** System Integration / API Testing  
**Test Type:** Functional (Positive Test)  
**Preconditions:**
* Backend server is running locally (`npx tsx backend/src/server.ts`).
* Environment variable `VISION_SHARED_SECRET` is set (e.g., `moj_super_tajny_klucz`).
* A valid Base64 encoded image string (length >= 20 characters) is prepared.

**Test Steps:**
1. Open the API testing tool (e.g., cURL or Postman).
2. Set request method to `POST` and URL to `http://localhost:3000/api/analyze-meal`.
3. Add header: `Content-Type: application/json`.
4. Add header: `Authorization: Bearer moj_super_tajny_klucz`.
5. Send a valid JSON body payload: 
   `{"image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}`
6. Execute the request.

**Expected Result:**
* The server responds with HTTP status `200 OK`.
* The response body returns a valid JSON containing `detectedMeal`, `confidence`, `ingredients` array, `totals` object, and the legal/medical disclaimer `note`.

**Status:** Ready / Automated Structure Planned
---



## TC-002: Reject Request When Image Base64 String Violates Minimum Length Validation (<20 chars)

**Test Level:** System Integration / API Testing  
**Test Type:** Functional (Negative Test / Boundary Value Analysis)  
**Preconditions:**
* Backend server is running locally (`npx tsx backend/src/server.ts`).
* A valid Bearer Token (`VISION_SHARED_SECRET`) is provided in request headers.

**Test Steps:**
1. Open the API testing tool (e.g., cURL or Postman).
2. Set request method to `POST` and URL to `http://localhost:3000/api/analyze-meal`.
3. Add header: `Content-Type: application/json`.
4. Add header: `Authorization: Bearer moj_super_tajny_klucz`.
5. Send a payload with an `image` string of 19 characters (invalid boundary value):
   `{"image": "1234567890123456789"}`
6. Execute the request.

**Expected Result:**
* The server rejects the payload and returns HTTP status `400 Bad Request`.
* The response body contains the error payload: `{"error": "Invalid request body"}`.

**Status:** Ready / Automated Structure Planned
