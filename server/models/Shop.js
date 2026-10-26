const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
{
ownerName: {
type: String,
required: true,
trim: true,
},
shopName: {
type: String,
required: true,
trim: true,
},
mobile: {
type: String,
required: true,
unique: true,
trim: true,
},
email: {
type: String,
required: true,
unique: true,
lowercase: true,
trim: true,
},
username: {
type: String,
required: true,
unique: true,
lowercase: true,
trim: true,
},
password: {
type: String,
required: true,
},
address: {
type: String,
required: true,
trim: true,
},
upiId: {
type: String,
trim: true,
default: "",
},
shopId: {
type: String,
unique: true,
required: true,
},
},
{
timestamps: true,
}
);

module.exports = mongoose.model("Shop", shopSchema);
