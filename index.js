import pg from "pg";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
dotenv.config();
import { dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const salt = await bcrypt.genSalt(10);


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
const client = new pg.Client({
    user: process.env.DB_USER,         
    host: process.env.DB_HOST,             
    database: process.env.DB_DATABASE,     
    password: process.env.DB_PASSWORD,     
    port: process.env.DB_PORT,                    
  });
client.connect();

app.get("/", (req, res) => {
  res.render(__dirname+ "index.html");
})
app.get("/login", (req, res) => {
  res.render("login.ejs")
})
app.post("/login", async (req, res) => {
  const {email, password} = req.body;
  const qresult = await client.query('Select password FROM users WHERE email = $1', [email])
  if(qresult.rowCount > 0) {
    const storedPassword = qresult.rows[0].password;
    if(await bcrypt.compare(password, storedPassword)) {
      console.log("Login Successful");
      req.body['password'] = "S"
    }
    else {
      //console.log(storedPassword)
      //console.log(password)
      console.log("Login failed")
      req.body['password'] = "F"
    }
  }
  else {
    req.body['password'] = "F"
   }
  res.render("login.ejs", {password:req.body['password']});
})
    
app.get("/register", (req, res) => {
  res.render("register.ejs")
})
app.post("/register", async (req, res) => {
  const {email, password, p_verification} = req.body;
  //console.log({email, password});
  if(password === p_verification && password != '') {
    try{
      const hash = await bcrypt.hashSync(password, salt);
      await client.query('INSERT INTO users(email, password) VALUES ($1, $2)', [email, hash]);
    } catch(err) {
      if(err.code === '23505') { //error code for duplicate entry in postgreSQL database
        req.body['password'] = "error";
        //return res.status(400).send('Email already exists!');
      }
      else {
        console.error('Error inserting user into DB:', err.stack);
        //res.status(500).send('Something went wrong during registration');
      }
    }
  }
  res.render("register.ejs", {password:req.body['password'], p_verification:req.body['p_verification']});
})
app.listen(port, (req, res) => {
  console.log("Server up");
})

