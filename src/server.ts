// src/server.ts
import express, { type Request, type Response } from "express";

const app = express();
// Use a port variable for easy configuration
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse incoming JSON bodies

// Define a root endpoint (route)
app.get("/", (req: Request, res: Response) => {
  // Send a JSON response as expected for an API
  res.send({ message: "Peach Nutrition API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
