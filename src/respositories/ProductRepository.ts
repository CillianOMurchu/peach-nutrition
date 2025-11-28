import { AppDataSource } from "../config/data-source.js";
import { Product } from "../entities/Product.js";

// Get the standard TypeORM repository instance for the Product entity
const repository = AppDataSource.getRepository(Product);

/**
 * Data Access Layer (Repository) for Products.
 * This module handles direct interaction with the 'products' table.
 */
export const ProductRepository = {
    /**
     * Finds all available products in the database.
     * @returns A promise resolving to an array of Product entities.
     */
    findAllAvailable: async (): Promise<Product[]> => {
        return repository.find({ 
            where: { isAvailable: true },
            // Use relational database features to order by name or ID
            order: { name: "ASC" } 
        });
    },

    /**
     * Creates and saves a new Product entity to the database.
     * @param productData - Partial data for the new product.
     * @returns A promise resolving to the created Product entity.
     */
    create: async (productData: Partial<Product>): Promise<Product> => {
        // TypeORM's save method handles both insert and update.
        // When passed a new object (without an ID), it inserts it.
        const newProduct = repository.create(productData);
        return repository.save(newProduct);
    },

    /**
     * Finds a single product by its ID.
     */
    findById: async (id: number): Promise<Product | null> => {
        return repository.findOne({ where: { id } });
    },

    /**
     * Saves the provided product entity (handles both insert and update).
     * @param product - The product entity with updated fields.
     */
    save: async (product: Product): Promise<Product> => {
        return repository.save(product);
    },

    /**
     * Deletes a product by its ID.
     * @param id - ID of the product to delete.
     * @returns The result of the deletion operation.
     */
    delete: async (id: number) => {
        // TypeORM's delete method returns the deletion result.
        return repository.delete(id);
    },

};