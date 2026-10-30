import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VoiceBill.css";

function VoiceBill() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("manual");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discount, setDiscount] = useState(0);

  const [items, setItems] = useState([
    { id: 1, name: "", quantity: 1, price: 0 },
  ]);

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.quantity) * Number(item.price),
    0
  );

  const discountAmount = Math.min(
    subtotal,
    (subtotal * Math.max(0, Math.min(100, Number(discount) || 0))) / 100
  );

  const grandTotal = subtotal - discountAmount;

  const updateItem = (id, field, value) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((previousItems) => [
      ...previousItems,
      {
        id: Date.now() + Math.random(),
        name: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((previousItems) =>
      previousItems.length > 1
        ? previousItems.filter((item) => item.id !== id)
        : previousItems
    );
  };

  const addVoiceItem = (text) => {
    const cleanText = text.toLowerCase().replace(/,/g, " ").trim();

    const pattern =
      /(?:add\s+)?(\d+(?:\.\d+)?)\s*(kg|kgs|kilograms?|litres?|liters?|l|grams?|g|pieces?|pcs|packets?|packs?)?\s+(.+?)\s+at\s+₹?\s*(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?(?:\s+per\s+(?:kg|kgs|kilogram|litre|liter|l|piece|pc))?/i;

    const match = cleanText.match(pattern);

    if (!match) {
      setMessage(
        'Could not understand. Try: "Add 2 kg rice at 60 rupees per kg".'
      );
      return;
    }

    const quantity = Number(match[1]);
    const productName = match[3].trim();
    const price = Number(match[4]);

    if (!productName || quantity <= 0 || price < 0) {
      setMessage("Please speak a valid product, quantity and price.");
      return;
    }

    setItems((previousItems) => {
      const emptyIndex = previousItems.findIndex(
        (item) => !item.name.trim()
      );

      const newItem = {
        id: Date.now() + Math.random(),
        name: productName,
        quantity,
        price,
      };

      if (emptyIndex !== -1) {
        return previousItems.map((item, index) =>
          index === emptyIndex ? { ...newItem, id: item.id } : item
        );
      }

      return [...previousItems, newItem];
    });

    setMessage(`${productName} added successfully!`);
  };

  const startVoiceBilling = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Speech recognition is not supported. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage("Listening... Speak your product details.");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      setTranscript(spokenText);
      addVoiceItem(spokenText);
    };

    recognition.onerror = (event) => {
      setMessage(`Voice recognition error: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const generateBill = () => {
    const validItems = items.filter(
      (item) =>
        item.name.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.price) >= 0
    );

    if (validItems.length === 0) {
      setMessage("Please add at least one valid product.");
      return;
    }

    alert(
      `Bill Total: ₹${grandTotal.toFixed(2)}\n` +
        `Products: ${validItems.length}\n\n` +
        "Bill calculation completed successfully!"
    );
  };

  return (
    <div className="voicebill-page">
      <header className="voicebill-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <h1>VoiceBill AI</h1>
          <p>Create bills using your voice or enter details manually.</p>
        </div>
      </header>

      <section className="billing-mode">
        <button
          className={mode === "voice" ? "mode-button selected" : "mode-button"}
          onClick={() => {
            setMode("voice");
            setMessage("");
          }}
        >
          🎙 Voice Billing
        </button>

        <button
          className={mode === "manual" ? "mode-button selected" : "mode-button"}
          onClick={() => {
            setMode("manual");
            setMessage("");
          }}
        >
          ✍ Manual Billing
        </button>
      </section>

      {mode === "voice" && (
        <section className="voice-panel">
          <div className="microphone-icon">🎙</div>

          <h2>Speak to Create Your Bill</h2>

          <p>
            Click the button and speak your product name, quantity and price.
          </p>

          <button
            className="start-voice-button"
            onClick={startVoiceBilling}
            disabled={listening}
          >
            {listening ? "Listening..." : "Start Voice Billing"}
          </button>

          {transcript && (
            <div className="transcript-box">
              <strong>Recognized Speech:</strong>
              <p>{transcript}</p>
            </div>
          )}

          <div className="voice-example">
            <strong>Example:</strong>
            <p>"Add 2 kg rice at 60 rupees per kg"</p>
            <p>"Add 5 litres milk at 50 rupees per litre"</p>
          </div>
        </section>
      )}

      {message && <div className="billing-message">{message}</div>}

      <section className="billing-content">
        <div className="billing-form">
          <h2>Customer Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="items-heading">
            <h2>Product Details</h2>

            <button className="add-item-button" onClick={addItem}>
              + Add Product
            </button>
          </div>

          <div className="product-table">
            <div className="product-table-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Price (₹)</span>
              <span>Amount</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div className="product-row" key={item.id}>
                <input
                  type="text"
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
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(item.id, "price", e.target.value)
                  }
                />

                <strong>
                  ₹
                  {(
                    Number(item.quantity || 0) *
                    Number(item.price || 0)
                  ).toFixed(2)}
                </strong>

                <button
                  className="remove-item-button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove product"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="discount-field">
            <label>Discount (%)</label>

            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>

        <aside className="bill-summary">
          <h2>Bill Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Discount</span>
            <strong>- ₹{discountAmount.toFixed(2)}</strong>
          </div>

          <div className="summary-total">
            <span>Grand Total</span>
            <strong>₹{grandTotal.toFixed(2)}</strong>
          </div>

          <button className="generate-bill-button" onClick={generateBill}>
            Generate Bill →
          </button>
        </aside>
      </section>
    </div>
  );
}

export default VoiceBill;
