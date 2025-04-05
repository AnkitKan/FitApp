import pg from "pg";
import dotenv from "dotenv";
import express from "express";
dotenv.config();
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
app.use(express.static("public"));
const client = new pg.Client({
    user: process.env.DB_USER,         // Replace with your PostgreSQL username
    host: process.env.DB_HOST,             // Database server address (localhost for local development)
    database: process.env.DB_DATABASE,     // Name of the database to connect to
    password: process.env.DB_PASSWORD,     // Your PostgreSQL password
    port: process.env.DB_PORT,                    // Default PostgreSQL port (5432)
  });
  
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  })
  // Connect to the PostgreSQL database
  client.connect()
    .then(() => {
      console.log('Connected to PostgreSQL database');
    })
    .catch((err) => {
      console.error('Error connecting to PostgreSQL database', err.stack);
    });
  app.get("/", (req, res) => {
    res.send(req.rows);
  })
  // Example query to select all rows from a table
  client.query('SELECT * FROM exercises')
    .then((res) => {
      console.log('Query Result:', res.rows);
    })
    .catch((err) => {
      console.error('Error executing query', err.stack);
    })
    .finally(() => {
      // Close the connection when you're done
      client.end();
    });
    app.listen(port, (req, res) => {
      console.log("Server up");
    })
