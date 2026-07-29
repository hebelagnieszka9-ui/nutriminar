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


---

## TC-003: Reject Request When Authorization Header is Missing or Invalid

**Test Level:** System Integration / API Testing  
**Test Type:** Functional (Security & Access Control / Negative Test)  
**Preconditions:**
* Backend server is running locally (`npx tsx backend/src/server.ts`).
* Environment variable `VISION_SHARED_SECRET` is set on the server.

**Test Steps:**
1. Open the API testing tool (e.g., cURL or Postman).
2. Set request method to `POST` and URL to `http://localhost:3000/api/analyze-meal`.
3. Add header: `Content-Type: application/json`.
4. Intentionally omit the `Authorization` header (or send an invalid token like `Bearer invalid_token_123`).
5. Send a valid JSON body payload:
   `{"image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}`
6. Execute the request.

**Expected Result:**
* The server rejects the request with HTTP status `401 Unauthorized`.
* The response body contains the error payload: `{"error": "Unauthorized"}`.

**Status:** Ready / Automated Structure Planned

---

## TC-004: Reject Request When Content-Type Header is Invalid or Unsupported

**Test Level:** System Integration / API Testing  
**Test Type:** Functional (API Request Validation / Negative Test)  
**Preconditions:**
* Backend server is running locally (`npx tsx backend/src/server.ts`).
* A valid Bearer Token (`VISION_SHARED_SECRET`) is provided in request headers.

**Test Steps:**
1. Open the API testing tool (e.g., cURL or Postman).
2. Set request method to `POST` and URL to `http://localhost:3000/api/analyze-meal`.
3. Set header: `Content-Type: text/plain` (or `application/xml` instead of `application/json`).
4. Add header: `Authorization: Bearer moj_super_tajny_klucz`.
5. Send a raw text payload or malformed content.
6. Execute the request.

**Expected Result:**
* The server fails to parse the body as JSON and rejects the request.
* Returns HTTP status `400 Bad Request` or `415 Unsupported Media Type` without causing an unhandled internal server crash (`500 Internal Server Error`).

**Status:** Ready / Automated Structure Planned

---

## TC-005: Handle AI-Recognized Ingredients Missing from Local Product Database

**Test Level:** System Integration / API & Business Logic Testing  
**Test Type:** Functional (Business Logic / Edge Case)  
**Preconditions:**
* Backend server is running locally (`npx tsx backend/src/server.ts`).
* A valid Bearer Token (`VISION_SHARED_SECRET`) is provided in request headers.
* Mock/live AI response returns an ingredient name that does NOT exist in `productDb.ts` (e.g., `"Dragon Fruit"`).

**Test Steps:**
1. Send a valid `POST` request to `http://localhost:3000/api/analyze-meal`.
2. Provide a Base64 image payload representing a meal with an exotic or unlisted ingredient.
3. Receive the `200 OK` JSON response from the server.
4. Inspect the `ingredients` array and the `totals` object in the response payload.

**Expected Result:**
* The unmatched ingredient is safely mapped in the response with `matched: false` and `nutrition: null` without throwing a server error.
* The API includes an appropriate status or warning flag informing the client UI that certain ingredients could not be calculated into the macronutrient totals.

**Status:** Ready / Automated Structure Planned
