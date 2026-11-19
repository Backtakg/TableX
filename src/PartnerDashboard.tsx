import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown,
  CirclePause, CirclePlay, Clock3, IndianRupee, LayoutDashboard, LogOut,
  Plus, Search, Settings2, SlidersHorizontal, Table2, TrendingUp, Users,
  Utensils, X
} from "lucide-react";

type Listing = {
  id: string;
  label: string;
  seats: number;
  date: string;
  start: string;
  end: string;
  price: number;
  originalPrice: number;
  status: "Live" | "Paused";
};

type Booking = {
  id: string;
  guest: string;
  initials: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
};

const today = new Date().toISOString().slice(0, 10);
const initialListings: Listing[] = [
  { id: "TX-104", label: "Window table", seats: 2, date: today, start: "18:30", end: "20:00", price: 1250, originalPrice: 1500, status: "Live" },
  { id: "TX-105", label: "Garden table", seats: 4, date: today, start: "19:00", end: "20:30", price: 2200, originalPrice: 2500, status: "Live" },
  { id: "TX-106", label: "Family booth", seats: 6, date: today, start: "20:00", end: "21:30", price: 3600, originalPrice: 3600, status: "Paused" },
];

const initialBookings: Booking[] = [
  { id: "BK-2081", guest: "Aarav Sharma", initials: "AS", date: today, time: "18:30", guests: 2, table: "Window table", amount: 1250, status: "Pending" },
  { id: "BK-2079", guest: "Saanvi Thapa", initials: "ST", date: today, time: "19:00", guests: 4, table: "Garden table", amount: 2200, status: "Confirmed" },
  { id: "BK-2074", guest: "Rohan Gurung", initials: "RG", date: today, time: "20:00", guests: 3, table: "Family booth", amount: 3600, status: "Completed" },
];

function readStored<T,>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function formatMoney(value: number) {
  return "Rs. " + value.toLocaleString("en-IN");
}

