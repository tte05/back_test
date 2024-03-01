const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    await user.save();

    req.session.message = {
      type: "success",
      message: `User ${user.name} added successfully`,
    };

    res.redirect("/");
  } catch (error) {
    res.json({ message: error.message, type: "danger" });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.render("index", {
      title: "Home Page",
      users: users,
    });
  } catch (error) {
    res.json({ message: error.message, type: "danger" });
  }
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

router.get("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      res.redirect("/");
    } else {
      res.render("edit_users", {
        title: "Edit User",
        user: user,
      });
    }
  } catch (error) {
    res.redirect("/");
  }
});

router.post("/update/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    let new_image = req.body.old_image;
    if (req.file) {
      new_image = req.file.filename;
      fs.unlinkSync("./uploads/" + req.body.old_image);
    }
    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });
    req.session.message = {
      type: "success",
      message: "User updated successfully!",
    };
    res.redirect("/");
  } catch (error) {
    res.json({ message: error.message, type: "danger" });
  }
});

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (user.image) {
      fs.unlinkSync("./uploads/" + user.image);
    }
    req.session.message = {
      type: "info",
      message: "User deleted successfully!",
    };
    res.redirect("/");
  } catch (error) {
    res.json({ message: error.message, type: "danger" });
  }
});

module.exports = router;
