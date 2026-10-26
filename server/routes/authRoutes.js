const express = require("express");
const { registerShop } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerShop);

module.exports = router;
