import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PiggyBank, Plus, Trash2, Edit } from "lucide-react";

export default function InvestmentsView() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadInvestments();
  }, []);

  async function loadInvestments() {
    const { data, error } = await supabase.from("investments").select("*").order("created_at", { ascending: false });
    if (error) {
      alert("Error loading investments");
    } else {
      setInvestments(data || []);
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
        .from("investments")
        .update({ category, description, amount: amountNum })
        .eq("id", editingId);
      if (error) {
        alert("Error updating investment");
        return;
      }
    } else {
      const { error } = await supabase.from("investments").insert([
        { category, description, amount: amountNum },
      ]);
      if (error) {
        alert("Error adding investment");
        return;
      }
    }

    setShowModal(false);
    resetForm();
    loadInvestments();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this investment?")) return;
    const { error } = await supabase.from("investments").delete().eq("id", id);
    if (error) {
      alert("Error deleting investment");
      return;
    }
    loadInvestments();
  }

  function handleEdit(investment: any) {
    setEditingId(investment.id);
    setCategory(investment.category);
    setDescription(investment.description);
    setAmount(String(investment.amount));
    setShowModal(true);
  }

  function resetForm() {
    setEditingId(null);
    setCategory("");
    setDescription("");
    setAmount("");
  }

  const totalInvestments = investments.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Investments</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your business investments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={18} />
          Add Investment
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Investments</p>
            <p className="text-3xl font-bold text-foreground mt-1">₹{totalInvestments.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <PiggyBank size={24} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {investments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No investments recorded yet
                </td>
              </tr>
            ) : (
              investments.map((investment) => (
                <tr key={investment.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {investment.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{investment.description}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">₹{investment.amount}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(investment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(investment)}
                      className="p-2 hover:bg-muted rounded transition-colors mr-2"
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(investment.id)}
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
              {editingId ? "Edit Investment" : "Add Investment"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="e.g., Equipment, Marketing"
                    required
                  />
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
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
