import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";
import { ProductRepository } from "../respositories/ProductRepository.js";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const SQS = new SQSClient({ region: "eu-north-1" });

const ORDER_QUEUE_URL =
  "https://sqs.eu-north-1.amazonaws.com/938177530055/OrderProcessingQueue";

/**
 * Business Logic Layer (Service) for Products.
 * Handles business rules and coordinates data access.
 */
export const ProductService = {
  /**
   * Fetches all products that are currently marked as available.
   * Includes any necessary business logic (e.g., pricing adjustments, logging).
   * @returns A promise resolving to an array of Product entities.
   */
  getAvailableProducts: async (): Promise<Product[]> => {
    // Example of where future business logic would go (e.g., checking promotions)

    // Delegates the data fetching directly to the Repository
    const products = await ProductRepository.findAllAvailable();

    // Example of post-processing logic (e.g., masking sensitive fields or logging)
    console.log(`Fetched ${products.length} available products.`);

    return products;
  },

  /**
   * Handles business logic for product creation (e.g., validation).
   * @param data - The raw product data from the controller.
   * @returns A promise resolving to the newly created Product entity.
   */
  createNewProduct: async (data: Partial<Product>): Promise<Product> => {
    // 💡 Business Logic Example: Here you might check permissions,
    // validate fields (e.g., price > 0), or set default values.
    if (!data.name || data.price === undefined) {
      throw new Error("Product name and price are required.");
    }
    // Delegate saving to the Repository
    return ProductRepository.create(data);
  },

  /**
   * Updates an existing product with the given data.
   * @param id - ID of the product to update.
   * @param data - The partial data to apply.
   * @returns The updated Product entity, or null if not found.
   */
  updateProduct: async (
    id: number,
    data: Partial<Product>
  ): Promise<Product | null> => {
    const product = await ProductRepository.findById(id);

    if (!product) {
      return null; // Product not found
    }

    // Apply partial updates to the existing entity
    Object.assign(product, data);

    // Delegate saving to the Repository
    return ProductRepository.save(product);
  },

  /**
   * Attempts to delete a product by ID.
   * @param id - ID of the product to delete.
   * @returns true if deletion was successful (one or more rows affected), false otherwise.
   */
  deleteProduct: async (id: number): Promise<boolean> => {
    // Find the product first to implement a cleaner 404 response in the Controller
    const product = await ProductRepository.findById(id);

    if (!product) {
      return false; // Product does not exist
    }

    // Delegate deletion to the Repository
    const deleteResult = await ProductRepository.delete(id);

    // Check if the deletion was successful (TypeORM returns a result object)
    return (
      deleteResult.affected !== undefined &&
      deleteResult.affected !== null &&
      deleteResult.affected > 0
    );
  },

  /**
   * Creates multiple new product entities in a single batch operation.
   * @param data - An array of raw product data objects.
   * @returns A promise resolving to an array of the newly created Product entities.
   */
  createBulkProducts: async (data: Partial<Product>[]): Promise<Product[]> => {
    // You could wrap this in a transaction here for ACID compliance,
    // but for simplicity, we rely on TypeORM's batch save.

    // Example: Validate all items before attempting to save
    for (const item of data) {
      if (!item.name || item.price === undefined) {
        throw new Error(
          "Bulk upload failed: Missing name or price in one item."
        );
      }
    }

    // Create an array of product entities and delegate saving to the Repository
    const productEntities = data.map((item) =>
      AppDataSource.getRepository(Product).create(item)
    );
    return AppDataSource.getRepository(Product).save(productEntities);
  },

  /**
   * Delegates the order processing task by sending the order payload to the SQS queue.
   * @param orderPayload The order data to queue.
   */
  queueOrder: async (orderPayload: any): Promise<void> => {
    if (!ORDER_QUEUE_URL) {
      console.error("SQS Queue URL is not set. Cannot queue order.");
      throw new Error("Service Misconfiguration: SQS Queue URL is missing.");
    }

    console.log(`Sending order message to SQS Queue: ${ORDER_QUEUE_URL}`);

    const command = new SendMessageCommand({
      QueueUrl: ORDER_QUEUE_URL,
      MessageBody: JSON.stringify(orderPayload),
    });

    try {
      const response = await SQS.send(command);
      console.log("Order successfully queued. Message ID:", response.MessageId);
    } catch (error) {
      console.error("Failed to queue order:", error);
      // Re-throw the error to be handled by the controller
      throw new Error("Failed to queue order message.");
    }
  },

  /**
   * Placeholder for a synchronous check before queueing the order.
   * @param items - Array of items in the order.
   * @returns Always true for now, until actual logic is implemented.
   */
  checkInventory: (items: any[]): boolean => {
    // 💡 Placeholder for real inventory logic (e.g., checking stock levels in the database)
    console.log(`Simulating quick inventory check for ${items.length} items.`);
    return true;
  },
};
