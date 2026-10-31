const express = require("express");
const router = express.Router();

const Bill = require("../models/Bill");
const authMiddleware = require("../middleware/authMiddleware");

// Save a new bill
router.post("/", authMiddleware, async (req, res) => {
try {
const {
customerName,
customerMobile,
items,
discount,
} = req.body;

if (!Array.isArray(items) || items.length === 0) {
  return res.status(400).json({
    success: false,
    message: "Please add at least one product.",
  });
}

const validItems = items.map((item) => {
  const quantity = Number(item.quantity);
  const price = Number(item.price);

  if (
    !item.name ||
    !item.name.trim() ||
    !Number.isFinite(quantity) ||
    !Number.isFinite(price) ||
    quantity <= 0 ||
    price < 0
  ) {
    throw new Error("Invalid product details.");
  }

  return {
    name: item.name.trim(),
    quantity,
    price,
    amount: quantity * price,
  };
});

const subtotal = validItems.reduce(
  (total, item) => total + item.amount,
  0
);

const discountValue = Number(discount || 0);

if (
  !Number.isFinite(discountValue) ||
  discountValue < 0 ||
  discountValue > 100
) {
  return res.status(400).json({
    success: false,
    message: "Discount must be between 0 and 100.",
  });
}

const discountAmount = (subtotal * discountValue) / 100;
const grandTotal = subtotal - discountAmount;

const bill = await Bill.create({
  shop: req.shop._id,
  customerName: customerName || "",
  customerMobile: customerMobile || "",
  items: validItems,
  subtotal,
  discount: discountValue,
  discountAmount,
  grandTotal,
});

return res.status(201).json({
  success: true,
  message: "Bill saved successfully.",
  bill,
});

} catch (error) {
console.error("Save bill error:", error.message);

return res.status(400).json({
  success: false,
  message: error.message || "Could not save bill.",
});

}
});

// Get bills of logged-in shop
router.get("/", authMiddleware, async (req, res) => {
try {
const bills = await Bill.find({
shop: req.shop._id,
}).sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  bills,
});

} catch (error) {
console.error("Fetch bills error:", error.message);

return res.status(500).json({
  success: false,
  message: "Could not fetch bills.",
});

}
});

// Delete a bill belonging to logged-in shop
router.delete("/:id", authMiddleware, async (req, res) => {
try {
const bill = await Bill.findOneAndDelete({
_id: req.params.id,
shop: req.shop._id,
});

if (!bill) {
  return res.status(404).json({
    success: false,
    message: "Bill not found.",
  });
}

return res.status(200).json({
  success: true,
  message: "Bill deleted successfully.",
});

} catch (error) {
console.error("Delete bill error:", error.message);

return res.status(500).json({
  success: false,
  message: "Could not delete bill.",
});

}
});

module.exports = router;
