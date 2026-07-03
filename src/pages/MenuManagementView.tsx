import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Utensils, Plus, Trash2, Edit, RefreshCw } from "lucide-react";

export default function MenuManagementView() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const categories = ["Basic Juices", "Cold Pressed Juices", "Beverages", "Shakes", "Ice Cream Scoops", "Snacks", "Food", "Tiffin", "Momos"];

  useEffect(() => {
    loadMenuItems();
  }, []);

  async function loadMenuItems() {
    setLoading(true);
    const { data, error } = await supabase.from("menu_items").select("*").order("category", { ascending: true });
    if (error) {
      alert("Error loading menu items. Please try again.");
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name || !category || !price || isNaN(priceNum)) {
      alert("Please fill all fields");
      return;
    }

    const itemData = { name, category, price: priceNum, available };

    if (editingId) {
      const { error } = await supabase.from("menu_items").update(itemData).eq("id", editingId);
      if (error) {
        alert("Error updating menu item: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("menu_items").insert([itemData]);
      if (error) {
        alert("Error adding menu item: " + error.message);
        return;
      }
    }

    setShowModal(false);
    resetForm();
    await loadMenuItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      alert("Error deleting menu item: " + error.message);
      return;
    }
    await loadMenuItems();
  }

  function handleEdit(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPrice(String(item.price));
    setAvailable(item.available !== undefined ? item.available : true);
    setShowModal(true);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setCategory("");
    setPrice("");
    setAvailable(true);
  }

  const groupedItems = useMemo(() => {
    return menuItems.reduce((acc: any, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Menu Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your cafe menu items and prices</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMenuItems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Menu Items</p>
            <p className="text-3xl font-bold text-foreground mt-1">{menuItems.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Utensils size={24} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Menu Items by Category */}
      {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
        <div key={category} className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-muted px-6 py-3">
            <h3 className="font-semibold text-foreground">{category}</h3>
          </div>
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">₹{item.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.available !== false 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.available !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-muted rounded transition-colors mr-2"
                    >
                      <Edit size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {menuItems.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          No menu items added yet. Click "Add Item" to get started.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Item Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="e.g., Mango Shake"
                    required
                  />
                </div>
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
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full border p-2 rounded"
                    min="0"
                    step="1"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-foreground">
                    Available for sale
                  </label>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
