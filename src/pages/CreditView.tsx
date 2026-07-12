import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Users, ChevronDown, ChevronUp, DollarSign, Plus, Trash2, X } from "lucide-react";

export default function CreditView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [customerItems, setCustomerItems] = useState<any[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const { data, error } = await supabase
      .from("customers_credit")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      alert("Error loading customers");
    } else {
      setCustomers(data || []);
    }
  }

  async function loadCustomerItems(customerId: string) {
    const { data, error } = await supabase
      .from("customer_credit_items")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    
    if (error) {
      alert("Error loading items");
    } else {
      setCustomerItems(data || []);
    }
  }

  function toggleExpand(customerId: string) {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      setCustomerItems([]);
    } else {
      setExpandedCustomer(customerId);
      loadCustomerItems(customerId);
    }
  }

  function openPaymentModal(customer: any) {
    setSelectedCustomer(customer);
    setPaymentAmount("");
    setShowPaymentModal(true);
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(paymentAmount);
    
    if (!amountNum || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amountNum > selectedCustomer.pending_amount) {
      alert("Payment amount cannot exceed pending balance");
      return;
    }

    const newPaidAmount = selectedCustomer.paid_amount + amountNum;
    const newPendingAmount = selectedCustomer.pending_amount - amountNum;

    const { error } = await supabase
      .from("customers_credit")
      .update({
        paid_amount: newPaidAmount,
        pending_amount: newPendingAmount,
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedCustomer.id);

    if (error) {
      alert("Error processing payment: " + error.message);
      return;
    }

    setShowPaymentModal(false);
    loadCustomers();
  }

  async function deleteCustomer(customerId: string) {
    if (!confirm("Are you sure you want to delete this customer record? This will delete all associated items.")) return;
    
    const { error } = await supabase
      .from("customers_credit")
      .delete()
      .eq("id", customerId);

    if (error) {
      alert("Error deleting customer: " + error.message);
      return;
    }

    loadCustomers();
  }

  const totalPending = customers.reduce((sum, c) => sum + (c.pending_amount || 0), 0);
  const totalPaid = customers.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
  const totalCredit = customers.reduce((sum, c) => sum + (c.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Credit</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage customer-wise billing and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Credit</p>
              <p className="text-3xl font-bold text-foreground mt-1">₹{totalCredit.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-3xl font-bold text-green-600 mt-1">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Balance</p>
              <p className="text-3xl font-bold text-red-600 mt-1">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <DollarSign size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No credit customers yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {customers.map((customer) => (
              <div key={customer.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{customer.customer_name}</h3>
                      {customer.pending_amount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Pending
                        </span>
                      )}
                      {customer.pending_amount === 0 && customer.total_amount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Cleared
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-semibold text-foreground">₹{customer.total_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="text-sm font-semibold text-green-600">₹{customer.paid_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-sm font-semibold text-red-600">₹{customer.pending_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(customer.id)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                      title="View items"
                    >
                      {expandedCustomer === customer.id ? (
                        <ChevronUp size={18} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={18} className="text-muted-foreground" />
                      )}
                    </button>
                    {customer.pending_amount > 0 && (
                      <button
                        onClick={() => openPaymentModal(customer)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Add Payment
                      </button>
                    )}
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Delete customer"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Expanded Items */}
                {expandedCustomer === customer.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Items</h4>
                    {customerItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No items found</p>
                    ) : (
                      <div className="space-y-2">
                        {customerItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded-lg">
                            <div>
                              <span className="font-medium text-foreground">{item.item_name}</span>
                              <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-semibold text-foreground">₹{item.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Customer: {selectedCustomer.customer_name}</p>
              <p className="text-sm text-muted-foreground">Pending Balance: <span className="font-semibold text-red-600">₹{selectedCustomer.pending_amount.toLocaleString()}</span></p>
            </div>
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border p-2 rounded"
                  required
                  max={selectedCustomer.pending_amount}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
