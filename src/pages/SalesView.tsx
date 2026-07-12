import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, Plus, Trash2, Edit, Clock, CheckCircle } from "lucide-react";
import SearchableDropdown from "../components/SearchableDropdown";

export default function SalesView() {
  const [sales, setSales] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCredit, setIsCredit] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    loadSales();
    loadMenuItems();
  }, []);

  async function loadSales() {
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    if (error) {
      alert("Error loading sales");
    } else {
      setSales(data || []);
    }
  }

  async function loadMenuItems() {
    const { data, error } = await supabase.from("menu_items").select("*");
    if (error) {
      alert("Error loading menu items");
    } else {
      setMenuItems(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const quantityNum = Number(quantity);
    const priceNum = Number(price);
    
    if (!selectedItem || !quantity || !price || isNaN(quantityNum) || isNaN(priceNum)) {
      alert("Please fill all fields");
      return;
    }

    if (isCredit && !customerName.trim()) {
      alert("Please enter customer name for credit sale");
      return;
    }

    const total = quantityNum * priceNum;

    if (isCredit) {
      // Customer-based credit system
      const customerNameTrimmed = customerName.trim();
      
      // Check if customer already exists
      const { data: existingCustomer } = await supabase
        .from("customers_credit")
        .select("*")
        .eq("customer_name", customerNameTrimmed)
        .single();

      let customerId: string;

      if (existingCustomer) {
        // Update existing customer
        customerId = existingCustomer.id;
        const newTotal = existingCustomer.total_amount + total;
        const newPending = existingCustomer.pending_amount + total;

        const { error: updateError } = await supabase
          .from("customers_credit")
          .update({
            total_amount: newTotal,
            pending_amount: newPending,
            updated_at: new Date().toISOString()
          })
          .eq("id", customerId);

        if (updateError) {
          alert("Error updating customer credit: " + updateError.message);
          return;
        }
      } else {
        // Create new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from("customers_credit")
          .insert([{
            customer_name: customerNameTrimmed,
            total_amount: total,
            paid_amount: 0,
            pending_amount: total,
          }])
          .select()
          .single();

        if (insertError || !newCustomer) {
          alert("Error creating customer: " + (insertError?.message || "Unknown error"));
          return;
        }

        customerId = newCustomer.id;
      }

      // Add item to customer_credit_items
      const { error: itemError } = await supabase
        .from("customer_credit_items")
        .insert([{
          customer_id: customerId,
          item_name: selectedItem.name,
          price: priceNum,
          quantity: quantityNum,
          total: total,
        }]);

      if (itemError) {
        alert("Error adding item to customer: " + itemError.message);
        return;
      }
    } else {
      // Normal sale
      const saleData = {
        item_name: selectedItem.name,
        quantity: quantityNum,
        price: priceNum,
        total,
        payment_method: paymentMethod,
      };

      if (editingId) {
        const { error } = await supabase.from("sales").update(saleData).eq("id", editingId);
        if (error) {
          alert("Error updating sale");
          return;
        }
      } else {
        // Prevent duplicate sales within last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const { data: recentSale } = await supabase.from("sales")
          .select("*")
          .eq("item_name", selectedItem.name)
          .eq("quantity", quantityNum)
          .eq("total", total)
          .gte("created_at", fiveMinutesAgo.toISOString())
          .single();
        
        if (recentSale) {
          alert("Similar sale was just recorded. Please wait a moment or verify.");
          return;
        }

        const { error } = await supabase.from("sales").insert([saleData]);
        if (error) {
          alert("Error adding sale");
          return;
        }
      }
      loadSales();
    }

    setShowModal(false);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this sale?")) return;
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) {
      alert("Error deleting sale");
      return;
    }
    loadSales();
  }

  function handleEdit(sale: any) {
    setEditingId(sale.id);
    const item = menuItems.find(m => m.name === sale.item_name);
    setSelectedItem(item || null);
    setQuantity(String(sale.quantity));
    setPrice(String(sale.price));
    setPaymentMethod(sale.payment_method || "Cash");
    setShowModal(true);
  }

  function resetForm() {
    setEditingId(null);
    setSelectedItem(null);
    setQuantity("");
    setPrice("");
    setPaymentMethod("Cash");
    setIsCredit(false);
    setCustomerName("");
  }

  const totalSales = sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
  const totalOrders = sales.length;
  const todayString = new Date().toDateString();
  const todaySales = sales.filter((s: any) => new Date(s.created_at).toDateString() === todayString).reduce((sum: number, s: any) => sum + (s.total || 0), 0);
  const todayOrders = sales.filter((s: any) => new Date(s.created_at).toDateString() === todayString).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your sales</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Add Sale
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-3xl font-bold text-foreground mt-1">₹{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Today's Sales</p>
          <p className="text-3xl font-bold text-green-600 mt-1">₹{todaySales.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalOrders}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Today's Orders</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{todayOrders}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No sales recorded yet
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">{sale.item_name}</td>
                  <td className="px-6 py-4 text-foreground">{sale.quantity}</td>
                  <td className="px-6 py-4 text-foreground">₹{sale.price}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">₹{sale.total}</td>
                  <td className="px-6 py-4 text-muted-foreground">{sale.payment_method || "Cash"}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="p-2 hover:bg-muted rounded transition-colors mr-2"
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Sale" : "Add Sale"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Item</label>
                  <SearchableDropdown
                    items={menuItems}
                    onSelect={(item) => {
                      setSelectedItem(item);
                      setPrice(String(item.price));
                    }}
                    placeholder="Search item..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full border p-2 rounded"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    readOnly
                    placeholder="Auto-filled from menu"
                    className="w-full border p-2 rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={isCredit}
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="credit"
                    checked={isCredit}
                    onChange={(e) => setIsCredit(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="credit" className="text-sm font-medium text-foreground">
                    Mark as Credit / Pay Later
                  </label>
                </div>
                {isCredit && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
