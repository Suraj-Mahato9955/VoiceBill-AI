const bcrypt = require("bcryptjs");
const Shop = require("../models/Shop");

const registerShop = async (req, res) => {
try {
const {
ownerName,
shopName,
mobile,
email,
username,
password,
confirmPassword,
address,
upiId,
} = req.body;


// Check required fields
if (
  !ownerName ||
  !shopName ||
  !mobile ||
  !email ||
  !username ||
  !password ||
  !confirmPassword ||
  !address
) {
  return res.status(400).json({
    success: false,
    message: "Please fill all required fields.",
  });
}

// Check password length
if (password.length < 8) {
  return res.status(400).json({
    success: false,
    message: "Password must contain at least 8 characters.",
  });
}

// Check password confirmation
if (password !== confirmPassword) {
  return res.status(400).json({
    success: false,
    message: "Passwords do not match.",
  });
}

// Normalize user details
const normalizedEmail = email.trim().toLowerCase();
const normalizedUsername = username.trim().toLowerCase();
const normalizedMobile = mobile.trim();

// Check existing account
const existingShop = await Shop.findOne({
  $or: [
    { email: normalizedEmail },
    { username: normalizedUsername },
    { mobile: normalizedMobile },
  ],
});

if (existingShop) {
  return res.status(409).json({
    success: false,
    message: "Email, username, or mobile number is already registered.",
  });
}

// Hash password before saving
const hashedPassword = await bcrypt.hash(password, 12);

// Generate a unique Shop ID
let shopId;
let shopIdExists = true;

while (shopIdExists) {
  shopId = `VB${Date.now().toString().slice(-8)}${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  shopIdExists = await Shop.exists({ shopId });
}

// Save shop in MongoDB
const shop = await Shop.create({
  ownerName: ownerName.trim(),
  shopName: shopName.trim(),
  mobile: normalizedMobile,
  email: normalizedEmail,
  username: normalizedUsername,
  password: hashedPassword,
  address: address.trim(),
  upiId: upiId ? upiId.trim() : "",
  shopId,
});

return res.status(201).json({
  success: true,
  message: "Shop registered successfully!",
  shop: {
    shopId: shop.shopId,
    ownerName: shop.ownerName,
    shopName: shop.shopName,
    email: shop.email,
    username: shop.username,
  },
});

} catch (error) {
console.error("Registration error:", error.message);


if (error.code === 11000) {
  return res.status(409).json({
    success: false,
    message: "This email, username, mobile number, or Shop ID is already in use.",
  });
}

return res.status(500).json({
  success: false,
  message: "Registration failed. Please try again.",
});

}
};

module.exports = { registerShop };
