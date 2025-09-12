import express from 'express';
import handleErrors from "./errors";
import config from './config';
import router from './routes/index.routes';


// Load environment variables from a .env file into process.env. 
try {
  process.loadEnvFile() // Node.js built-in API (introduced in Node v20.6.0) to load variables from a .env file directly into process.env. For older Node versions, the package dotenv was used for this.
} catch(error) {
  console.warn(".env file not found, using default environment values")
}

// Establish a connection to the database
require("./db");

// Initialize the server
const app = express();

// Load and apply global middleware (CORS, JSON parsing, etc.) for server configurations
config(app);

// Define and apply route handlers
// const indexRouter = router
app.use("/api", router);

// Centralized error handling (must be placed after routes)
handleErrors(app);

// Define the server port (default: 5005)
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server listening. Local access on http://localhost:${PORT}`);
});
