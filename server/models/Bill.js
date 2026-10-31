const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
{
shop: {
type: mongoose.Schema.Types.ObjectId,
ref: "Shop",
required: true,
},

customerName: {
  type: String,
  trim: true,
  default: "",
},

customerMobile: {
  type: String,
  trim: true,
  default: "",
},

items: [
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
],

subtotal: {
  type: Number,
  required: true,
  min: 0,
},

discount: {
  type: Number,
  default: 0,
  min: 0,
  max: 100,
},

discountAmount: {
  type: Number,
  default: 0,
  min: 0,
},

grandTotal: {
  type: Number,
  required: true,
  min: 0,
},

},
{
timestamps: true,
}
);

module.exports = mongoose.model("Bill", billSchema);
