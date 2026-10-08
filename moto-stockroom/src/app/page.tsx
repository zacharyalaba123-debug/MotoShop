"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Minus,
  Package,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  TriangleAlert,
  X,
} from "lucide-react";

type Part = {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  wholesale: number;
  retail: number;
  soldToday: number;
};

type Sale = {
  id: number;
  partName: string;
  sku: string;
  quantity: number;
  total: number;
  time: string;
};

type StockFilter = "All parts" | "In stock" | "Low stock" | "Out of stock";

const initialParts: Part[] = [
  { id: 1, sku: "6301 M", name: "6301 M Bearing", category: "Bearings", stock: 10, wholesale: 89, retail: 109, soldToday: 0 },
  { id: 2, sku: "6300 M", name: "6300 M Bearing", category: "Bearings", stock: 10, wholesale: 87, retail: 107, soldToday: 0 },
  { id: 3, sku: "6201 M", name: "6201 M Bearing", category: "Bearings", stock: 10, wholesale: 20, retail: 45, soldToday: 0 },
  { id: 4, sku: "SW-ONOFF", name: "On / Off Switch", category: "Electrical", stock: 10, wholesale: 12, retail: 25, soldToday: 0 },
  { id: 5, sku: "SW-RSB", name: "Right Side Switch Break", category: "Electrical", stock: 15, wholesale: 10, retail: 25, soldToday: 0 },
  { id: 6, sku: "SPR-R", name: "Spring R", category: "Engine", stock: 10, wholesale: 10, retail: 22, soldToday: 0 },
  { id: 7, sku: "DV-01", name: "D Vault", category: "Engine", stock: 89, wholesale: 10, retail: 23, soldToday: 0 },
  { id: 8, sku: "FCL-XRM", name: "Fork Clip XRM", category: "Suspension", stock: 10, wholesale: 10, retail: 25, soldToday: 0 },
  { id: 9, sku: "CPR-SEA9", name: "CPR SEA-9 Spark Plug", category: "Electrical", stock: 7, wholesale: 115, retail: 150, soldToday: 3 },
  { id: 10, sku: "C7HSA", name: "C7HSA Spark Plug", category: "Electrical", stock: 7, wholesale: 92, retail: 145, soldToday: 3 },
  { id: 11, sku: "MIO-PUL-25", name: "Mio Pulley 25-35", category: "Transmission", stock: 10, wholesale: 60, retail: 90, soldToday: 0 },
  { id: 12, sku: "AERO-OS", name: "Aerox Oil Seal", category: "Engine", stock: 2, wholesale: 60, retail: 90, soldToday: 0 },
  { id: 13, sku: "HBP-DRIVE", name: "Honda Beat Pulley Drive", category: "Transmission", stock: 2, wholesale: 60, retail: 115, soldToday: 0 },
  { id: 14, sku: "HBP-SEAL", name: "Honda Beat Torque Drive Oil Seal", category: "Transmission", stock: 4, wholesale: 60, retail: 120, soldToday: 0 },
  { id: 15, sku: "SLD-NMAX", name: "Slider NMAX", category: "Transmission", stock: 5, wholesale: 75, retail: 185, soldToday: 0 },
];

const initialSales: Sale[] = [
  { id: 1, partName: "CPR SEA-9 Spark Plug", sku: "CPR-SEA9", quantity: 3, total: 450, time: "10:42 AM" },
  { id: 2, partName: "C7HSA Spark Plug", sku: "C7HSA", quantity: 3, total: 435, time: "9:18 AM" },
];

const filters: StockFilter[] = ["All parts", "In stock", "Low stock", "Out of stock"];
const partCategories = ["Bearings", "Electrical", "Engine", "Suspension", "Transmission", "Other"];
const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function stockLabel(stock: number) {
  if (stock === 0) return "Out of stock";
  if (stock <= 5) return "Low stock";
  return "In stock";
}

