import dotenv from "dotenv";
import Auth from "./Controllers/Auth";
import middlewares from "./middlewares/validateToken";
import Actions from "./Controllers/Actions";
const express = require("express");
const session = require("express-session");
const cors = require("cors");
var bodyParser = require("body-parser");
const sequelize = require("./setup/Sequelize");
import User from "./Models/Users";
import Expenses from "./Models/expense";

require("./setup/Sequelize");

dotenv.config();

const app = express();

const FRONTEND_URL: any = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 8000;

interface corsInterface {
  origin: string;
  methods: string[];
  allowedHeaders?: string[];
  credentials: boolean;
}

const corsOption: corsInterface = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Middlewares
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, //TO-DO: Set to true in production
  })
);

// Define associations
User.hasMany(Expenses, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

Expenses.belongsTo(User, {
  foreignKey: "user_id",
});

// Auth routes
app.post("/api/v1/auth/signup", Auth.signup);
app.post("/api/v1/auth/login", Auth.login);
app.post("/api/v1/auth/verify-otp", Auth.verifyOTP);
app.post("/api/v1/resend-otp", Auth.resendOTP);
app.post("/api/v1/forgot-password", Auth.forgotPassword);
app.post("/api/v1/reset-password", Auth.resetPassword);

app.post("/api/v1/reset-password", Auth.resetPassword);
app.post("/api/v1/expenses", middlewares.authenticateToken, Actions.addExpense);
app.get("/api/v1/expenses", middlewares.authenticateToken, Actions.getExpense);
app.get("/api/v1/user", middlewares.authenticateToken, Actions.getUser);



const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.log("Server error.");
  }
};


startServer();