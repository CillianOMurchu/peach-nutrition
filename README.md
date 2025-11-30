
# 🍑 Peach Nutrition API
A Node.js TypeScript REST API for managing the Peach Nutrition e-commerce platform's products and asynchronous order processing.

## 🚀 Technologies
- Node.js (ES Modules)
- TypeScript
- PostgreSQL (Docker-managed)
- TypeORM ORM
- Express.js
- Layered architecture (Controller-Service-Repository)

## 🏗️ Architecture Overview
- **Controller:** Handles HTTP requests and responses
- **Service:** Contains business logic
- **Repository:** Manages database access with TypeORM

## 📋 API Endpoints (Full CRUD under `/api/v1`)

| Resource  | Method | Path                | Description                       |
|-----------|--------|---------------------|-----------------------------------|
| Products  | GET    | /products           | List all products                 |
| Products  | POST   | /products           | Create a product                  |
| Products  | POST   | /products/bulk      | Bulk create (for Shopify CSV import) |
| Products  | PATCH  | /products/:id       | Update a product partially        |
| Products  | DELETE | /products/:id       | Delete a product                  |
| Orders    | POST   | /orders             | Queue a new order for asynchronous processing (202 Accepted) |

## ☁️ Asynchronous Order Processing
Orders are handled asynchronously using AWS SAM, SQS, and Lambda:

1. Client posts order (**202 ACCEPTED**)
2. API enqueues order message to SQS
3. Lambda triggered by SQS processes the order

## 🛠️ Getting Started
1. Clone the repo
2. Install dependencies: `npm install`
3. Start PostgreSQL with Docker:
	```sh
	docker compose up -d
	```
4. Run the API server (development mode):
	```sh
	npm run dev
	```