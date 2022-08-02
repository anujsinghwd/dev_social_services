const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const users = require("./routes/users");
const profile = require("./routes/profile");
const posts = require("./routes/posts");
const passport = require("passport");
const app = express();

//Body parser middleware
app.use(express.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((er) => console.log(err));

// Passport Middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.get("/", (req, res) => res.json({ success: true }));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
