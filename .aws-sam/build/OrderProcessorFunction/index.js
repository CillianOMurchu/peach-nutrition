"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const REGION = "eu-north-1";
const SENDER_EMAIL = "admin@peachrestore.com";
const RECIPIENT_EMAIL = "cillian.murchu@gmail.com";
const sesClient = new client_ses_1.SESClient({ region: REGION });
function createEmailBody(order) {
    let body = `New Order Received - ID: ${order.userId}\n\n`;
    body += `Order Date: ${order.orderDate}\n\n`;
    body += "Items:\n";
    order.items.forEach((item) => {
        const details = Object.entries(item)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
        body += ` - ${details}\n`;
    });
    body += "\n--- End of Order ---";
    return body;
}
async function sendOrderEmail(order) {
    const emailBody = createEmailBody(order);
    const command = new client_ses_1.SendEmailCommand({
        Destination: { ToAddresses: [RECIPIENT_EMAIL] },
        Message: {
            Body: {
                Text: { Data: emailBody },
            },
            Subject: { Data: `PEACH NUTRITION - NEW ORDER #${order.userId}` },
        },
        Source: SENDER_EMAIL, // This must be your verified domain email
    });
    await sesClient.send(command);
    console.log(`Email notification sent for Order ID: ${order.userId}`);
}
const handler = async (event, context) => {
    console.log(`Received ${event.Records.length} messages from SQS.`);
    const batchItemFailures = [];
    for (const record of event.Records) {
        try {
            const orderPayload = JSON.parse(record.body);
            await sendOrderEmail(orderPayload);
            console.log(`[ORDER PROCESSOR] Successfully processed and notified for Order ID: ${orderPayload.userId} with ${orderPayload.items.length} items.`);
        }
        catch (error) {
            console.error("Error processing SQS record and sending email:", error);
            // Fail this item so SQS re-attempts processing or sends it to a DLQ
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }
    return { batchItemFailures };
};
exports.handler = handler;
