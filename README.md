
# 🍑 Peach Nutrition API

A Node.js + TypeScript REST API for the Peach Nutrition e-commerce platform. It manages products and supports fully asynchronous order processing using AWS cloud services.

## 🚀 Technologies

- Node.js (ES Modules)
- TypeScript
- Express.js (web framework)
- PostgreSQL (Docker-managed)
- TypeORM (ORM)
- AWS SQS (Simple Queue Service)
- AWS Lambda (serverless compute)
- AWS SES (Simple Email Service)
- Layered architecture (Controller → Service → Repository)

## 🏗️ Architecture Overview

- **Controller Layer:** Handles HTTP requests and responses (`src/controllers/`)
- **Service Layer:** Contains business logic, validation, and orchestration (`src/services/ProductService.ts`)
- **Repository Layer:** Manages database access with TypeORM (`src/respositories/ProductRepository.ts`)
- **Cloud Worker:** Processes queued orders and sends notification emails (`worker-src/index.ts`)

## 📋 API Endpoints (all under `/api/v1`)

| Resource  | Method | Path                | Description                                                        |
|-----------|--------|---------------------|--------------------------------------------------------------------|
| Products  | GET    | /products           | List all products                                                  |
| Products  | POST   | /products           | Create a product                                                   |
| Products  | POST   | /products/bulk      | Bulk create products (for Shopify CSV import)                      |
| Products  | PATCH  | /products/:id       | Update a product partially                                         |
| Products  | DELETE | /products/:id       | Delete a product                                                   |
| Orders    | POST   | /orders             | Queue a new order for asynchronous processing (returns 202 Accepted)|

## ☁️ Asynchronous Order Processing

- Orders are handled asynchronously using AWS SAM, SQS, and Lambda.
- When a client posts an order, the API validates and enqueues the order to SQS.
- AWS Lambda is triggered by SQS, processes the order, and sends a notification email via SES.
- The Lambda worker dynamically includes all item attributes in the email (e.g., productId, quantity, name, description, etc.).

## 🛠️ Getting Started

1. Clone the repo
2. Install dependencies:
	```sh
	npm install
	```
3. Start PostgreSQL with Docker:
	```sh
	docker compose up -d
	```
4. Run the API server (development mode):
	```sh
	npm run dev
	```
5. To build and deploy the AWS Lambda worker:
	```sh
	npm run sam-build
	npm run sam-deploy
	```

## ✅ Current Functionality

- Full CRUD for products, including bulk import.
- Orders are validated, checked for inventory, and queued for asynchronous processing.
- Asynchronous order processing pipeline is fully implemented and confirmed working end-to-end.
- Lambda worker sends notification emails for each processed order, including all item details.
- All cloud resources (SQS, Lambda, SES) are managed via AWS SAM.