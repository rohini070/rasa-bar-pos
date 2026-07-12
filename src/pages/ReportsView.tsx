import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportsView() {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [salesData, expensesData] = await Promise.all([
      supabase.from("sales").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
    ]);
    if (salesData.data) setSales(salesData.data);
    if (expensesData.data) setExpenses(expensesData.data);
    setLoading(false);
  }

  const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const profit = totalSales - totalExpenses;
  const totalOrders = sales.length;

  // Calculate time-based sales
  const todayString = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === todayString).reduce((sum, s) => sum + (s.total || 0), 0);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklySales = sales.filter(s => new Date(s.created_at) >= oneWeekAgo).reduce((sum, s) => sum + (s.total || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySales = sales.filter(s => {
    const date = new Date(s.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((sum, s) => sum + (s.total || 0), 0);

  // Prepare date-wise sales data for chart (last 30 days)
  const salesByDate: { [key: string]: number } = {};
  sales.forEach(s => {
    const date = new Date(s.created_at).toLocaleDateString();
    salesByDate[date] = (salesByDate[date] || 0) + (s.total || 0);
  });
  
  const chartData = Object.entries(salesByDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days

  // Get sales by item
  const salesByItem: { [key: string]: number } = {};
  sales.forEach(s => {
    salesByItem[s.item_name] = (salesByItem[s.item_name] || 0) + s.total;
  });
  const topItems = Object.entries(salesByItem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get expenses by category
  const expensesByCategory: { [key: string]: number } = {};
  expenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });
  const expenseCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Business analytics and performance reports</p>
      </div>

      {/* Time-based Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Sales</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{todaySales.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Sales</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{weeklySales.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Sales</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">₹{monthlySales.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{totalSales.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{profit.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date-wise Sales Chart */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted px-6 py-3">
          <h3 className="font-semibold text-foreground">Date-wise Sales (Last 30 Days)</h3>
        </div>
        <div className="p-6">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted px-6 py-3">
          <h3 className="font-semibold text-foreground">Top Selling Items</h3>
        </div>
        <div className="p-6">
          {topItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topItems.map(([name, total], index) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{name}</span>
                  </div>
                  <span className="font-semibold text-green-600">₹{total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted px-6 py-3">
          <h3 className="font-semibold text-foreground">Expenses by Category</h3>
        </div>
        <div className="p-6">
          {expenseCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No expense data yet</p>
          ) : (
            <div className="space-y-3">
              {expenseCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 capitalize">
                    {category.replace("_", " ")}
                  </span>
                  <span className="font-semibold text-red-600">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted px-6 py-3">
          <h3 className="font-semibold text-foreground">Recent Sales</h3>
        </div>
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No sales recorded yet
                </td>
              </tr>
            ) : (
              sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium text-foreground">{sale.item_name}</td>
                  <td className="px-6 py-4 text-foreground">{sale.quantity}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">₹{sale.total}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
