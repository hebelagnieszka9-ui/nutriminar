
# 🍏 NutriMinar — AI-Powered Meal Nutrition Analyzer & QA Testing Portfolio

NutriMinar is an application built to analyze the nutritional value of food from photos using Artificial Intelligence and calculate macronutrients. 

This repository serves a dual purpose:
1. A **coding showcase** built with Node.js, Express, and React Native (Expo).
2. A **primary Quality Assurance (QA) Testing Portfolio** demonstrating manual API testing, test scenario design, boundary value analysis, and structured defect reporting.

---

## 🛠 Tech Stack & Architecture

* **Frontend:** React Native / Expo (TypeScript)
* **Backend:** Node.js / Express API (`POST /api/analyze-meal`)
* **AI Engine:** OpenAI GPT-4 Vision API Integration
* **Data Validation:** Zod Schema Validation

---

## 🎯 QA & Testing Showcase

As a QA Engineer, I actively treated the NutriMinar backend API as a product under test. All QA artifacts are documented using industry-standard templates based on ISTQB principles:

* 📋 **[Test Cases Document (docs/TEST-CASES.md)](./docs/TEST-CASES.md):** 
  Comprehensive test scenarios covering functional positive testing (Happy Path), boundary value analysis (BVA), unauthorized request handling, invalid content-type payloads, and AI-unmatched product edge cases (`TC-001` through `TC-005`).

* 🐛 **[Defect Reports (GitHub Issues)](../../issues):** 
  5 formally documented bug reports created during dynamic API testing using cURL and zsh terminal scripts (`BUG-001` through `BUG-005`). Each report includes Environment, Preconditions, Steps to Reproduce, Expected vs. Actual Results, and Severity Assessment.

---

## 🚀 Project Roadmap & QA Status

- [x] Basic UI and navigation setup (React Native / Expo).
- [x] Backend Express server initialization & Zod request validation.
- [x] OpenAI Vision API integration for meal & ingredient recognition.
- [x] **Comprehensive QA Test Plan & Scenario Design (`TC-001` - `TC-005`).**
- [x] **Dynamic API Testing & Defect Logging (`BUG-001` - `BUG-005`).**
- [ ] Automated API integration tests suite setup.
