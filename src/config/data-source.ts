// src/config/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "../entities/Product.js";

// This is the main configuration object for TypeORM
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost", // Host machine where Docker mapped the port
  port: 5432,
  username: "pn_user", // The user created in Step 6
  password: "pn_password", // The password created in Step 6
  database: "peach_nutrition_db", // The database created in Step 6
  synchronize: true, // WARNING: Only for development! Creates/updates tables automatically
  logging: false,
  entities: [Product], // Will hold our models (e.g., User, Product) soon
  migrations: [],
  subscribers: [],
});

// Function to initialize the connection
export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized successfully!");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
  }
};
