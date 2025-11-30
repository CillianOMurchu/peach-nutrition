// src/controllers/OrderController.ts

import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService.js';

/**
 * Handles POST /order requests.
 * This simulates placing an order by queuing it for asynchronous processing.
 */
export const placeOrder = async (req: Request, res: Response) => {
    const orderPayload = req.body;
    
    // Basic payload validation
    if (!orderPayload || !orderPayload.userId || !orderPayload.items || orderPayload.items.length === 0) {
        return res.status(400).send({ message: "Invalid order payload. Missing payload, userId or items." });
    }

    console.log(`Received order request for user ${orderPayload.userId}`);

    try {
        // 1. Perform a synchronous check (e.g., mock inventory validation)
        const inventoryAvailable = ProductService.checkInventory(orderPayload.items);

        if (!inventoryAvailable) {
            return res.status(409).send({ message: "Inventory unavailable for one or more items." });
        }

        // 2. Delegate the order processing to the SQS queue
        await ProductService.queueOrder(orderPayload);
        
        // 3. Return immediate success response (202 Accepted) to the client
        res.status(202).send({ 
            message: "Order received and queued for asynchronous processing.",
            status: "ACCEPTED" 
        });

    } catch (error) {
        // The queueOrder function throws an error if SQS fails
        console.error("Error processing order request:", error);
        res.status(500).send({ message: "Internal server error during order queuing." });
    }
};