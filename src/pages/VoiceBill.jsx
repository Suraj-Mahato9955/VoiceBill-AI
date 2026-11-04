import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VoiceBill.css";

function VoiceBill() {
const navigate = useNavigate();

const [activeSection, setActiveSection] = useState("voice");
const [customerName, setCustomerName] = useState("");
const [customerMobile, setCustomerMobile] = useState("");
const [discount, setDiscount] = useState("0");
const [command, setCommand] = useState("");
const [listening, setListening] = useState(false);
const [message, setMessage] = useState("");

const [items, setItems] = useState([]);
const [messages, setMessages] = useState([]);

// Billing History states
const [bills, setBills] = useState([]);
const [loadingBills, setLoadingBills] = useState(false);
const [savingBill, setSavingBill] = useState(false);

const validItems = items.filter(
(item) =>
item.name.trim() &&
Number(item.quantity) > 0 &&
Number(item.price) >= 0
);

const subtotal = validItems.reduce(
(total, item) =>
total + Number(item.quantity) * Number(item.price),
0
);

const discountAmount =
(subtotal *
Math.max(0, Math.min(100, Number(discount) || 0))) /
100;

const grandTotal = subtotal - discountAmount;

// Update product
const updateItem = (id, field, value) => {
setItems((previous) =>
previous.map((item) =>
item.id === id ? { ...item, [field]: value } : item
)
);
};

// Add manual product
const addManualItem = () => {
setItems((previous) => [
...previous,
{
id: Date.now() + Math.random(),
name: "",
quantity: 1,
price: 0,
},
]);
};

// Remove product
const removeItem = (id) => {
setItems((previous) =>
previous.filter((item) => item.id !== id)
);
};

// Add voice product
const addProduct = (name, quantity, price) => {
const product = {
id: Date.now() + Math.random(),
name,
quantity,
price,
};

```
setItems((previous) => [...previous, product]);

return `Product: ${name}
```

Quantity: ${quantity}
Price: ₹${Number(price).toFixed(2)}
Amount: ₹${(quantity * price).toFixed(2)}`;
};

// Process voice or text commands
const processCommand = (rawCommand) => {
const text = rawCommand.trim();
const lower = text.toLowerCase();

```
if (!text) return;

let response = "";

// Add product
const addPattern =
  /(?:add\s+)?(\d+(?:\.\d+)?)\s*(kg|kgs|kilograms?|litres?|liters?|l|grams?|g|pieces?|pcs|packets?|packs?)?\s+(.+?)\s+at\s+₹?\s*(\d+(?:\.\d+)?)(?:\s*(?:rupees?|rs\.?|₹))?(?:\s+per\s+(?:kg|kgs|kilogram|litre|liter|l|piece|pc))?/i;

const addMatch = text.match(addPattern);

if (addMatch) {
  const quantity = Number(addMatch[1]);
  const name = addMatch[3].trim();
  const price = Number(addMatch[4]);

  if (name && quantity > 0 && price >= 0) {
    response = addProduct(name, quantity, price);
  }
}

// Change product quantity
if (!response) {
  const changeQuantityPattern =
    /(?:change|update|set)\s+(.+?)\s+quantity\s+to\s+(\d+(?:\.\d+)?)/i;

  const match = text.match(changeQuantityPattern);

  if (match) {
    const name = match[1].trim();
    const quantity = Number(match[2]);

    const product = items.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase()
    );

    if (product && quantity > 0) {
      updateItem(product.id, "quantity", quantity);

      response = `Product: ${name}
```

Updated Quantity: ${quantity}`;
        } else {
          response = `Product ${name} was not found in your bill.`;
}
}
}

```
// Change product price
if (!response) {
  const changePricePattern =
    /(?:change|update|set)\s+(.+?)\s+price\s+to\s+₹?\s*(\d+(?:\.\d+)?)/i;

  const match = text.match(changePricePattern);

  if (match) {
    const name = match[1].trim();
    const price = Number(match[2]);

    const product = items.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase()
    );

    if (product) {
      updateItem(product.id, "price", price);

      response = `Product: ${name}
```

Updated Price: ₹${price.toFixed(2)}`;
        } else {
          response = `Product ${name} was not found in your bill.`;
}
}
}

