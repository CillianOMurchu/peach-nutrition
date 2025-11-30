import { Router, Request, Response } from "express";
import { ProductService } from "../services/ProductService.js";
import { Product } from "../entities/Product.js";

export const productRouter = Router();

/**
 * @route GET /api/v1/products
 * @desc Retrieves a list of all available products.
 * @access Public
 */
productRouter.get("/", async (req: Request, res: Response) => {
  try {
    // Controller delegates business logic to the Service Layer
    const products = await ProductService.getAvailableProducts();

    // Sends successful HTTP 200 response with the data
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    // Sends a generic HTTP 500 error response
    return res.status(500).json({
      message: "Internal Server Error during product retrieval.",
    });
  }
});

productRouter.post("/", async (req: Request, res: Response) => {
  try {
    const data = req.body; // Product data comes from the request body

    const newProduct = await ProductService.createNewProduct(data);

    // RESTful best practice: Use HTTP 201 Created status code
    // and return the newly created resource.
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    // Handle specific validation errors differently in a real app
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid input data.",
    });
  }
});

/**
 * @route PATCH /api/v1/products/:id
 * @desc Updates one or more fields of a specific product.
 * @access Private (Requires Auth/Admin Role)
 */
productRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== "string") {
      return res
        .status(400)
        .json({ message: "Product ID is required in the URL." });
    }
    const id = parseInt(idParam); // Extract ID from URL path parameters
    const data = req.body; // Partial data for update

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }

    const updatedProduct = await ProductService.updateProduct(id, data);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." }); // RESTful best practice: 404
    }

    // RESTful best practice: 200 OK and return the updated resource
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "Internal Server Error during product update.",
    });
  }
});

/**
 * @route DELETE /api/v1/products/:id
 * @desc Deletes a product from the inventory.
 * @access Private (Requires Auth/Admin Role)
 */
productRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== "string") {
      return res
        .status(400)
        .json({ message: "Product ID is required in the URL." });
    }
    const id = parseInt(idParam); // Extract ID from URL path parameters

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID format." });
    }

    const success = await ProductService.deleteProduct(id);

    if (!success) {
      return res
        .status(404)
        .json({ message: "Product not found or already deleted." });
    }

    // RESTful best practice: HTTP 204 No Content for successful deletion
    // (no response body is returned).
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "Internal Server Error during product deletion.",
    });
  }
});

/**
 * @route POST /api/v1/products/bulk
 * @desc Creates multiple products from a single JSON array payload.
 * @access Private
 */
productRouter.post("/bulk", async (req: Request, res: Response) => {
  try {
    const data: Partial<Product>[] = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ message: "Payload must be a non-empty array." });
    }

    const newProducts = await ProductService.createBulkProducts(data);

    // RESTful best practice: 201 Created
    return res.status(201).json(newProducts);
  } catch (error) {
    console.error("Error creating bulk products:", error);
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Bulk import failed due to invalid data.",
    });
  }
});
