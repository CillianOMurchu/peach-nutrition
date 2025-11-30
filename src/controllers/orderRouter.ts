import { Router, Request, Response } from "express";
import { ProductService } from "../services/ProductService.js";

export const orderRouter = Router();

/**
 * @route POST /api/v1/orders
 * @desc Accepts a new order and queues it for asynchronous processing.
 * @access Public
 */
orderRouter.post("/", async (req: Request, res: Response) => {
  const orderPayload = req.body;

  // Basic payload validation
  if (
    !orderPayload ||
    !orderPayload.userId ||
    !orderPayload.items ||
    orderPayload.items.length === 0
  ) {
    return res
      .status(400)
      .send({ message: "Invalid order payload. Missing payload, userId or items." });
  }

  console.log(`Received order request for user ${orderPayload.userId}`);

  try {
    // 1. Perform a synchronous check (e.g., mock inventory validation)
    const inventoryAvailable = ProductService.checkInventory(
      orderPayload.items
    );

    if (!inventoryAvailable) {
      return res
        .status(409)
        .send({ message: "Inventory unavailable for one or more items." });
    }

    // 2. Delegate the order processing to the SQS queue
    await ProductService.queueOrder(orderPayload);

    // 3. Return immediate success response (202 Accepted) to the client
    // RESTful best practice for asynchronous processing.
    res.status(202).send({
      message: "Order received and queued for asynchronous processing.",
      status: "ACCEPTED",
    });
  } catch (error) {
    // Handle failure to queue the message (e.g., SQS issue)
    console.error("Error processing order request:", error);
    res
      .status(500)
      .send({ message: "Internal server error during order queuing." });
  }
});
