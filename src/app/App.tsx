import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import SearchableDropdown from "../components/SearchableDropdown";
import ExpensesView from "../pages/ExpensesView";
import InvestmentsView from "../pages/InvestmentsView";
import LoansView from "../pages/LoansView";
import SalesView from "../pages/SalesView";
import MenuManagementPage from "../pages/MenuManagementView";
import ReportsView from "../pages/ReportsView";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  ChevronRight,
  CircleDollarSign,
  PiggyBank,
  Utensils,
  Plus,
  Pencil,
  Trash2,
  Check,
  ShoppingBag,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  LineChart,
  Send,
  Mic,
  Bot,
  Sparkles,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavId =
  | "Dashboard"
  | "Sales"
  | "Expenses"
  | "Investments"
  | "Loans"
  | "Reports"
  | "Menu Management"
  | "Settings";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
  typing?: boolean;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const GREEN      = "#15803d";
const GREEN_LIGHT = "#dcfce7";
const GREEN_TEXT  = "#14532d";
const RED        = "#dc2626";
const RED_LIGHT  = "#fee2e2";

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS: { label: NavId; icon: any }[] = [
  { label: "Dashboard",      icon: LayoutDashboard },
  { label: "Sales",          icon: TrendingUp      },
  { label: "Expenses",       icon: TrendingDown    },
  { label: "Investments",    icon: PiggyBank       },
  { label: "Loans",          icon: CreditCard      },
  { label: "Reports",        icon: BarChart3       },
  { label: "Menu Management",icon: Utensils        },
  { label: "Settings",       icon: Settings        },
];

// ─── Metric cards ─────────────────────────────────────────────────────────────

const METRIC_CARDS = [
  { label: "Today's Sales",    icon: TrendingUp,       accent: GREEN_LIGHT, iconColor: GREEN,     mono: true  },
  { label: "Today's Expenses", icon: TrendingDown,     accent: RED_LIGHT,   iconColor: RED,       mono: true  },
  { label: "Today's Orders",   icon: ShoppingCart,     accent: "#e0f2fe",   iconColor: "#0369a1", mono: false },
  { label: "Monthly Sales",    icon: CircleDollarSign, accent: GREEN_LIGHT, iconColor: GREEN,     mono: true  },
  { label: "Monthly Expenses", icon: Receipt,          accent: RED_LIGHT,   iconColor: RED,       mono: true  },
  { label: "Monthly Profit",   icon: Wallet,           accent: "#ede9fe",   iconColor: "#7c3aed", mono: true  },
  { label: "Total Investment", icon: PiggyBank,        accent: "#fef9c3",   iconColor: "#92400e", mono: true  },
  { label: "Remaining Loan",   icon: CreditCard,       accent: "#fff7ed",   iconColor: "#c2410c", mono: true  },
  { label: "Top Selling Item", icon: Sparkles,         accent: "#fef3c7",   iconColor: "#d97706", mono: false },
  { label: "Most Profitable",  icon: LineChart,        accent: "#d1fae5",   iconColor: "#059669", mono: true  },
  { label: "Low Stock Alert",  icon: AlertTriangle,     accent: "#fee2e2",   iconColor: "#dc2626", mono: false },
];

// ─── Menu seed ────────────────────────────────────────────────────────────────

const INITIAL_MENU: MenuItem[] = [
  { id: 1, name: "ABC Juice",        price: 80,  category: "Beverages" },
  { id: 2, name: "Watermelon Juice", price: 70,  category: "Beverages" },
  { id: 3, name: "Oreo Shake",       price: 120, category: "Shakes"    },
  { id: 4, name: "French Fries",     price: 100, category: "Snacks"    },
  { id: 5, name: "Idli (2 pcs)",     price: 50,  category: "Tiffin"    },
];

const MENU_CATEGORIES = ["Beverages", "Shakes", "Snacks", "Tiffin", "Meals", "Desserts", "Other"];

// ─── AI Suggestions ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Is this an Expense or Investment?",
  "Add today's sale",
  "Add today's expense",
  "Show monthly profit",
  "Show remaining loan",
  "Which item sells the most?",
  "How much did we spend this month?",
  "What should I buy tomorrow?",
  "Show today's summary",
];

