// src/server.ts (Update this file)
import express, { Request, Response } from "express";
import { initializeDataSource } from "./config/data-source.js";
import { productRouter } from "./controllers/productRouter.js";
import { orderRouter } from "./controllers/orderRouter.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1/products", productRouter);
app.use('/api/v1/orders', orderRouter);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Peach Nutrition API is running!" });
});

initializeDataSource().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Products endpoint: http://localhost:${PORT}/api/v1/products`);
  });
});