export default function Home() {
  const [parts, setParts] = useState(initialParts);
  const [sales, setSales] = useState(initialSales);
  const [activeView, setActiveView] = useState<"inventory" | "sales">("inventory");
  const [stockFilter, setStockFilter] = useState<StockFilter>("All parts");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"sale" | "part" | null>(null);
  const [selectedPartId, setSelectedPartId] = useState(initialParts[0].id);
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [partName, setPartName] = useState("");
  const [partSku, setPartSku] = useState("");
  const [partCategory, setPartCategory] = useState("Other");
  const [partStock, setPartStock] = useState("0");
  const [partWholesale, setPartWholesale] = useState("0");
  const [partRetail, setPartRetail] = useState("0");

  const selectedPart = parts.find((part) => part.id === selectedPartId);
  const totalUnits = parts.reduce((sum, part) => sum + part.stock, 0);
  const lowStockCount = parts.filter((part) => part.stock > 0 && part.stock <= 5).length;
  const inventoryValue = parts.reduce((sum, part) => sum + part.stock * part.retail, 0);
  const todaySales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todayUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const filteredParts = parts.filter((part) => {
    const matchesQuery = `${part.name} ${part.sku} ${part.category}`.toLowerCase().includes(query.toLowerCase());
    const status = stockLabel(part.stock);
    const matchesFilter = stockFilter === "All parts" || status === stockFilter;
    const matchesCategory = categoryFilter === "All categories" || part.category === categoryFilter;
    return matchesQuery && matchesFilter && matchesCategory;
  });
  const filteredSales = sales.filter((sale) => `${sale.partName} ${sale.sku}`.toLowerCase().includes(query.toLowerCase()));

  function recordSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPart || saleQuantity < 1 || saleQuantity > selectedPart.stock) return;

    const now = new Date();
    const newSale: Sale = {
      id: Date.now(),
      partName: selectedPart.name,
      sku: selectedPart.sku,
      quantity: saleQuantity,
      total: saleQuantity * selectedPart.retail,
      time: now.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }),
    };

    setParts((current) => current.map((part) =>
      part.id === selectedPart.id
        ? { ...part, stock: part.stock - saleQuantity, soldToday: part.soldToday + saleQuantity }
        : part,
    ));
    setSales((current) => [newSale, ...current]);
    setDialog(null);
    setSaleQuantity(1);
  }

  function addPart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newPart: Part = {
      id: Date.now(),
      sku: partSku.trim(),
      name: partName.trim(),
      category: partCategory,
      stock: Math.max(0, Number(partStock)),
      wholesale: Math.max(0, Number(partWholesale)),
      retail: Math.max(0, Number(partRetail)),
      soldToday: 0,
    };
    setParts((current) => [newPart, ...current]);
    setStockFilter("All parts");
    setCategoryFilter("All categories");
    setQuery("");
    setPartName("");
    setPartSku("");
    setPartCategory("Other");
    setPartStock("0");
    setPartWholesale("0");
    setPartRetail("0");
    setDialog(null);
    setActiveView("inventory");
  }

  function openSale(part?: Part) {
    const firstAvailable = parts.find((item) => item.stock > 0);
    setSelectedPartId(part?.id ?? firstAvailable?.id ?? parts[0]?.id ?? 0);
    setSaleQuantity(1);
    setDialog("sale");
  }

  async function exportWorkbook() {
    const { default: writeExcelFile } = await import("write-excel-file/browser");
    const inventoryRows = [
      ["SKU", "Item Name", "Category", "Stock Quantity", "Stock Status", "Wholesale Price (PHP)", "Retail Price (PHP)", "Units Sold Today"],
      ...parts.map((part) => [
        part.sku,
        part.name,
        part.category,
        part.stock,
        stockLabel(part.stock),
        part.wholesale,
        part.retail,
        part.soldToday,
      ]),
    ];
    const salesRows = [
      ["Item Name", "SKU", "Quantity", "Total (PHP)", "Time"],
      ...sales.map((sale) => [sale.partName, sale.sku, sale.quantity, sale.total, sale.time]),
    ];

    await writeExcelFile([
      { data: inventoryRows, sheet: "Inventory" },
      { data: salesRows, sheet: "Sales" },
    ]).toFile(`MotoStock-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inventory" onClick={() => setActiveView("inventory")}>
          <span className="brand-mark"><Package size={22} strokeWidth={2.2} /></span>
          <span className="brand-copy"><strong>MOTO<span>STOCK</span></strong><small>PARTS &amp; SUPPLY</small></span>
        </a>

        <div className="shop-switcher">
          <span className="shop-avatar">M</span>
          <span className="shop-copy"><strong>Moto Shop</strong><small>Shop workspace</small></span>
          <ChevronDown size={16} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={`nav-link ${activeView === "inventory" ? "active" : ""}`} onClick={() => setActiveView("inventory")}>
            <Boxes size={19} /><span>Inventory</span><span className="nav-count">{parts.length}</span>
          </button>
          <button className={`nav-link ${activeView === "sales" ? "active" : ""}`} onClick={() => setActiveView("sales")}>
            <ReceiptText size={19} /><span>Sales</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="stock-note">
            <span className="note-icon"><TriangleAlert size={17} /></span>
            <div><strong>{lowStockCount} parts running low</strong><small>Worth a quick restock check.</small></div>
            <button className="note-arrow" aria-label="Show low stock parts" onClick={() => { setActiveView("inventory"); setStockFilter("Low stock"); setCategoryFilter("All categories"); }}><ArrowUpRight size={16} /></button>
          </div>
          <div className="user-profile">
            <span className="profile-avatar">KS</span>
            <span className="profile-copy"><strong>Shop manager</strong><small>Owner access</small></span>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><Package size={20} /></span><strong>MOTOSTOCK</strong></div>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeView === "inventory" ? "Inventory" : "Sales"}</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search parts or SKU" aria-label="Search parts or SKU" />
            </label>
            <span className="today-date"><span className="date-dot" />Today</span>
            <button className="button button-primary add-button" onClick={() => setDialog("part")} aria-label="Add part" title="Add part"><Plus size={18} /><span>Add part</span></button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">FRIDAY, OCTOBER 9</p>
              <h1>{activeView === "inventory" ? "Inventory" : "Sales"}<span className="heading-period">.</span></h1>
              <p className="welcome-caption">Your shop floor, at a glance.</p>
            </div>
            <button className="button button-dark sale-button" onClick={() => openSale()}><ShoppingBag size={18} /><span>Record a sale</span></button>
          </section>

          <section className="metric-grid" aria-label="Shop summary">
            <article className="metric-card metric-featured">
              <div className="metric-top"><span className="metric-icon"><CircleDollarSign size={19} /></span><span className="metric-kicker">TODAY</span><span className="metric-trend"><ArrowUpRight size={15} /> LIVE</span></div>
              <p className="metric-label">Sales recorded</p>
              <strong className="metric-value">{currency.format(todaySales)}</strong>
              <span className="metric-foot">{todayUnits} parts sold today</span>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon icon-mint"><Boxes size={19} /></span><span className="metric-kicker">ON HAND</span></div>
              <p className="metric-label">Units in stock</p>
              <strong className="metric-value">{totalUnits.toLocaleString()}</strong>
              <span className="metric-foot">Across {parts.length} parts</span>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon icon-amber"><TriangleAlert size={19} /></span><span className="metric-kicker">NEEDS A LOOK</span></div>
              <p className="metric-label">Low stock</p>
              <strong className="metric-value">{lowStockCount}<span className="metric-unit"> parts</span></strong>
              <button className="metric-link" onClick={() => { setActiveView("inventory"); setStockFilter("Low stock"); setCategoryFilter("All categories"); }}>Review items <ArrowUpRight size={14} /></button>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span className="metric-icon icon-coral"><Package size={19} /></span><span className="metric-kicker">RETAIL VALUE</span></div>
              <p className="metric-label">Inventory value</p>
              <strong className="metric-value metric-value-small">{currency.format(inventoryValue)}</strong>
              <span className="metric-foot">At current retail prices</span>
            </article>
          </section>

          {activeView === "inventory" ? (
            <section className="workspace-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">PARTS CATALOG</p><h2>Stockroom <span className="part-count">{filteredParts.length}</span></h2></div>
                <div className="panel-tools">
                  <button className="button button-outline tool-button" onClick={() => { setStockFilter("All parts"); setCategoryFilter("All categories"); setQuery(""); }}><SlidersHorizontal size={17} /><span>Reset</span></button>
                  <button className="button button-outline tool-button export-button" onClick={() => { void exportWorkbook(); }} aria-label="Export to Excel" title="Export to Excel"><Download size={17} /><span>Export to Excel</span></button>
                </div>
              </div>

              <div className="filter-row" role="tablist" aria-label="Filter parts by stock status">
                {filters.map((filter) => {
                  const count = filter === "All parts" ? parts.length : parts.filter((part) => stockLabel(part.stock) === filter).length;
                  return <button key={filter} role="tab" aria-selected={stockFilter === filter} className={`filter-tab ${stockFilter === filter ? "selected" : ""}`} onClick={() => setStockFilter(filter)}>{filter}<span>{count}</span></button>;
                })}
              </div>

              <div className="category-row" role="group" aria-label="Filter parts by category">
                <span className="category-filter-label"><Boxes size={14} />Category</span>
                <button className={`category-chip ${categoryFilter === "All categories" ? "selected" : ""}`} aria-pressed={categoryFilter === "All categories"} onClick={() => setCategoryFilter("All categories")}>All categories<span>{parts.length}</span></button>
                {partCategories.map((category) => {
                  const count = parts.filter((part) => part.category === category).length;
                  return <button key={category} className={`category-chip ${categoryFilter === category ? "selected" : ""}`} aria-pressed={categoryFilter === category} onClick={() => setCategoryFilter(category)}>{category}<span>{count}</span></button>;
                })}
              </div>

              <div className="table-wrap">
                <table className="parts-table">
                  <thead><tr><th>PART</th><th>CATEGORY</th><th>WHOLESALE</th><th>RETAIL</th><th>IN STOCK</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{filteredParts.map((part) => (
                    <tr key={part.id}>
                      <td><div className="part-cell"><span className="part-icon"><Package size={18} /></span><span className="part-info"><strong>{part.name}</strong><small>{part.sku}</small></span></div></td>
                      <td><span className="category-label">{part.category}</span></td>
                      <td className="price-cell">{currency.format(part.wholesale)}</td>
                      <td className="price-cell">{currency.format(part.retail)}</td>
                      <td><strong className="stock-number">{part.stock}<small> units</small></strong></td>
                      <td><span className={`status-pill ${part.stock === 0 ? "status-empty" : part.stock <= 5 ? "status-low" : "status-ok"}`}><span />{stockLabel(part.stock)}</span></td>
                      <td><button className="row-action" onClick={() => openSale(part)} disabled={part.stock === 0} aria-label={`Record sale for ${part.name}`} title="Record sale"><Plus size={18} /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="part-cards">
                {filteredParts.map((part) => (
                  <article className="part-card" key={part.id}>
                    <div className="part-card-main"><span className="part-icon"><Package size={19} /></span><div className="part-info"><strong>{part.name}</strong><small>{part.sku} <span className="mobile-category">· {part.category}</span></small></div><button className="row-action" onClick={() => openSale(part)} disabled={part.stock === 0} aria-label={`Record sale for ${part.name}`} title="Record sale"><Plus size={18} /></button></div>
                    <div className="part-card-bottom"><span className={`status-pill ${part.stock === 0 ? "status-empty" : part.stock <= 5 ? "status-low" : "status-ok"}`}><span />{stockLabel(part.stock)}</span><strong>{part.stock}<small> in stock</small></strong><span className="mobile-price">{currency.format(part.retail)}</span></div>
                  </article>
                ))}
              </div>

              {filteredParts.length === 0 && <div className="empty-state"><span className="empty-icon"><Search size={21} /></span><strong>No parts found</strong><span>Try another search, category, or stock filter.</span></div>}
              <div className="panel-footer"><span>Showing <strong>{filteredParts.length}</strong> of <strong>{parts.length}</strong> parts</span><span className="footer-live"><span /> Stock updates instantly</span></div>
            </section>
          ) : (
            <section className="workspace-panel sales-panel">
              <div className="panel-heading"><div><p className="eyebrow">DAILY ACTIVITY</p><h2>Recent sales <span className="part-count">{filteredSales.length}</span></h2></div><button className="button button-dark" onClick={() => openSale()}><Plus size={17} /><span>Record a sale</span></button></div>
              <div className="sales-list">
                {filteredSales.map((sale) => <article className="sale-row" key={sale.id}><span className="sale-icon"><ShoppingBag size={19} /></span><div className="sale-name"><strong>{sale.partName}</strong><small>{sale.sku} <span>·</span> {sale.quantity} units</small></div><span className="sale-time"><Clock3 size={15} />{sale.time}</span><strong className="sale-total">{currency.format(sale.total)}</strong><span className="sale-status"><Check size={14} /> Complete</span></article>)}
                {filteredSales.length === 0 && <div className="empty-state"><span className="empty-icon"><ReceiptText size={21} /></span><strong>No sales found</strong><span>Sales you record will show up here.</span></div>}
              </div>
              <div className="panel-footer"><span><strong>{todayUnits}</strong> units moved today</span><span className="footer-live"><span /> Updated as you sell</span></div>
            </section>
          )}

          <footer className="page-footer"><span>MotoStock <span>·</span> Shop workspace</span><span>Inventory is stored on this device for now</span></footer>
        </div>
      </main>

      {dialog === "sale" && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="sale-title">
        <div className="modal-heading"><div><span className="modal-icon"><ShoppingBag size={19} /></span><div><p className="eyebrow">CHECKOUT</p><h2 id="sale-title">Record a sale</h2></div></div><button className="close-button" onClick={() => setDialog(null)} aria-label="Close dialog"><X size={20} /></button></div>
        <form onSubmit={recordSale}>
          <label className="form-field"><span>Part</span><select value={selectedPartId} onChange={(event) => { setSelectedPartId(Number(event.target.value)); setSaleQuantity(1); }} required>{parts.filter((part) => part.stock > 0).map((part) => <option key={part.id} value={part.id}>{part.name} · {part.stock} available</option>)}</select><ChevronDown size={17} /></label>
          <div className="sale-quantity-row"><div><span className="field-label">Quantity</span><span className="available-note">{selectedPart?.stock ?? 0} available</span></div><div className="quantity-stepper"><button type="button" onClick={() => setSaleQuantity((quantity) => Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={17} /></button><input type="number" min="1" max={selectedPart?.stock ?? 1} value={saleQuantity} onChange={(event) => setSaleQuantity(Number(event.target.value))} aria-label="Sale quantity" /><button type="button" onClick={() => setSaleQuantity((quantity) => Math.min(selectedPart?.stock ?? 1, quantity + 1))} disabled={!selectedPart || saleQuantity >= selectedPart.stock} aria-label="Increase quantity"><Plus size={17} /></button></div></div>
          <div className="sale-total-box"><span>Sale total</span><strong>{currency.format((selectedPart?.retail ?? 0) * saleQuantity)}</strong></div>
          <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="button button-dark" disabled={!selectedPart || saleQuantity < 1 || saleQuantity > selectedPart.stock}><Check size={17} />Complete sale</button></div>
        </form>
      </section></div>}

      {dialog === "part" && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="part-title">
        <div className="modal-heading"><div><span className="modal-icon modal-icon-green"><Package size={19} /></span><div><p className="eyebrow">PARTS CATALOG</p><h2 id="part-title">Add a part</h2></div></div><button className="close-button" onClick={() => setDialog(null)} aria-label="Close dialog"><X size={20} /></button></div>
        <form onSubmit={addPart}>
          <label className="form-field"><span>Part name</span><input value={partName} onChange={(event) => setPartName(event.target.value)} placeholder="e.g. Brake lever" required /></label>
          <label className="form-field"><span>SKU / item code</span><input value={partSku} onChange={(event) => setPartSku(event.target.value)} placeholder="e.g. BRK-001" required /></label>
          <label className="form-field"><span>Category</span><select value={partCategory} onChange={(event) => setPartCategory(event.target.value)} required>{partCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select><ChevronDown size={17} /></label>
          <label className="form-field"><span>Opening stock</span><input type="number" min="0" value={partStock} onChange={(event) => setPartStock(event.target.value)} required /></label>
          <div className="form-columns"><label className="form-field"><span>Wholesale price</span><input type="number" min="0" step="0.01" value={partWholesale} onChange={(event) => setPartWholesale(event.target.value)} required /></label><label className="form-field"><span>Retail price</span><input type="number" min="0" step="0.01" value={partRetail} onChange={(event) => setPartRetail(event.target.value)} required /></label></div>
          <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="button button-dark"><Plus size={17} />Add to inventory</button></div>
        </form>
      </section></div>}
    </div>
  );
}