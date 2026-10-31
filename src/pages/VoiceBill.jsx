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

  const updateItem = (id, field, value) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

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

  const removeItem = (id) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const addProduct = (name, quantity, price) => {
    const product = {
      id: Date.now() + Math.random(),
      name,
      quantity,
      price,
    };

    setItems((previous) => [...previous, product]);

    return `Product: ${name}
Quantity: ${quantity}
Price: ₹${Number(price).toFixed(2)}
Amount: ₹${(quantity * price).toFixed(2)}`;
  };

  const processCommand = (rawCommand) => {
    const text = rawCommand.trim();
    const lower = text.toLowerCase();

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
Updated Quantity: ${quantity}`;
        } else {
          response = `Product ${name} was not found in your bill.`;
        }
      }
    }

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
Updated Price: ₹${price.toFixed(2)}`;
        } else {
          response = `Product ${name} was not found in your bill.`;
        }
      }
    }

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

    // Discount
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

    // Final amount
    if (
      !response &&
      /(final amount|total amount|bill total|grand total)/i.test(lower)
    ) {
      response = `Subtotal: ₹${subtotal.toFixed(2)}
Discount: ₹${discountAmount.toFixed(2)}
Grand Total: ₹${grandTotal.toFixed(2)}`;
    }

    // Unrecognized command
    if (!response) {
      response =
        'Command not recognized. Try "Add 2 kg rice at 60 rupees per kg".';
    }

    // Only show billing details, not user/AI conversation labels
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        text: response,
      },
    ]);

    setMessage("");
  };

  const sendCommand = () => {
    if (!command.trim()) return;

    processCommand(command);
    setCommand("");
  };

  const startVoiceBilling = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

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
  };

  const generateBill = () => {
    if (validItems.length === 0) {
      setMessage("Please add at least one valid product.");
      return;
    }

    alert(
      `Bill generated successfully!\n\nProducts: ${validItems.length}\nSubtotal: ₹${subtotal.toFixed(
        2
      )}\nDiscount: ₹${discountAmount.toFixed(
        2
      )}\nGrand Total: ₹${grandTotal.toFixed(2)}`
    );
  };

  return (
    <div className="voicebill-workspace">
      {/* Sidebar */}
      <aside className="vb-sidebar">
        <div className="vb-brand">
          VoiceBill <span>AI</span>
        </div>

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

        <div className="vb-history-empty">
          <span>◷</span>
          <p>No saved bills yet</p>
          <small>Generated bills will appear here.</small>
        </div>

        <button
          className="vb-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </aside>

      {/* Main Section */}
      <main className="vb-main">
        {activeSection === "voice" ? (
          <>
            <header className="vb-chat-header">
              <div>
                <h1>VoiceBill AI</h1>
                <p>Your intelligent billing assistant</p>
              </div>

              <span className="vb-status">● Ready</span>
            </header>

            {/* Product Details Only */}
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

      {/* Live Bill */}
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
        >
          Generate Bill →
        </button>
      </aside>
    </div>
  );
}

export default VoiceBill;