```
// Remove product
if (!response) {
  const removeMatch = text.match(
    /(?:remove|delete)\s+(.+)/i
  );

  if (removeMatch) {
    const name = removeMatch[1].trim();

    const product = items.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase()
    );

    if (product) {
      removeItem(product.id);
      response = `Product Removed: ${name}`;
    } else {
      response = `Product ${name} was not found in your bill.`;
    }
  }
}

// Apply discount
if (!response) {
  const discountMatch = text.match(
    /(?:add|apply|give)\s+(\d+(?:\.\d+)?)\s*%?\s*discount/i
  );

  if (discountMatch) {
    const value = Number(discountMatch[1]);

    if (value >= 0 && value <= 100) {
      setDiscount(String(value));
      response = `Discount Applied: ${value}%`;
    } else {
      response = "Discount must be between 0 and 100 percent.";
    }
  }
}

// Show final amount
if (
  !response &&
  /(final amount|total amount|bill total|grand total)/i.test(lower)
) {
  response = `Subtotal: ₹${subtotal.toFixed(2)}
```

Discount: ₹${discountAmount.toFixed(2)}
Grand Total: ₹${grandTotal.toFixed(2)}`;
}

```
// Unrecognized command
if (!response) {
  response =
    'Command not recognized. Try "Add 2 kg rice at 60 rupees per kg".';
}

setMessages((previous) => [
  ...previous,
  {
    id: Date.now() + Math.random(),
    text: response,
  },
]);

setMessage("");
```

};

// Send text command
const sendCommand = () => {
if (!command.trim()) return;

```
processCommand(command);
setCommand("");
```

};

// Start voice billing
const startVoiceBilling = () => {
const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

```
if (!SpeechRecognition) {
  setMessage(
    "Please use Google Chrome or Microsoft Edge for voice billing."
  );
  return;
}

const recognition = new SpeechRecognition();

recognition.lang = "en-IN";
recognition.continuous = false;
recognition.interimResults = false;

recognition.onstart = () => {
  setListening(true);
  setMessage("Listening... Speak your command.");
};

recognition.onresult = (event) => {
  const spokenText = event.results[0][0].transcript;
  processCommand(spokenText);
};

recognition.onerror = (event) => {
  setMessage(`Voice recognition error: ${event.error}`);
  setListening(false);
};

recognition.onend = () => {
  setListening(false);
};

try {
  recognition.start();
} catch {
  setListening(false);
  setMessage("Could not start microphone. Please try again.");
}
```

};

// Fetch saved bills from MongoDB
const fetchBills = async () => {
const token = localStorage.getItem("voicebillToken");

```
if (!token) {
  setMessage("Please login again to view billing history.");
  return;
}

setLoadingBills(true);
setMessage("");

try {
  const response = await fetch(
    "http://localhost:5000/api/bills",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not fetch bills.");
  }

  setBills(data.bills || []);
} catch (error) {
  setMessage(error.message);
} finally {
  setLoadingBills(false);
}
```

};

// Save bill to MongoDB
const saveBill = async () => {
if (validItems.length === 0) {
setMessage("Please add at least one valid product.");
return;
}

```
const discountValue = Number(discount);

if (
  !Number.isFinite(discountValue) ||
  discountValue < 0 ||
  discountValue > 100
) {
  setMessage("Discount must be between 0 and 100.");
  return;
}

const token = localStorage.getItem("voicebillToken");

if (!token) {
  setMessage("Please login again to save your bill.");
  return;
}

setSavingBill(true);
setMessage("");

try {
  const response = await fetch(
    "http://localhost:5000/api/bills",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerName,
        customerMobile,
        discount: discountValue,
        items: validItems.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not save bill.");
  }

  setMessage("Bill saved successfully!");

  alert(
    `Bill saved successfully!\n\nProducts: ${validItems.length}\nSubtotal: ₹${subtotal.toFixed(2)}\nDiscount: ₹${discountAmount.toFixed(2)}\nGrand Total: ₹${grandTotal.toFixed(2)}`
  );

  // Clear current bill after successful saving
  setItems([]);
  setCustomerName("");
  setCustomerMobile("");
  setDiscount("0");
  setMessages([]);

  // Refresh history
  await fetchBills();
} catch (error) {
  setMessage(error.message);
  alert(error.message);
} finally {
  setSavingBill(false);
}
```

};

