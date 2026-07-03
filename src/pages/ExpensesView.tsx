import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TrendingDown, Plus, Trash2, Edit } from "lucide-react";

export default function ExpensesView() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const categories = ["raw_materials", "rent", "electricity", "salary", "other"];

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    if (error) {
      alert("Error loading expenses");
    } else {
      setExpenses(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!category || !description || !amount || isNaN(amountNum)) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("expenses")
        .update({ category, description, amount: amountNum, payment_method: paymentMethod })
        .eq("id", editingId);
      if (error) {
        alert("Error updating expense");
        return;
      }
    } else {
      const { error } = await supabase.from("expenses").insert([
        { category, description, amount: amountNum, payment_method: paymentMethod },
      ]);
      if (error) {
        alert("Error adding expense");
        return;
      }
    }

    setShowModal(false);
    resetForm();
    loadExpenses();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      alert("Error deleting expense");
      return;
    }
    loadExpenses();
  }

  function handleEdit(expense: any) {
    setEditingId(expense.id);
    setCategory(expense.category);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setPaymentMethod(expense.payment_method || "Cash");
    setShowModal(true);
  }

  function resetForm() {
    setEditingId(null);
    setCategory("");
    setDescription("");
    setAmount("");
    setPaymentMethod("Cash");
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const todayString = new Date().toDateString();
  const todayExpenses = expenses.filter(e => new Date(e.created_at).toDateString() === todayString).reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expenses</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your business expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-3xl font-bold text-foreground mt-1">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Today's Expenses</p>
          <p className="text-3xl font-bold text-red-600 mt-1">₹{todayExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No expenses recorded yet
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{expense.description}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">₹{expense.amount}</td>
                  <td className="px-6 py-4 text-muted-foreground">{expense.payment_method || "Cash"}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 hover:bg-muted rounded transition-colors mr-2"
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
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
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