// ─── AI brain ─────────────────────────────────────────────────────────────────

function getAIResponse(input: string): string {
  const q = input.toLowerCase().trim();

  // Fryer / equipment / asset
  if (/fryer|machine|equipment|oven|blender|mixer|grinder|refriger|fridge|ac|air con|furniture|asset|long.term/i.test(q)) {
    const match = q.match(/₹\s?([\d,]+)/) || q.match(/([\d,]+)/);
    const amt = match ? `₹${match[1].replace(/,/g, "")}` : "this amount";
    return `This should be recorded as an **Investment** because it is a long-term business asset that will benefit Rasa Bar for more than one year.\n\n💡 Go to **Investments → New Investment** and log ${amt} under "Equipment".`;
  }

  // Fruits / daily perishables / raw materials
  if (/fruit|vegetable|milk|coffee bean|ingredient|raw material|supply|packaging|straw|cup|spice/i.test(q)) {
    const match = q.match(/₹\s?([\d,]+)/) || q.match(/([\d,]+)/);
    const amt = match ? `₹${match[1].replace(/,/g, "")}` : "this amount";
    return `This should be recorded as an **Expense** — specifically under the *Raw Materials* or *Ingredients* category, since these are consumed daily in running your cafe.\n\n💡 Go to **Expenses → New Expense** and log ${amt} under "Fruits / Ingredients".`;
  }

  // Capital investment / partner / brother / friend invested
  if (/invest|capital|partner|brother|sister|friend|family|shareholder/i.test(q)) {
    const match = q.match(/₹\s?([\d,]+)/) || q.match(/([\d,]+)/);
    const amt = match ? `₹${match[1].replace(/,/g, "")}` : "the amount";
    return `I'll record this as a **Capital Investment**. 💰\n\nWhen someone puts money into the business (not as a loan), it is equity — it grows the total investment in Rasa Bar.\n\n💡 Go to **Investments → New Investment** and log ${amt} under "Capital / Partner Contribution".`;
  }

  // Loan repayment
  if (/loan|paid|repay|paid.*ravi|paid.*loan|loan.*paid|emi|installment/i.test(q)) {
    const match = q.match(/₹\s?([\d,]+)/) || q.match(/([\d,]+)/);
    const amt = match ? `₹${match[1].replace(/,/g, "")}` : "this amount";
    return `Got it! I'll update the loan record and reduce the remaining balance by ${amt}. 📋\n\n💡 Go to **Loans** and log this repayment. The remaining loan balance will automatically decrease.`;
  }

  // Monthly profit
  if (/profit|how much.*earn|earn.*month|this month.*profit/i.test(q)) {
    return `Your **Monthly Profit** is currently **₹0** because no sales or expenses have been recorded yet.\n\nOnce you start entering data:\n• Monthly Profit = Monthly Sales − Monthly Expenses\n\n💡 Start by adding your first sale under **Quick Actions → New Sale**.`;
  }

  // Monthly expenses / spending
  if (/spend|spent|expense.*month|how much.*spent|spending/i.test(q)) {
    return `Your **Monthly Expenses** are currently **₹0** — no expenses have been recorded yet.\n\n💡 Add your daily expenses under **Quick Actions → New Expense** or visit the **Expenses** section.`;
  }

  // Monthly sales
  if (/monthly sale|total sale|sales this month/i.test(q)) {
    return `Your **Monthly Sales** are currently **₹0**. No sales have been recorded yet for this month.\n\n💡 Tap **New Sale** from the Dashboard to log your first sale!`;
  }

  // Today's summary
  if (/today.*summary|summary.*today|show.*today|how.*today/i.test(q)) {
    return `Here's **Today's Summary** for Rasa Bar:\n\n📈 Today's Sales: ₹0\n📉 Today's Expenses: ₹0\n🛒 Today's Orders: 0\n💵 Net Today: ₹0\n\nNo transactions recorded yet for today. Start by adding a sale or expense from the Dashboard.`;
  }

  // Remaining loan
  if (/remaining.*loan|loan.*remaining|how much.*loan|loan balance/i.test(q)) {
    return `Your **Remaining Loan** is currently **₹0** — no loans have been entered yet.\n\n💡 Visit the **Loans** section to add a loan and track repayments.`;
  }

  // Best selling item
  if (/sell.*most|most.*sell|popular item|best.*item|top.*item|which item/i.test(q)) {
    return `No sales data is available yet to determine your best-selling item. 📊\n\nOnce you start recording sales, I'll analyse them and tell you which items generate the most revenue for Rasa Bar.\n\n💡 Start logging sales under **New Sale** on the Dashboard.`;
  }

  // What to buy
  if (/what.*buy|buy.*tomorrow|restock|inventory/i.test(q)) {
    return `Great question! 🛒 Once you start logging daily sales, I'll track which ingredients run out fastest and suggest what to restock.\n\nFor now, based on your menu:\n• ABC Juice & Watermelon Juice need fresh fruits daily\n• Oreo Shake needs milk, cream & Oreos\n• Idli needs rice batter & condiments\n• French Fries need potatoes & oil`;
  }

  // Expense vs investment
  if (/expense.*invest|invest.*expense|difference|which.*one|what is.*expense|what is.*invest/i.test(q)) {
    return `Great question! Here's the simple rule:\n\n📦 **Expense** — something you buy and use up quickly (fruits, packaging, electricity, rent, salaries)\n\n🏗️ **Investment** — something that lasts and helps the business grow (equipment, furniture, software, vehicles)\n\n💡 Ask me about any specific purchase and I'll tell you which category it belongs to!`;
  }

  // Add today's sale
  if (/add.*sale|record.*sale|new sale|log.*sale/i.test(q)) {
    return `To add a sale, go to **Quick Actions → New Sale** on the Dashboard, or visit the **Sales** section.\n\nYou'll need:\n• Date & time\n• Item(s) sold\n• Quantity\n• Amount received (₹)\n\nWould you like help understanding what counts as a sale? 😊`;
  }

  // Add expense
  if (/add.*expense|record.*expense|new expense|log.*expense/i.test(q)) {
    return `To add an expense, tap **Quick Actions → New Expense** on the Dashboard, or visit the **Expenses** section.\n\nYou'll need:\n• Date\n• Category (Ingredients, Rent, Salary, Utilities…)\n• Amount (₹)\n• Optional: Note or receipt\n\nNeed help deciding if something is an expense? Just describe it to me! 🙂`;
  }

  // Greetings
  if (/^(hi|hello|hey|namaste|good|hii+)[\s!?.]*$/.test(q)) {
    return `Namaste! 🙏 I'm **Rasa AI**, your smart business assistant for Rasa Bar.\n\nI can help you:\n• Decide if a purchase is an Expense or Investment\n• Add sales and expenses\n• Understand your profits and loans\n• Give daily business tips\n\nWhat would you like to know today?`;
  }

  // Thank you
  if (/thank|thanks|shukriya|dhanyavaad/i.test(q)) {
    return `You're welcome! 😊 If you have more questions about Rasa Bar's finances, I'm always here to help. Feel free to ask anything!`;
  }

  // Default fallback
  return `I understand you're asking about: *"${input}"*\n\nI'm still learning Rasa Bar's full data, but I can help you with:\n\n• 📊 Expense vs Investment decisions\n• 💰 Adding sales and expenses\n• 📈 Profit, loan, and investment queries\n• 🍹 Menu and inventory questions\n\nTry rephrasing or pick one of the suggested questions below!`;
}

function nowTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function today() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message, action }: { icon: any; message: string; action?: { label: string } }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: GREEN_LIGHT }}>
        <Icon size={20} color={GREEN} />
      </div>
      <p className="text-sm font-medium text-center" style={{ color: "var(--muted-foreground)" }}>{message}</p>
      {action && (
        <button
          className="mt-1 text-xs font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-85"
          style={{ background: GREEN, color: "white" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Chart Placeholder ────────────────────────────────────────────────────────

function ChartPlaceholder({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GREEN_LIGHT }}>
          <Icon size={15} color={GREEN} />
        </div>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center rounded-xl py-10 gap-2.5"
        style={{ background: "var(--background)", border: "1.5px dashed rgba(0,0,0,0.1)" }}
      >
        <Icon size={30} strokeWidth={1} style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
        <p className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>No data available yet.</p>
        <p className="text-xs text-center px-6" style={{ color: "var(--muted-foreground)", opacity: 0.65 }}>
          Charts will populate once you start recording sales and expenses.
        </p>
      </div>
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────

function DataTable({
  title,
  columns,
  data,
  emptyMessage,
  emptyAction,
  icon
}: {
  title: string;
  columns: string[];
  data: any[];
  emptyMessage: string;
  emptyAction: string;
  icon: any;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ background: GREEN_LIGHT, color: GREEN_TEXT }}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[340px]">
          <thead>
            <tr style={{ background: "var(--background)" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-5 py-3 font-semibold uppercase"
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "0.63rem",
                    letterSpacing: "0.07em",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data && data.length > 0 ? (
              data.map((row, i) => ( // Map sales data to table rows
                <tr key={i} className="border-b border-border">
                  <td className="px-5 py-3 text-foreground">{row.created_at}</td> {/* Date */}
                  <td className="px-5 py-3 text-foreground">{row.item_name}</td> {/* Item */}
                  <td className="px-5 py-3 text-foreground">{row.quantity}</td> {/* Qty */}
                  <td className="px-5 py-3 text-foreground">{row.total}</td> {/* Amount */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={icon}
                    message={emptyMessage}
                    action={{ label: emptyAction }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({
  label,
  icon: Icon,
  accent,
  iconColor,
  onClick,
}: {
  label: string;
  icon: any;
  accent: string;
  iconColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label} // Added for accessibility
      className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-border bg-card shadow-sm
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group text-left w-full"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-200"
        style={{ background: accent }}
      >
        <Icon size={18} color={iconColor} />
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-semibold text-foreground">
          {label}
        </span>
        <ArrowUpRight
          size={15}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: iconColor }}
        />
      </div>
    </button>
  );
}
// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView() {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showSaleModal, setShowSaleModal] = useState(false);
  
  // State for sale inputs
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // State for expense inputs
  const [newCat, setNewCat] = useState("Cash");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  
  // State for investment inputs
  const [newInvestmentCategory, setNewInvestmentCategory] = useState("");
  const [newInvestmentDescription, setNewInvestmentDescription] = useState("");
  const [newInvestmentAmount, setNewInvestmentAmount] = useState(0);
  
  // State for loan inputs
  const [newLoanAmount, setNewLoanAmount] = useState(0);
  const [newLoanDescription, setNewLoanDescription] = useState("");

  useEffect(() => {
    loadSales();
    loadExpenses();
    loadInvestments();
    loadLoans();
    loadMenuItems();

    const interval = setInterval(() => {
      loadSales();
      loadExpenses();
      loadInvestments();
      loadLoans();
      loadMenuItems();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  async function loadSales() {
    const { data, error } = await supabase.from("sales").select("*");
    if (error) {
      alert("Error loading sales");
    } else {
      setSales(data || []);
    }
  }

  async function loadExpenses() {
    const { data, error } = await supabase.from("expenses").select("*");
    if (error) {
      alert("Error loading expenses");
    } else {
      setExpenses(data || []);
    }
  }

  async function loadInvestments() {
    const { data, error } = await supabase.from("investments").select("*");
    if (error) {
      alert("Error loading investments");
    } else {
      setInvestments(data || []);
    }
  }

  async function loadLoans() {
    const { data, error } = await supabase.from("loans").select("*");
    if (error) {
      alert("Error loading loans");
    } else {
      setLoans(data || []);
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

  const totalSalesAllTime = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalOrders = sales.length;
  const todayString = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === todayString).reduce((sum, s) => sum + (s.total || 0), 0);
  const todayOrders = sales.filter(s => new Date(s.created_at).toDateString() === todayString).length;

  // Monthly calculations
  const currentMonth = new Date().getMonth();
  const monthlySales = sales.filter(s => new Date(s.created_at).getMonth() === currentMonth).reduce((sum, s) => sum + (s.total || 0), 0);
  const monthlyOrders = sales.filter(s => new Date(s.created_at).getMonth() === currentMonth).length;

  // Expense calculations
  const todayExpenses = expenses.filter(e => new Date(e.created_at).toDateString() === todayString).reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyExpenses = expenses.filter(e => new Date(e.created_at).getMonth() === currentMonth).reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyProfit = monthlySales - monthlyExpenses;

  // Investment calculations
  const totalInvestments = investments.reduce((sum, i) => sum + (i.amount || 0), 0);

  // Loan calculations
  const totalLoans = loans.reduce((sum, l) => sum + (l.remaining || 0), 0);

  // Top selling item calculation
  const itemSales: { [key: string]: number } = {};
  sales.forEach(sale => {
    itemSales[sale.item_name] = (itemSales[sale.item_name] || 0) + sale.quantity;
  });
  const topSellingItem = Object.entries(itemSales).sort((a, b) => b[1] - a[1])[0];

  // Most profitable item (simplified - based on total revenue)
  const itemRevenue: { [key: string]: number } = {};
  sales.forEach(sale => {
    itemRevenue[sale.item_name] = (itemRevenue[sale.item_name] || 0) + sale.total;
  });
  const mostProfitableItem = Object.entries(itemRevenue).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-7">
      <div className="pb-1">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Rasa Bar Business Overview</h2>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Track your sales, expenses, investments, and overall business performance.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {METRIC_CARDS.map(({ label, icon: Icon, accent, iconColor, mono }) => {
          const hasData = (label === "Today's Sales" || label === "Today's Orders" || label === "Monthly Sales" || label === "Monthly Orders")
            ? sales.length > 0
            : (label === "Today's Expenses" || label === "Monthly Expenses")
            ? expenses.length > 0
            : label === "Monthly Profit"
            ? sales.length > 0 || expenses.length > 0
            : label === "Total Investment"
            ? investments.length > 0
            : label === "Remaining Loan"
            ? loans.length > 0
            : (label === "Top Selling Item" || label === "Most Profitable")
            ? sales.length > 0
            : label === "Low Stock Alert"
            ? false
            : false;

          return (
            <div key={label} className="bg-card rounded-2xl border border-border p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-3 gap-2">
                <p className="text-xs font-medium leading-snug" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: accent }}>
                  <Icon size={13} color={iconColor} />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold tracking-tight text-foreground" style={mono ? { fontFamily: "'DM Mono', monospace" } : {}}>
                {label === "Today's Sales"
                  ? `₹${todaySales}`
                  : label === "Today's Expenses"
                  ? `₹${todayExpenses}`
                  : label === "Today's Orders"
                  ? todayOrders
                  : label === "Monthly Sales"
                  ? `₹${monthlySales}`
                  : label === "Monthly Expenses"
                  ? `₹${monthlyExpenses}`
                  : label === "Monthly Profit"
                  ? `₹${monthlyProfit}`
                  : label === "Monthly Orders"
                  ? monthlyOrders
                  : label === "Total Investment"
                  ? `₹${totalInvestments}`
                  : label === "Remaining Loan"
                  ? `₹${totalLoans}`
                  : label === "Top Selling Item"
                  ? topSellingItem ? `${topSellingItem[0]}` : "N/A"
                  : label === "Most Profitable"
                  ? mostProfitableItem ? `₹${mostProfitableItem[1]}` : "₹0"
                  : label === "Low Stock Alert"
                  ? "None"
                  : mono
                  ? "₹0"
                  : "0"}
              </p>
              {!hasData && <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--muted-foreground)", opacity: 0.65 }}>No data entered yet</p>}
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <QuickAction
            label="New Sale"
            icon={TrendingUp}
            accent={GREEN_LIGHT}
            iconColor={GREEN}
            onClick={() => setShowSaleModal(true)}
          />
        </div>
      </div>

      {/* Other components like charts and data tables... */}

      {showSaleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">
            <h2 className="text-xl font-bold mb-4">New Sale</h2>
            <SearchableDropdown
              items={menuItems}
              onSelect={(item) => {
                setSelectedItem(item);
                setPrice(String(item.price));
              }}
              placeholder="Search item..."
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              readOnly
              className="w-full border p-2 mb-3 rounded bg-gray-100"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaleModal(false);
                  setSelectedItem(null);
                  setQuantity("");
                  setPrice("");
                  setPaymentMethod("Cash");
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedItem) {
                    alert("Please select an item");
                    return;
                  }
                  const quantityNum = Number(quantity);
                  const priceNum = Number(price);
                  if (!quantity || !price || isNaN(quantityNum) || isNaN(priceNum)) {
                    alert("Please enter valid quantity and price");
                    return;
                  }
                  const total = quantityNum * priceNum;
                  const { error } = await supabase.from("sales").insert([
                    {
                      item_name: selectedItem.name,
                      quantity: quantityNum,
                      price: priceNum,
                      total,
                      payment_method: paymentMethod,
                    },
                  ]);
                  if (!error) {
                    setShowSaleModal(false);
                    setSelectedItem(null);
                    setQuantity("");
                    setPrice("");
                    setPaymentMethod("Cash");
                    loadSales();
                    loadExpenses();
                    loadInvestments();
                    loadLoans();
                  } else {
                    alert("Error saving sale");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsView() {
  const fields = [
    { label: "Business Name", placeholder: "Rasa Bar", defaultValue: "Rasa Bar" },
    { label: "Owner Name", placeholder: "Your full name", defaultValue: "" },
    { label: "Location", placeholder: "City, State", defaultValue: "" },
    { label: "GST Number", placeholder: "22AAAAA0000A1Z5", defaultValue: "" },
    { label: "Phone", placeholder: "+91 98765 43210", defaultValue: "" },
    { label: "Email", placeholder: "hello@rasabar.in", defaultValue: "" },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Manage your business profile and preferences.</p>
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        {fields.map(({ label, placeholder, defaultValue }) => (
          <div key={label} className="px-5 py-4">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</label>
            <input
              defaultValue={defaultValue}
              placeholder={placeholder}
              aria-label={label} // Added for accessibility
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background text-foreground outline-none"
              style={{ transition: "box-shadow 0.15s" }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${GREEN}22`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>
        ))}
      </div>
      <button className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-85" style={{ background: GREEN, color: "white" }}>Save Changes</button>
    </div>
  );
}
// ─── AI Chat Panel ────────────────────────────────────────────────────────────
function parseAIText(text: string) {
  // Bold **text** and line breaks
  const parts = text.split("\n").map((line, li) => {
    const segments: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;
    while (remaining.length > 0) {
      const boldStart = remaining.indexOf("**");
      if (boldStart === -1) { segments.push(<span key={key++}>{remaining}</span>); break; }
      if (boldStart > 0) segments.push(<span key={key++}>{remaining.slice(0, boldStart)}</span>);
      const boldEnd = remaining.indexOf("**", boldStart + 2);
      if (boldEnd === -1) { segments.push(<span key={key++}>{remaining}</span>); break; }
      segments.push(<strong key={key++} className="font-semibold">{remaining.slice(boldStart + 2, boldEnd)}</strong>);
      remaining = remaining.slice(boldEnd + 2);
    }
    return <span key={li} className="block">{segments}</span>;
  });
  return parts;
}

function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "ai",
      text: "Namaste! 🙏 I'm **Rasa AI**, your smart business assistant.\n\nI can help you classify expenses vs investments, log transactions, check your profits, and more.\n\nWhat would you like to know today?",
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: "user", text: trimmed, time: nowTime() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    const delay = 900 + Math.random() * 600;
    setTimeout(() => {
      const response = getAIResponse(trimmed);
      setMessages((p) => [...p, { id: nextId.current++, role: "ai", text: response, time: nowTime() }]);
      setIsTyping(false);
    }, delay);
  }

  function toggleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      sendMessage("Voice input is not supported in this browser. Please type your question.");
      return;
    }
    if (listening) { setListening(false); return; }
    setListening(true);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      sendMessage(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex flex-col w-full sm:w-[400px] shadow-2xl"
      style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 shrink-0"
        style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #166534 100%)` }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
          🍹
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Rasa AI Assistant</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            <p className="text-xs text-white/70">Your Smart Business Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.15)" }}
          aria-label="Close chat panel"
        >
          <X size={16} color="white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm mt-0.5" style={{ background: GREEN_LIGHT }}>
                🤖
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div
                className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: GREEN, color: "white", borderBottomRightRadius: "6px" }
                    : { background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)", borderBottomLeftRadius: "6px" }
                }
              >
                {parseAIText(msg.text)}
              </div>
              <span className="text-xs px-1" style={{ color: "var(--muted-foreground)" }}>{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm" style={{ background: GREEN_LIGHT }}>🤖</div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: "var(--background)", border: "1px solid var(--border)", borderBottomLeftRadius: "6px" }}>
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "var(--muted-foreground)",
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {SUGGESTIONS.slice(0, 5).map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 border transition-colors hover:border-green-400"
              style={{ background: GREEN_LIGHT, color: GREEN_TEXT, border: `1px solid ${GREEN}33` }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-2 shrink-0 border-t border-border">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-2xl border transition-shadow"
          style={{ background: "var(--background)", border: "1.5px solid var(--border)" }}
          onFocus={() => {}}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything about your business…"
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={toggleVoice}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
            style={{ background: listening ? "#fee2e2" : "var(--muted)" }}
            title="Voice input"
          >
            <Mic size={15} color={listening ? RED : "var(--muted-foreground)"} />
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
            style={{ background: GREEN }}
          >
            <Send size={13} color="white" />
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "var(--muted-foreground)", opacity: 0.55 }}>
          Rasa AI · Powered by smart business logic
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
// ─── Floating AI Button ───────────────────────────────────────────────────────
function FloatingAIButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open AI Assistant" // Added for accessibility
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full shadow-xl
        hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200 group"
      style={{
        background: `linear-gradient(135deg, ${GREEN} 0%, #166534 100%)`,
        boxShadow: `0 8px 32px ${GREEN}55`,
      }}
    >
      <span className="text-lg leading-none select-none">🤖</span>
      <span className="text-sm font-bold text-white tracking-tight">Ask Rasa AI</span>
      <Sparkles size={14} color="rgba(255,255,255,0.7)" className="group-hover:rotate-12 transition-transform" />
    </button>
  );
}
// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState<NavId>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);


  function renderContent() {
    switch (activeNav) {
      case "Dashboard": return <DashboardView />;
      case "Sales": return <SalesView />;
      case "Expenses": return <ExpensesView />;
      case "Investments": return <InvestmentsView />;
      case "Loans": return <LoansView />;
      case "Menu Management": return <MenuManagementPage />;
      case "Settings": return <SettingsView />;
      case "Reports": return <ReportsView />;
      default: return <SettingsView />;
    }
  }


  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "var(--background)" }}
    >
      <style>{`
        .input-field {
          width: 100%;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          outline: none;
          transition: box-shadow 0.15s;
        }
        .input-field:focus { box-shadow: 0 0 0 3px ${GREEN}22; }
        /* Hide spinner arrows on number inputs */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* AI chat overlay backdrop on mobile */}
      {aiOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden" onClick={() => setAiOpen(false)} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-56
        bg-card border-r border-border shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 select-none" style={{ background: GREEN_LIGHT }}>
            🍹
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm tracking-tight text-foreground">Rasa Bar</p>
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>Cafe Management</p>
          </div>
          <button className="ml-auto lg:hidden shrink-0" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={17} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, icon: Icon }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => { setActiveNav(label); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive ? "text-white shadow-sm" : "text-foreground/60 hover:text-foreground hover:bg-muted"}`}
                style={isActive ? { background: GREEN } : {}}
                aria-label={label} // Added for accessibility
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="truncate">{label}</span>
                {isActive && <ChevronRight size={13} className="ml-auto shrink-0 opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: GREEN, color: "white" }}>
              RB
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Admin</p>
              <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>admin@rasabar.in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-5 py-3.5 bg-card border-b border-border shrink-0">
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu size={20} style={{ color: "var(--muted-foreground)" }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{activeNav}</p>
            <p className="text-xs hidden sm:block" style={{ color: "var(--muted-foreground)" }}>{today()}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: GREEN_LIGHT, color: GREEN_TEXT }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
            Live
          </div>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors" aria-label="Notifications">
            <Bell size={17} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 md:px-8 py-7 pb-28">
          {renderContent()}
        </main>
      </div>

      {/* ── AI Panel ─────────────────────────────────────────────────────── */}
      {aiOpen && <AIChatPanel onClose={() => setAiOpen(false)} />}

      {/* ── Floating Button ───────────────────────────────────────────────── */}
      {!aiOpen && <FloatingAIButton onClick={() => setAiOpen(true)} />}
    </div>
  );
}