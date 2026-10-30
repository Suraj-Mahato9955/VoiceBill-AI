import { useState } from "react";
import "./CreateBill.css";

function CreateBill() {
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discount, setDiscount] = useState(0);

  const [items, setItems] = useState([
    {
      id: 1,
      name: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const updateItem = (id, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeItem = (id) => {
    if (items.length === 1) {
      alert("At least one item is required.");
      return;
    }

    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0) *
        Number(item.price || 0),
    0
  );

  const validDiscount = Math.min(
    100,
    Math.max(0, Number(discount) || 0)
  );

  const discountAmount = (subtotal * validDiscount) / 100;
  const grandTotal = subtotal - discountAmount;

  const handleGenerateBill = () => {
    if (!customerName.trim()) {
      alert("Please enter the customer name.");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.price) < 0
    );

    if (invalidItem) {
      alert("Please enter valid product details.");
      return;
    }

    alert(
      `Bill calculated successfully!\nGrand Total: ₹${grandTotal.toFixed(2)}`
    );
  };

  return (
    <div className="create-bill-page">
      <div className="bill-page-header">
        <div>
          <h1>Create New Bill</h1>
          <p>Add customer and product details to generate a bill.</p>
        </div>

        <span className="bill-date">
          {new Date().toLocaleDateString("en-IN")}
        </span>
      </div>

      <div className="bill-form-card">
        <h2>Customer Details</h2>

        <div className="customer-fields">
          <div className="bill-field">
            <label htmlFor="customerName">Customer Name</label>
            <input
              id="customerName"
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="bill-field">
            <label htmlFor="customerMobile">Mobile Number</label>
            <input
              id="customerMobile"
              type="tel"
              placeholder="Enter mobile number"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bill-form-card">
        <div className="items-heading">
          <h2>Product Details</h2>

          <button
            type="button"
            className="add-item-button"
            onClick={addItem}
          >
            + Add Product
          </button>
        </div>

        <div className="bill-table-wrapper">
          <table className="bill-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Amount (₹)</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      placeholder="Product name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, "name", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="1"
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
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td className="item-amount">
                    ₹
                    {(
                      Number(item.quantity || 0) *
                      Number(item.price || 0)
                    ).toFixed(2)}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove product"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bill-form-card bill-summary-card">
        <h2>Bill Summary</h2>

        <div className="summary-row">
          <span>Subtotal</span>
          <strong>₹{subtotal.toFixed(2)}</strong>
        </div>

        <div className="discount-row">
          <label htmlFor="discount">Discount (%)</label>
          <input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        <div className="summary-row">
          <span>Discount Amount</span>
          <strong>− ₹{discountAmount.toFixed(2)}</strong>
        </div>

        <div className="summary-total">
          <span>Grand Total</span>
          <strong>₹{grandTotal.toFixed(2)}</strong>
        </div>

        <button
          type="button"
          className="generate-bill-button"
          onClick={handleGenerateBill}
        >
          Generate Bill →
        </button>
      </div>
    </div>
  );
}

export default CreateBill;
