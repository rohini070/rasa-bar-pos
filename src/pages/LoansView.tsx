import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, Edit, DollarSign } from "lucide-react";

export default function LoansView() {
  const [loans, setLoans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [lender, setLender] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    loadLoans();
    loadPayments();
  }, []);

  async function loadLoans() {
    const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false });
    if (error) {
      alert("Error loading loans");
    } else {
      setLoans(data || []);
    }
  }

  async function loadPayments() {
    const { data, error } = await supabase.from("loan_payments").select("*").order("payment_date", { ascending: false });
    if (error) {
      alert("Error loading payments");
    } else {
      setPayments(data || []);
    }
  }

  function getLoanPayments(loanId: string) {
    return payments.filter(p => p.loan_id === loanId);
  }

  function getTotalPaid(loanId: string) {
    return getLoanPayments(loanId).reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  }

  function getRemaining(loan: any) {
    const totalPaid = getTotalPaid(loan.id);
    return Math.max(0, loan.amount - totalPaid);
  }

  function getLoanStatus(loan: any) {
    const remaining = getRemaining(loan);
    return remaining <= 0 ? 'Completed' : 'Active';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    const interestRateNum = Number(interestRate) || 0;
    
    if (!lender || !description || !amount || isNaN(amountNum)) {
      alert("Please fill all required fields");
      return;
    }

    const loanData = {
      lender: lender,
      description,
      amount: amountNum,
      interest_rate: interestRateNum,
    };

    if (editingId) {
      const { error } = await supabase.from("loans").update(loanData).eq("id", editingId);
      if (error) {
        alert("Error updating loan: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("loans").insert([loanData]);
      if (error) {
        alert("Error adding loan: " + error.message);
        return;
      }
    }

    setShowModal(false);
    resetForm();
    loadLoans();
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    const paymentAmountNum = Number(paymentAmount);
    
    if (!paymentLoanId || !paymentAmount || isNaN(paymentAmountNum) || paymentAmountNum <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const loan = loans.find(l => l.id === paymentLoanId);
    if (!loan) return;

    const totalPaid = getTotalPaid(paymentLoanId);
    const remaining = loan.amount - totalPaid;

    if (paymentAmountNum > remaining) {
      alert(`Payment amount (₹${paymentAmountNum}) exceeds remaining balance (₹${remaining})`);
      return;
    }

    const paymentData = {
      loan_id: paymentLoanId,
      amount_paid: paymentAmountNum,
      notes: paymentNotes || null,
    };

    const { error } = await supabase.from("loan_payments").insert([paymentData]);
    if (error) {
      alert("Error adding payment: " + error.message);
      return;
    }

    setShowPaymentModal(false);
    resetPaymentForm();
    loadPayments();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this loan?")) return;
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) {
      alert("Error deleting loan");
      return;
    }
    loadLoans();
  }

  function openPaymentModal(loanId: string) {
    setPaymentLoanId(loanId);
    setPaymentAmount("");
    setPaymentNotes("");
    setShowPaymentModal(true);
  }

  function handleEdit(loan: any) {
    setEditingId(loan.id);
    setLender(loan.lender);
    setDescription(loan.description);
    setAmount(String(loan.amount));
    setInterestRate(String(loan.interest_rate || 0));
    setShowModal(true);
  }

  function resetForm() {
    setEditingId(null);
    setLender("");
    setDescription("");
    setAmount("");
    setInterestRate("");
  }

  function resetPaymentForm() {
    setPaymentLoanId(null);
    setPaymentAmount("");
    setPaymentNotes("");
  }

  const totalLoans = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + getRemaining(l), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Loans</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your business loans</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={18} />
          Add Loan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Loans</p>
          <p className="text-3xl font-bold text-foreground mt-1">₹{totalLoans.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-1">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground">Remaining to Pay</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">₹{totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loans.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                  No loans recorded yet
                </td>
              </tr>
            ) : (
              loans.map((loan) => {
                const totalPaid = getTotalPaid(loan.id);
                const remaining = getRemaining(loan);
                const status = getLoanStatus(loan);
                return (
                  <tr key={loan.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{loan.lender}</td>
                    <td className="px-6 py-4 text-foreground">{loan.description}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">₹{loan.amount}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">₹{totalPaid}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ₹{remaining}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(loan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openPaymentModal(loan.id)}
                        disabled={status === 'Completed'}
                        className="p-2 hover:bg-muted rounded transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Add Payment"
                      >
                        <DollarSign size={16} className={status === 'Completed' ? 'text-gray-400' : 'text-green-600'} />
                      </button>
                      <button
                        onClick={() => handleEdit(loan)}
                        className="p-2 hover:bg-muted rounded transition-colors mr-2"
                      >
                        <Edit size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(loan.id)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Loan" : "Add Loan"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Lender Name</label>
                  <input
                    type="text"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="e.g., Bank, Individual"
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
                  <label className="block text-sm font-medium text-foreground mb-1">Loan Amount (₹)</label>
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
                  <label className="block text-sm font-medium text-foreground mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Optional"
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
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="w-full border p-2 rounded"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g., EMI payment, partial payment"
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetPaymentForm();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
