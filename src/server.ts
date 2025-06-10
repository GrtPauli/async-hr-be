import app from "./app";
import { connectToDatabase } from "./config/database";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
