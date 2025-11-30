import { SQSEvent, Context, SQSBatchResponse } from "aws-lambda";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"; // ⚠️ MISSING IMPORTS

// --- CONFIGURATION ---
const REGION = "eu-north-1";
const SENDER_EMAIL = "admin@peachrestore.com";
const RECIPIENT_EMAIL = "cillian.murchu@gmail.com";

// --- CLIENT INITIALIZATION ---
const sesClient = new SESClient({ region: REGION }); // ⚠️ MISSING CLIENT

// Function to generate the email body from the order payload
function createEmailBody(order: any) {
  let body = `New Order Received - ID: ${order.userId}\n\n`;
  body += `Order Date: ${order.orderDate}\n\n`;
  body += "Items:\n";
  order.items.forEach((item: any) => {
    body += ` - Product ID: ${item.productId}, Quantity: ${item.quantity}\n`;
  });
  body += "\n--- End of Order ---";
  return body;
}

// Function to send the email using SES
async function sendOrderEmail(order: any) {
  const emailBody = createEmailBody(order);

  const command = new SendEmailCommand({
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

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  console.log(`Received ${event.Records.length} messages from SQS.`);

  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const orderPayload = JSON.parse(record.body);

      // ⚠️ NEW: Send the email
      await sendOrderEmail(orderPayload);

      console.log(
        `[ORDER PROCESSOR] Successfully processed and notified for Order ID: ${orderPayload.userId} with ${orderPayload.items.length} items.`
      );
    } catch (error) {
      console.error("Error processing SQS record and sending email:", error);
      // Fail this item so SQS re-attempts processing or sends it to a DLQ
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