export default function PartnerDashboard() {
  const [listings, setListings] = useState<Listing[]>(() => readStored("tablex-owner-listings", initialListings));
  const [bookings, setBookings] = useState<Booking[]>(() => readStored("tablex-owner-bookings", initialBookings));
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "bookings">("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [newLabel, setNewLabel] = useState("Window table");
  const [newSeats, setNewSeats] = useState("2");
  const [newDate, setNewDate] = useState(today);
  const [newStart, setNewStart] = useState("19:00");
  const [newEnd, setNewEnd] = useState("20:30");
  const [newPrice, setNewPrice] = useState("1500");
  const [newOriginal, setNewOriginal] = useState("1800");

  useEffect(() => localStorage.setItem("tablex-owner-listings", JSON.stringify(listings)), [listings]);
  useEffect(() => localStorage.setItem("tablex-owner-bookings", JSON.stringify(bookings)), [bookings]);

  const liveCount = listings.filter((item) => item.status === "Live").length;
  const pendingCount = bookings.filter((item) => item.status === "Pending").length;
  const confirmedCount = bookings.filter((item) => item.status === "Confirmed").length;
  const revenue = bookings.filter((item) => item.status === "Completed").reduce((sum, item) => sum + item.amount, 0);
  const filteredBookings = useMemo(() => bookings.filter((booking) =>
    [booking.guest, booking.id, booking.table].some((value) => value.toLowerCase().includes(query.toLowerCase()))
  ), [bookings, query]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const addListing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newEnd <= newStart) {
      flash("End time must be after the start time.");
      return;
    }
    const price = Number(newPrice);
    const originalPrice = Number(newOriginal);
    if (!price || price < 1 || originalPrice < price) {
      flash("Enter a valid price. Original price must be at least the booking price.");
      return;
    }
    const listing: Listing = {
      id: "TX-" + Math.floor(1000 + Math.random() * 9000),
      label: newLabel.trim() || "Available table",
      seats: Number(newSeats),
      date: newDate,
      start: newStart,
      end: newEnd,
      price,
      originalPrice,
      status: "Live",
    };
    setListings((current) => [listing, ...current]);
    setShowAdd(false);
    setActiveTab("inventory");
    flash("Your table is now published in this demo.");
  };

  const toggleListing = (id: string) => {
    setListings((current) => current.map((item) => item.id === id
      ? { ...item, status: item.status === "Live" ? "Paused" : "Live" }
      : item));
    flash("Table availability updated.");
  };

  const removeListing = (id: string) => {
    setListings((current) => current.filter((item) => item.id !== id));
    flash("Listing removed.");
  };

  const updateBooking = (id: string, status: Booking["status"]) => {
    setBookings((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    flash("Booking " + status.toLowerCase() + ".");
  };

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "inventory" as const, label: "Table inventory", icon: Table2 },
    { id: "bookings" as const, label: "Reservations", icon: CalendarDays },
  ];

  return (
    <main className="owner-shell">
      <aside className="owner-sidebar">
        <div className="owner-brand"><span className="owner-brand-mark"><Utensils size={18} /></span><span>TABLE<span>X</span><small>PARTNER PORTAL</small></span></div>
        <div className="owner-restaurant-switch"><span className="owner-avatar">GH</span><span><strong>The Greenhouse</strong><small>Bharatpur, Nepal</small></span><ChevronDown size={15} /></div>
        <div className="owner-nav-label">WORKSPACE</div>
        <nav className="owner-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={activeTab === item.id ? "owner-nav-item active" : "owner-nav-item"} onClick={() => setActiveTab(item.id)}><Icon size={17} />{item.label}{item.id === "bookings" && pendingCount > 0 && <span className="owner-nav-count">{pendingCount}</span>}</button>;
          })}
        </nav>
        <div className="owner-sidebar-bottom"><div className="owner-help-card"><span className="owner-help-icon"><Bell size={16} /></span><strong>Need a hand?</strong><p>Our partner team is here to help you get more covers.</p><button onClick={() => flash("Partner support contact: hello@tablex.com (demo).")}>Contact support <ArrowUpRight size={13} /></button></div><div className="owner-profile"><span className="owner-avatar owner-avatar-small">RK</span><span><strong>Restaurant owner</strong><small>Partner account · Demo</small></span><Settings2 size={16} /></div></div>
      </aside>

      <section className="owner-main">
        <header className="owner-topbar"><div><span className="owner-breadcrumb">Partner workspace</span><span className="owner-breadcrumb-sep">/</span><strong>{navItems.find((item) => item.id === activeTab)?.label}</strong></div><div className="owner-top-actions"><span className="owner-demo-pill"><span /> DEMO ACCOUNT</span><button className="owner-icon-button" aria-label="Notifications" onClick={() => setActiveTab("bookings")}><Bell size={17} />{pendingCount > 0 && <i />}</button><button className="owner-view-site" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Partner portal <ArrowUpRight size={14} /></button></div></header>

        {activeTab === "overview" && <>
          <div className="owner-welcome"><div><div className="owner-eyebrow">THURSDAY, {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase()}</div><h1>Good afternoon, <em>there.</em></h1><p>Here’s what’s happening at The Greenhouse today.</p></div><button className="owner-primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Publish a table</button></div>
          <div className="owner-stats">
            <article className="owner-stat-card"><span className="owner-stat-icon green"><Table2 size={18} /></span><span className="owner-stat-label">Live table listings</span><strong>{liveCount.toString().padStart(2, "0")}</strong><small><span className="owner-stat-positive"><ArrowUpRight size={12} /> Available to diners</span></small></article>
            <article className="owner-stat-card"><span className="owner-stat-icon amber"><CalendarDays size={18} /></span><span className="owner-stat-label">Pending requests</span><strong>{pendingCount.toString().padStart(2, "0")}</strong><small>Needs your attention</small></article>
            <article className="owner-stat-card"><span className="owner-stat-icon blue"><Check size={18} /></span><span className="owner-stat-label">Confirmed bookings</span><strong>{confirmedCount.toString().padStart(2, "0")}</strong><small>Upcoming reservations</small></article>
            <article className="owner-stat-card"><span className="owner-stat-icon violet"><TrendingUp size={18} /></span><span className="owner-stat-label">Completed booking value</span><strong>{formatMoney(revenue)}</strong><small>Demo booking totals</small></article>
          </div>
          <div className="owner-content-grid"><section className="owner-panel owner-inventory-panel"><div className="owner-panel-heading"><div><h2>Table inventory</h2><p>Manage the tables currently visible to diners.</p></div><button className="owner-text-button" onClick={() => setActiveTab("inventory")}>View all <ArrowUpRight size={14} /></button></div>
            <div className="owner-table-list">{listings.slice(0, 3).map((item) => <div className="owner-listing-row" key={item.id}><span className="owner-table-icon"><Table2 size={17} /></span><span className="owner-listing-info"><strong>{item.label}</strong><small>{item.seats} seats · {item.start}–{item.end}</small></span><span className={item.status === "Live" ? "owner-status live" : "owner-status paused"}>{item.status}</span><strong className="owner-listing-price">{formatMoney(item.price)}</strong></div>)}{listings.length === 0 && <div className="owner-empty">No tables published yet. Add your first available table.</div>}</div>
          </section><section className="owner-panel owner-requests-panel"><div className="owner-panel-heading"><div><h2>Latest requests</h2><p>Review customer reservation requests.</p></div><button className="owner-text-button" onClick={() => setActiveTab("bookings")}>All requests <ArrowUpRight size={14} /></button></div>
            {bookings.slice(0, 3).map((booking) => <div className="owner-request-row" key={booking.id}><span className="owner-guest-avatar">{booking.initials}</span><span className="owner-request-info"><strong>{booking.guest}</strong><small>{booking.time} · {booking.guests} guests</small></span><span className={"owner-status " + booking.status.toLowerCase()}>{booking.status}</span></div>)}{bookings.length === 0 && <div className="owner-empty">New requests will appear here.</div>}
          </section></div>
          <div className="owner-tip"><span><TrendingUp size={18} /></span><div><strong>Make quiet hours work harder.</strong><p>Publish a few tables for your slower time slots. Diners nearby can discover and reserve them through TABLEX.</p></div><button onClick={() => setShowAdd(true)}>Add availability <ArrowUpRight size={14} /></button></div>
        </>}

        {activeTab === "inventory" && <><div className="owner-welcome"><div><div className="owner-eyebrow">YOUR AVAILABLE SEATING</div><h1>Table <em>inventory.</em></h1><p>Publish specific tables and time windows for diners to reserve.</p></div><button className="owner-primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add available table</button></div><section className="owner-panel owner-full-panel"><div className="owner-panel-heading"><div><h2>Published tables <span className="owner-heading-count">{listings.length}</span></h2><p>Pause a listing whenever the table is no longer available.</p></div><span className="owner-demo-note">Changes save in this browser</span></div><div className="owner-inventory-table"><div className="owner-table-head"><span>TABLE</span><span>DATE & TIME</span><span>SEATS</span><span>PRICE</span><span>STATUS</span><span>ACTIONS</span></div>{listings.map((item) => <div className="owner-table-line" key={item.id}><span><strong>{item.label}</strong><small>{item.id}</small></span><span><strong>{item.date === today ? "Today" : item.date}</strong><small>{item.start} – {item.end}</small></span><span>{item.seats} guests</span><span><strong>{formatMoney(item.price)}</strong>{item.originalPrice > item.price && <small className="owner-discount-copy">{Math.round((1 - item.price / item.originalPrice) * 100)}% below regular</small>}</span><span><span className={item.status === "Live" ? "owner-status live" : "owner-status paused"}>{item.status}</span></span><span className="owner-row-actions"><button aria-label={item.status === "Live" ? "Pause listing" : "Publish listing"} onClick={() => toggleListing(item.id)}>{item.status === "Live" ? <CirclePause size={17} /> : <CirclePlay size={17} />}</button><button aria-label="Remove listing" onClick={() => removeListing(item.id)}><X size={17} /></button></span></div>)}{listings.length === 0 && <div className="owner-empty">No listings yet. Add your first table to get started.</div>}</div></section></>}

        {activeTab === "bookings" && <><div className="owner-welcome"><div><div className="owner-eyebrow">DINER ACTIVITY</div><h1>Reservation <em>requests.</em></h1><p>Confirm or decline requests from customers.</p></div><div className="owner-booking-summary"><strong>{pendingCount}</strong><span>waiting for review</span></div></div><section className="owner-panel owner-full-panel"><div className="owner-panel-heading"><div><h2>All reservations <span className="owner-heading-count">{bookings.length}</span></h2><p>Demo requests are stored locally in this browser.</p></div><label className="owner-booking-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guest or booking" /></label></div><div className="owner-inventory-table"><div className="owner-booking-head"><span>GUEST</span><span>DATE & TIME</span><span>PARTY</span><span>TABLE</span><span>VALUE</span><span>STATUS / ACTION</span></div>{filteredBookings.map((booking) => <div className="owner-booking-line" key={booking.id}><span className="owner-booking-guest"><span className="owner-guest-avatar">{booking.initials}</span><span><strong>{booking.guest}</strong><small>{booking.id}</small></span></span><span><strong>{booking.date === today ? "Today" : booking.date}</strong><small>{booking.time}</small></span><span>{booking.guests} guests</span><span>{booking.table}</span><span><strong>{formatMoney(booking.amount)}</strong></span><span className="owner-booking-actions">{booking.status === "Pending" ? <><button className="owner-confirm-button" onClick={() => updateBooking(booking.id, "Confirmed")}><Check size={13} /> Confirm</button><button className="owner-decline-button" onClick={() => updateBooking(booking.id, "Cancelled")}>Decline</button></> : <span className={"owner-status " + booking.status.toLowerCase()}>{booking.status}</span>}</span></div>)}{filteredBookings.length === 0 && <div className="owner-empty">No matching reservations.</div>}</div></section></>}
      </section>

      <AnimatePresence>{showAdd && <motion.div className="owner-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}><motion.form className="owner-add-modal" onSubmit={addListing} initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} onClick={(event) => event.stopPropagation()}><div className="owner-modal-heading"><div><span className="owner-eyebrow">NEW INVENTORY</span><h2>Publish an available table</h2><p>Only this table and time window will be listed for diners.</p></div><button type="button" className="owner-modal-close" onClick={() => setShowAdd(false)}><X size={19} /></button></div><label>TABLE LABEL<input required value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="e.g. Garden table" /></label><div className="owner-form-grid"><label>SEATS<select value={newSeats} onChange={(event) => setNewSeats(event.target.value)}><option value="1">1 seat</option><option value="2">2 seats</option><option value="4">4 seats</option><option value="6">6 seats</option><option value="8">8 seats</option></select></label><label>AVAILABLE DATE<input required type="date" min={today} value={newDate} onChange={(event) => setNewDate(event.target.value)} /></label><label>START TIME<input required type="time" value={newStart} onChange={(event) => setNewStart(event.target.value)} /></label><label>END TIME<input required type="time" value={newEnd} onChange={(event) => setNewEnd(event.target.value)} /></label><label>BOOKING PRICE (NPR)<input required type="number" min="1" value={newPrice} onChange={(event) => setNewPrice(event.target.value)} /></label><label>REGULAR PRICE (NPR)<input required type="number" min="1" value={newOriginal} onChange={(event) => setNewOriginal(event.target.value)} /></label></div><div className="owner-modal-hint"><IndianRupee size={15} /> Customers will see your booking price before sending a reservation request.</div><button className="owner-primary-button owner-publish-button" type="submit"><Plus size={16} /> Publish table listing</button><small className="owner-modal-disclaimer">Prototype only · This listing is saved to this browser, not sent to a live marketplace.</small></motion.form></motion.div>}</AnimatePresence>
      {notice && <motion.div className="owner-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Check size={16} />{notice}</motion.div>}
    </main>
  );
}
