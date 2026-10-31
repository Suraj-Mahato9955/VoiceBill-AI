const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");

const authMiddleware = async (req, res, next) => {
try {
const authHeader = req.headers.authorization;

```
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    success: false,
    message: "Authentication required. Please login.",
  });
}

const token = authHeader.split(" ")[1];

const decoded = jwt.verify(token, process.env.JWT_SECRET);

const shop = await Shop.findOne({ shopId: decoded.shopId });

if (!shop) {
  return res.status(401).json({
    success: false,
    message: "Shop not found. Please login again.",
  });
}

req.shop = shop;

next();
```

} catch (error) {
return res.status(401).json({
success: false,
message: "Invalid or expired token.",
});
}
};

module.exports = authMiddleware;
