//imports
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 5000;

// Load environment variables
dotenv.config();

//DB connection
mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to database"));

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "my secret key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

//set template engine
app.set("view engine", "ejs");

//route prefix
app.use("", require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