// Generate and save bill
const generateBill = () => {
saveBill();
};

// Delete a saved bill
const deleteBill = async (billId) => {
const confirmed = window.confirm(
"Are you sure you want to delete this bill?"
);

```
if (!confirmed) return;

const token = localStorage.getItem("voicebillToken");

if (!token) {
  setMessage("Please login again.");
  return;
}

try {
  const response = await fetch(
    `http://localhost:5000/api/bills/${billId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not delete bill.");
  }

  setBills((previous) =>
    previous.filter((bill) => bill._id !== billId)
  );

  setMessage("Bill deleted successfully.");
} catch (error) {
  setMessage(error.message);
  alert(error.message);
}
```

};

return ( <div className="voicebill-workspace">
{/* Sidebar */} <aside className="vb-sidebar"> <div className="vb-brand">
VoiceBill <span>AI</span> </div>

```
    <p className="vb-sidebar-label">BILLING</p>

    <button
      className={`vb-nav-item ${
        activeSection === "voice" ? "active" : ""
      }`}
      onClick={() => setActiveSection("voice")}
    >
      🎙️ VoiceBill AI
    </button>

    <button
      className={`vb-nav-item ${
        activeSection === "manual" ? "active" : ""
      }`}
      onClick={() => setActiveSection("manual")}
    >
      ✍️ Manual Billing
    </button>

    <div className="vb-sidebar-divider" />

    <p className="vb-sidebar-label">HISTORY</p>

    <button
      className={`vb-nav-item ${
        activeSection === "history" ? "active" : ""
      }`}
      onClick={() => {
        setActiveSection("history");
        fetchBills();
      }}
    >
      ◷ Billing History
    </button>

    <button
      className="vb-back-button"
      onClick={() => navigate("/dashboard")}
    >
      ← Back to Dashboard
    </button>
  </aside>

  {/* Main Section */}
  <main className="vb-main">
    {activeSection === "history" ? (
      <>
        <header className="vb-chat-header">
          <div>
            <h1>Billing History</h1>
            <p>Your previously generated bills</p>
          </div>

          <button onClick={fetchBills}>
            Refresh
          </button>
        </header>

        {message && (
          <p className="vb-chat-notice">{message}</p>
        )}

        <section className="vb-chat-messages">
          {loadingBills ? (
            <p>Loading bills...</p>
          ) : bills.length === 0 ? (
            <p className="vb-empty-products">
              No saved bills found.
            </p>
          ) : (
            bills.map((bill) => (
              <div
                className="vb-message assistant"
                key={bill._id}
              >
                <div className="vb-message-content">
                  <h3>
                    {bill.customerName || "Walk-in Customer"}
                  </h3>

                  <p>
                    Mobile: {bill.customerMobile || "Not provided"}
                  </p>

                  <p>
                    Date:{" "}
                    {new Date(bill.createdAt).toLocaleString()}
                  </p>

                  <p>Products: {bill.items.length}</p>

                  {bill.items.map((item, index) => (
                    <p key={index}>
                      {item.name} — {item.quantity} × ₹
                      {Number(item.price).toFixed(2)}
                      {" = "}₹
                      {Number(item.amount).toFixed(2)}
                    </p>
                  ))}

                  <p>Subtotal: ₹{Number(bill.subtotal).toFixed(2)}</p>

                  <p>
                    Discount: {bill.discount}% (₹
                    {Number(bill.discountAmount).toFixed(2)})
                  </p>

                  <strong>
                    Grand Total: ₹
                    {Number(bill.grandTotal).toFixed(2)}
                  </strong>

                  <br />

                  <button
                    type="button"
                    onClick={() => deleteBill(bill._id)}
                    style={{ marginTop: "12px" }}
                  >
                    Delete Bill
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </>
    ) : activeSection === "voice" ? (
      <>
        <header className="vb-chat-header">
          <div>
            <h1>VoiceBill AI</h1>
            <p>Your intelligent billing assistant</p>
          </div>

          <span className="vb-status">● Ready</span>
        </header>

        {/* Product Details */}
        <section className="vb-chat-messages">
          {messages.length === 0 ? (
            <div className="vb-empty-products">
              Product details will appear here.
            </div>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className="vb-message assistant"
              >
                <div className="vb-message-content">
                  <p style={{ whiteSpace: "pre-line" }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>

        <div className="vb-chat-bottom">
          {message && (
            <p className="vb-chat-notice">{message}</p>
          )}

          <div className="vb-chat-input">
            <input
              type="text"
              placeholder="Enter product details or billing command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendCommand();
              }}
            />

            <button
              className={`vb-mic-button ${
                listening ? "listening" : ""
              }`}
              onClick={startVoiceBilling}
              disabled={listening}
              title="Speak command"
            >
              {listening ? "●" : "🎙️"}
            </button>

            <button
              className="vb-send-button"
              onClick={sendCommand}
              disabled={!command.trim()}
              title="Send command"
            >
              ➤
            </button>
          </div>

          <p className="vb-chat-hint">
            Try: Add 2 kg rice at 60 rupees per kg
          </p>
        </div>
      </>
    ) : (
      <>
        <header className="vb-chat-header">
          <div>
            <h1>Manual Billing</h1>
            <p>Add or edit products directly in your bill.</p>
          </div>
        </header>

        <div className="vb-manual-area">
          <div className="vb-manual-heading">
            <h2>Product Entry</h2>

            <button onClick={addManualItem}>
              + Add Product
            </button>
          </div>

          {items.map((item) => (
            <div className="vb-manual-row" key={item.id}>
              <input
                placeholder="Product name"
                value={item.name}
                onChange={(e) =>
                  updateItem(item.id, "name", e.target.value)
                }
              />

              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(item.id, "quantity", e.target.value)
                }
              />

              <input
                type="number"
                min="0"
                step="any"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  updateItem(item.id, "price", e.target.value)
                }
              />

              <button onClick={() => removeItem(item.id)}>
                ×
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="vb-empty-products">
              No products added. Click Add Product to begin.
            </p>
          )}
        </div>
      </>
    )}
  </main>

  {/* Live Bill Panel */}
  <aside className="vb-bill-panel">
    <div className="vb-bill-heading">
      <div>
        <h2>Live Bill</h2>
        <p>Current invoice</p>
      </div>

      <span>✦</span>
    </div>

    <div className="vb-customer-fields">
      <label>Customer Name</label>

      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Enter customer name"
      />

      <label>Mobile Number</label>

      <input
        value={customerMobile}
        onChange={(e) => setCustomerMobile(e.target.value)}
        placeholder="Enter mobile number"
        type="tel"
      />
    </div>

    <div className="vb-live-products">
      <div className="vb-products-heading">
        <h3>Products ({validItems.length})</h3>

        <button onClick={addManualItem}>+ Add</button>
      </div>

      {validItems.length === 0 ? (
        <p className="vb-empty-products">
          Your products will appear here.
        </p>
      ) : (
        validItems.map((item) => (
          <div className="vb-live-product" key={item.id}>
            <div className="vb-live-product-top">
              <strong>{item.name}</strong>

              <button onClick={() => removeItem(item.id)}>
                ×
              </button>
            </div>

            <div className="vb-live-product-fields">
              <label>
                Qty

                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "quantity",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Price

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "price",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>

            <div className="vb-live-amount">
              Amount: ₹
              {(
                Number(item.quantity || 0) *
                Number(item.price || 0)
              ).toFixed(2)}
            </div>
          </div>
        ))
      )}
    </div>

    <div className="vb-discount">
      <label>Discount (%)</label>

      <input
        type="number"
        min="0"
        max="100"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
      />
    </div>

    <div className="vb-total-row">
      <span>Subtotal</span>
      <strong>₹{subtotal.toFixed(2)}</strong>
    </div>

    <div className="vb-total-row">
      <span>Discount</span>
      <strong>- ₹{discountAmount.toFixed(2)}</strong>
    </div>

    <div className="vb-grand-total">
      <span>Grand Total</span>
      <strong>₹{grandTotal.toFixed(2)}</strong>
    </div>

    <button
      className="vb-generate-button"
      onClick={generateBill}
      disabled={savingBill}
    >
      {savingBill ? "Saving Bill..." : "Generate Bill →"}
    </button>
  </aside>
</div>
```

);
}

export default VoiceBill;
