import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
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

\  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [savingBill, setSavingBill] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [shopLogo, setShopLogo] = useState(
    localStorage.getItem("voicebillShopLogo") || ""
  );

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  const filteredBills = bills.filter((bill) => {
    const search = searchQuery.toLowerCase().trim();

    const customerName = (bill.customerName || "").toLowerCase();
    const customerMobile = (bill.customerMobile || "").toString();

    const matchesSearch =
      customerName.includes(search) ||
      customerMobile.includes(search);

    const billDate = new Date(bill.createdAt);

    if (Number.isNaN(billDate.getTime())) {
      return false;
    }

    const year = billDate.getFullYear();
    const month = String(billDate.getMonth() + 1).padStart(2, "0");
    const day = String(billDate.getDate()).padStart(2, "0");

    const formattedBillDate = `${year}-${month}-${day}`;

    const matchesStartDate =
      !startDate || formattedBillDate >= startDate;

    const matchesEndDate =
      !endDate || formattedBillDate <= endDate;

    return (
      matchesSearch &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const validItems = items.filter(
    (item) =>
      item.name.trim() &&
      Number(item.quantity) > 0 &&
      Number(item.price) >= 0
  );

  // Calculations
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

  // Start editing quantity or price
  const startEditing = (itemId, field, currentValue) => {
    setEditingCell({
      itemId,
      field,
    });

    setEditValue(String(currentValue));
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Save edited quantity or price
  const saveEditing = () => {
    if (!editingCell) return;

    const value = Number(editValue);

    if (
      editValue.trim() === "" ||
      !Number.isFinite(value) ||
      (editingCell.field === "quantity" && value <= 0) ||
      (editingCell.field === "price" && value < 0)
    ) {
      cancelEditing();
      return;
    }

    updateItem(
      editingCell.itemId,
      editingCell.field,
      value
    );

    cancelEditing();
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

    if (editingCell?.itemId === id) {
      cancelEditing();
    }
  };

  // Add voice product
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
Price: Rs. ${Number(price).toFixed(2)}
Amount: Rs. ${(quantity * price).toFixed(2)}`;
  };

  // Process voice or text commands
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

    // Change quantity
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

    // Change price
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
Updated Price: Rs. ${price.toFixed(2)}`;
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
      response = `Subtotal: Rs. ${subtotal.toFixed(2)}
Discount: Rs. ${discountAmount.toFixed(2)}
Grand Total: Rs. ${grandTotal.toFixed(2)}`;
    }

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
  };

  // Send text command
  const sendCommand = () => {
    if (!command.trim()) return;

    processCommand(command);
    setCommand("");
  };

  // Voice billing
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

  // Upload and save shop logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Please upload a PNG or JPG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Logo size must be less than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const logoData = reader.result;

      try {
        localStorage.setItem("voicebillShopLogo", logoData);
        setShopLogo(logoData);
        alert("Shop logo uploaded successfully!");
      } catch (error) {
        alert("Could not save logo. Please use a smaller image.");
      }
    };

    reader.readAsDataURL(file);
  };

  // Convert dummy QR image into data URL for PDF
  const getDummyQRData = async () => {
    const response = await fetch("/dummy-qr.png");

    if (!response.ok) {
      throw new Error("Dummy QR image could not be loaded.");
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error("Could not read dummy QR image."));

      reader.readAsDataURL(blob);
    });
  };

  // Generate PDF Invoice
  const downloadBillPDF = async (bill) => {
    try {
      const doc = new jsPDF();

      const shop = JSON.parse(
        localStorage.getItem("voicebillShop") || "{}"
      );

      const shopName = shop.shopName || "VoiceBill AI Shop";
      const ownerName = shop.ownerName || "";
      const shopId = shop.shopId || "";

      const pageWidth = doc.internal.pageSize.getWidth();

      // Shop logo
      const savedLogo = localStorage.getItem("voicebillShopLogo");

      if (savedLogo) {
        const logoFormat = savedLogo.startsWith("data:image/png")
          ? "PNG"
          : "JPEG";

        doc.addImage(
          savedLogo,
          logoFormat,
          15,
          10,
          25,
          25
        );
      }

      // Shop heading
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");

      doc.text(shopName, pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      doc.text("INVOICE", pageWidth / 2, 30, {
        align: "center",
      });

      doc.line(15, 35, pageWidth - 15, 35);

      // Shop details
      doc.setFontSize(10);

      doc.text(`Owner: ${ownerName || "Not provided"}`, 15, 45);
      doc.text(`Shop ID: ${shopId || "Not provided"}`, 15, 52);

      // Invoice details
      const invoiceDate = new Date(
        bill.createdAt || Date.now()
      ).toLocaleString("en-IN");

      doc.text(`Invoice Date: ${invoiceDate}`, 15, 62);

      doc.text(
        `Invoice ID: ${String(bill._id || "New").slice(-10)}`,
        15,
        69
      );

      // Customer details
      doc.setFont("helvetica", "bold");
      doc.text("Customer Details", 15, 82);

      doc.setFont("helvetica", "normal");

      doc.text(
        `Name: ${bill.customerName || "Walk-in Customer"}`,
        15,
        90
      );

      doc.text(
        `Mobile: ${bill.customerMobile || "Not provided"}`,
        15,
        97
      );

      // Table heading
      let y = 112;

      doc.setFont("helvetica", "bold");

      doc.text("Product", 15, y);
      doc.text("Quantity", 95, y);
      doc.text("Price", 135, y);
      doc.text("Amount", 175, y);

      doc.line(15, y + 3, pageWidth - 15, y + 3);

      // Product rows
      doc.setFont("helvetica", "normal");

      y += 12;

      bill.items.forEach((item) => {
        const productName = doc.splitTextToSize(
          String(item.name),
          65
        );

        const rowHeight = Math.max(10, productName.length * 5);

        if (y + rowHeight > 260) {
          doc.addPage();
          y = 20;
        }

        doc.text(productName, 15, y);
        doc.text(String(item.quantity), 95, y);

        doc.text(
          `Rs. ${Number(item.price).toFixed(2)}`,
          135,
          y
        );

        doc.text(
          `Rs. ${Number(item.amount).toFixed(2)}`,
          175,
          y
        );

        y += rowHeight;
      });

      // Totals
      if (y > 235) {
        doc.addPage();
        y = 25;
      }

      y += 8;

      doc.line(125, y, 195, y);

      y += 10;

      doc.text("Subtotal:", 130, y);

      doc.text(
        `Rs. ${Number(bill.subtotal).toFixed(2)}`,
        195,
        y,
        { align: "right" }
      );

      y += 9;

      doc.text(`Discount (${bill.discount}%):`, 130, y);

      doc.text(
        `- Rs. ${Number(bill.discountAmount).toFixed(2)}`,
        195,
        y,
        { align: "right" }
      );

      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text("Grand Total:", 130, y);

      doc.text(
        `Rs. ${Number(bill.grandTotal).toFixed(2)}`,
        195,
        y,
        { align: "right" }
      );

      // Demo QR section
      y += 15;

      if (y > 220) {
        doc.addPage();
        y = 25;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      doc.text("Demo Payment QR", pageWidth / 2, y, {
        align: "center",
      });

      y += 5;

      const qrData = await getDummyQRData();

      doc.addImage(
        qrData,
        "PNG",
        pageWidth / 2 - 20,
        y,
        40,
        40
      );

      y += 46;

      doc.setFontSize(10);
      doc.setTextColor(200, 0, 0);

      doc.text(
        "DEMO QR - NOT FOR PAYMENT",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Footer
      y += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(
        "Thank you for shopping with us!",
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Download PDF
      const fileId = String(bill._id || Date.now()).slice(-8);

      doc.save(`VoiceBill-Invoice-${fileId}.pdf`);

    } catch (error) {
      console.error("PDF generation error:", error);

      alert(
        "Could not generate PDF invoice. Please check that public/dummy-qr.png exists."
      );
    }
  };

  // Fetch bills from MongoDB
  const fetchBills = async () => {
    const token = localStorage.getItem("voicebillToken");

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
  };

  // Save bill to MongoDB
  const saveBill = async () => {
    if (validItems.length === 0) {
      setMessage("Please add at least one valid product.");
      return;
    }

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

      // Download PDF using saved bill data
      await downloadBillPDF(data.bill);

      alert(
        `Bill saved successfully!\n\nProducts: ${validItems.length}\nSubtotal: Rs. ${subtotal.toFixed(2)}\nDiscount: Rs. ${discountAmount.toFixed(2)}\nGrand Total: Rs. ${grandTotal.toFixed(2)}`
      );

      // Clear current bill
      setItems([]);
      setCustomerName("");
      setCustomerMobile("");
      setDiscount("0");
      setMessages([]);
      cancelEditing();

      // Refresh history
      await fetchBills();

    } catch (error) {
      console.error("Save bill error:", error);

      setMessage(error.message);
      alert(error.message);

    } finally {
      setSavingBill(false);
    }
  };

  // Generate Bill
  const generateBill = () => {
    if (savingBill) return;
    saveBill();
  };

  // Delete saved bill
  const deleteBill = async (billId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?"
    );

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
          onClick={() => {
            setActiveSection("voice");
            setMessage("");
          }}
        >
          🎙️ VoiceBill AI
        </button>

        <button
          className={`vb-nav-item ${
            activeSection === "manual" ? "active" : ""
          }`}
          onClick={() => {
            setActiveSection("manual");
            setMessage("");
          }}
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

        {/* Billing History */}
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

            {/* Billing History Filters */}
            <div className="vb-history-filters">

              <input
                type="text"
                placeholder="Search by customer name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="vb-date-filters">

                <div>
                  <label>From Date</label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label>To Date</label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear Filters
              </button>

            </div>

            <section className="vb-chat-messages">

              {loadingBills ? (

                <p>Loading bills...</p>

              ) : bills.length === 0 ? (

                <p className="vb-empty-products">
                  No saved bills found.
                </p>

              ) : filteredBills.length === 0 ? (

                <p className="vb-empty-products">
                  No bills match your search or selected dates.
                </p>

              ) : (

                filteredBills.map((bill) => (

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
                          {item.name} — {item.quantity} × Rs.
                          {Number(item.price).toFixed(2)}
                          {" = "}Rs.
                          {Number(item.amount).toFixed(2)}
                        </p>
                      ))}

                      <p>
                        Subtotal: Rs.
                        {Number(bill.subtotal).toFixed(2)}
                      </p>

                      <p>
                        Discount: {bill.discount}% (Rs.
                        {Number(bill.discountAmount).toFixed(2)})
                      </p>

                      <strong>
                        Grand Total: Rs.
                        {Number(bill.grandTotal).toFixed(2)}
                      </strong>

                      <br />

                      <button
                        type="button"
                        onClick={() => downloadBillPDF(bill)}
                        style={{
                          marginTop: "12px",
                          marginRight: "10px",
                        }}
                      >
                        Download PDF
                      </button>

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

          /* Voice Billing */
          <>

            <header className="vb-chat-header">
              <div>
                <h1>VoiceBill AI</h1>
                <p>Your intelligent billing assistant</p>
              </div>

              <span className="vb-status">● Ready</span>
            </header>

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

          /* Manual Billing */
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

        {/* Shop Logo */}
        <div style={{ padding: "15px", textAlign: "center" }}>

          <h3>Shop Logo</h3>

          {shopLogo && (
            <img
              src={shopLogo}
              alt="Shop Logo"
              style={{
                width: "90px",
                height: "90px",
                objectFit: "contain",
                marginBottom: "10px",
              }}
            />
          )}

          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleLogoUpload}
          />

          <p style={{ fontSize: "12px", color: "#777" }}>
            Upload PNG or JPG (maximum 1 MB)
          </p>

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

            <button onClick={addManualItem}>
              + Add
            </button>

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

                  {/* Editable Quantity */}
                  <label>
                    Qty

                    {editingCell?.itemId === item.id &&
                    editingCell?.field === "quantity" ? (

                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={editValue}
                        autoFocus
                        onChange={(e) =>
                          setEditValue(e.target.value)
                        }
                        onBlur={saveEditing}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }

                          if (e.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                      />

                    ) : (

                      <span
                        className="vb-editable-value"
                        onClick={() =>
                          startEditing(
                            item.id,
                            "quantity",
                            item.quantity
                          )
                        }
                        title="Click to edit quantity"
                      >
                        {item.quantity} ✎
                      </span>

                    )}

                  </label>

                  {/* Editable Price */}
                  <label>
                    Price

                    {editingCell?.itemId === item.id &&
                    editingCell?.field === "price" ? (

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={editValue}
                        autoFocus
                        onChange={(e) =>
                          setEditValue(e.target.value)
                        }
                        onBlur={saveEditing}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }

                          if (e.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                      />

                    ) : (

                      <span
                        className="vb-editable-value"
                        onClick={() =>
                          startEditing(
                            item.id,
                            "price",
                            item.price
                          )
                        }
                        title="Click to edit price"
                      >
                        Rs. {Number(item.price).toFixed(2)} ✎
                      </span>

                    )}

                  </label>

                </div>

                <div className="vb-live-amount">
                  Amount: Rs.
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
          <strong>Rs. {subtotal.toFixed(2)}</strong>
        </div>

        <div className="vb-total-row">
          <span>Discount</span>
          <strong>- Rs. {discountAmount.toFixed(2)}</strong>
        </div>

        <div className="vb-grand-total">
          <span>Grand Total</span>
          <strong>Rs. {grandTotal.toFixed(2)}</strong>
        </div>

        {/* Dummy QR Code */}
        <div className="vb-demo-qr">

          <h3>Scan to Pay</h3>

          <img
            src="/dummy-qr.png"
            alt="Demo QR code - not valid for payment"
          />

          <p>DEMO QR - NOT FOR PAYMENT</p>

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
  );
}

export default VoiceBill;
