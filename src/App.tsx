import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import PartnerDashboard from "./PartnerDashboard";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown,
  Clock3, Flame, Heart, MapPin, Minus, Plus, Search, SlidersHorizontal,
  Sparkles, Star, Utensils, Users, X, Zap
} from "lucide-react";

type Restaurant = {
  id: number; name: string; area: string; cuisine: string; rating: string;
  reviews: string; price: number; originalPrice: number; discount: number;
  available: number; nextSlot: string; image: string; tag: string; featured?: boolean; offerId?: string; seats?: number; serviceDate?: string; startTime?: string; endTime?: string;
};

const restaurants: Restaurant[] = [
  { id: 1, name: "The Greenhouse", area: "Bharatpur-10", cuisine: "Continental · Cafe", rating: "4.8", reviews: "214", price: 1250, originalPrice: 1600, discount: 22, available: 4, nextSlot: "6:30 PM", tag: "Garden dining", featured: true, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=85" },
  { id: 2, name: "Mitho Courtyard", area: "Bharatpur-12", cuisine: "Nepali · Thakali", rating: "4.7", reviews: "186", price: 890, originalPrice: 1100, discount: 19, available: 3, nextSlot: "7:00 PM", tag: "Local favourite", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=85" },
  { id: 3, name: "Olive & Ember", area: "Bharatpur-3", cuisine: "Italian · Pizza", rating: "4.9", reviews: "302", price: 1450, originalPrice: 1900, discount: 24, available: 2, nextSlot: "7:15 PM", tag: "Date night", featured: true, image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1000&q=85" },
  { id: 4, name: "Saffron Social", area: "Narayangarh", cuisine: "Indian · Asian", rating: "4.6", reviews: "128", price: 1050, originalPrice: 1300, discount: 19, available: 5, nextSlot: "8:00 PM", tag: "Group friendly", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=85" },
  { id: 5, name: "Rooftop 360", area: "Bharatpur-10", cuisine: "Grill · Barbecue", rating: "4.8", reviews: "97", price: 1750, originalPrice: 2200, discount: 20, available: 2, nextSlot: "8:30 PM", tag: "Rooftop", image: "https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?w=1000&q=85" },
  { id: 6, name: "Basil & Bean", area: "Hakim Chowk", cuisine: "Cafe · Bakery", rating: "4.5", reviews: "76", price: 650, originalPrice: 800, discount: 19, available: 6, nextSlot: "6:45 PM", tag: "Coffee & bites", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&q=85" },
];

const categories = ["All tables", "Near me", "Nepali", "Cafe", "Italian", "Rooftop", "Family"];

function money(value: number) {
  return "Rs. " + value.toLocaleString("en-IN");
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All tables");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("Tonight");
  const [sort, setSort] = useState("Recommended");
  const [saved, setSaved] = useState<number[]>([]);
  const [view, setView] = useState<"discover" | "partner" | "owner">("discover");
  const [toast, setToast] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [tableCount, setTableCount] = useState("3");
  const [offer, setOffer] = useState("15");
  const [liveRestaurants, setLiveRestaurants] = useState<Restaurant[]>([]);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [customerAuthMode, setCustomerAuthMode] = useState<"login" | "signup">("login");

  const filtered = useMemo(() => {
    let list = (isSupabaseConfigured ? liveRestaurants : restaurants).filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || [r.name, r.area, r.cuisine].some((v) => v.toLowerCase().includes(q));
      const matchesCategory = activeCategory === "All tables" ||
        (activeCategory === "Near me" && r.area.includes("Bharatpur")) ||
        r.cuisine.toLowerCase().includes(activeCategory.toLowerCase()) ||
        r.tag.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
    if (sort === "Lowest price") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Biggest deal") list = [...list].sort((a, b) => b.discount - a.discount);
    if (sort === "Top rated") list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating));
    return list;
  }, [activeCategory, search, sort, liveRestaurants]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    supabase.from("table_offers").select("id,title,seats,service_date,starts_at,ends_at,offer_price,original_price,restaurants!inner(id,name,area,cuisine,city,cover_image_url,status)")
      .eq("status", "live").eq("restaurants.status", "approved")
      .gte("service_date", new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kathmandu" }))
      .order("service_date", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) notify("Could not load live tables: " + error.message);
        else setLiveRestaurants((data ?? []).map((row: any, index: number) => {
          const r = Array.isArray(row.restaurants) ? row.restaurants[0] : row.restaurants;
          return { id: index + 1000, offerId: row.id, name: r.name, area: r.area, cuisine: r.cuisine || "Restaurant", rating: "New", reviews: "0", price: Number(row.offer_price), originalPrice: Number(row.original_price), discount: row.original_price > 0 ? Math.round((1 - row.offer_price / row.original_price) * 100) : 0, available: 1, nextSlot: String(row.starts_at).slice(0,5), image: r.cover_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=85", tag: row.title, seats: row.seats, serviceDate: row.service_date, startTime: row.starts_at, endTime: row.ends_at };
        }));
        setLiveLoaded(true);
      });
    return () => { active = false; };
  }, []);

  const openRestaurant = (restaurant: Restaurant) => {
    setSelected(restaurant);
    setBookingDone(false);
  };

  const toggleSaved = (id: number) => {
    setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const reserveSelected = async () => {
    if (!selected?.offerId) { setBookingDone(true); return; }
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const auth = customerAuthMode === "signup"
        ? await supabase.auth.signUp({ email: customerEmail.trim(), password: customerPassword })
        : await supabase.auth.signInWithPassword({ email: customerEmail.trim(), password: customerPassword });
      if (auth.error) { notify(auth.error.message); return; }
      session = auth.data.session;
      if (!session) { notify("Check your email to confirm your account, then sign in to reserve."); return; }
    }
    if (guestName.trim().length < 2 || guestPhone.trim().length < 7) { notify("Enter your name and a valid phone number."); return; }
    const { error } = await supabase.rpc("create_reservation", {
      p_offer_id: selected.offerId, p_guest_name: guestName.trim(),
      p_guest_phone: guestPhone.trim(), p_party_size: guests,
    });
    if (error) notify(error.message);
    else { setBookingDone(true); notify("Reservation request sent to the restaurant."); }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => { setView("discover"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="brand-mark"><Utensils size={18} strokeWidth={2.5} /></span>
          <span>TABLE<span className="brand-x">X</span><small>FIND YOUR TABLE</small></span>
        </a>
        <nav className="desktop-nav">
          <button className={view === "discover" ? "nav-link active" : "nav-link"} onClick={() => setView("discover")}>Discover</button>
          <button className="nav-link" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
          <button className={view === "partner" ? "nav-link active" : "nav-link"} onClick={() => setView("partner")}>For restaurants</button><button className={view === "owner" ? "nav-link active" : "nav-link"} onClick={() => setView("owner")}>Owner dashboard</button>
        </nav>
        <div className="nav-actions">
          <button className="location-pill" onClick={() => notify("Showing sample listings around Bharatpur, Nepal.")}><MapPin size={15} /> Bharatpur <ChevronDown size={14} /></button>
          <button className="partner-cta" onClick={() => setView("partner")}>List your tables <ArrowUpRight size={15} /></button><button className="owner-shortcut" onClick={() => setView("owner")}>Owner login</button>
        </div>
      </header>

      {view === "discover" ? (
        <>
          <section className="hero">
            <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
            <div className="hero-content">
              <div className="eyebrow"><span className="live-dot" /> THE SMARTER WAY TO DINE OUT</div>
              <h1>Good tables.<br /><em>Better timing.</em></h1>
              <p className="hero-copy">Discover tables restaurants have ready right now.<br className="desktop-break" /> Reserve your spot. Make the most of going out.</p>
              <div className="hero-proof"><span><Check size={14} /> Instant reservation requests</span><span><Check size={14} /> Great tables, great value</span></div>
            </div>
            <div className="hero-art">
              <div className="hero-photo-wrap">
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1100&q=90" alt="Warm, beautifully set restaurant interior" />
                <div className="photo-gradient" />
                <div className="photo-caption"><span className="caption-kicker">YOUR NEXT FAVOURITE SPOT</span><strong>A table is waiting.</strong><span className="caption-location"><MapPin size={13} /> Bharatpur, Nepal</span></div>
              </div>
              <div className="floating-deal"><span className="deal-spark"><Zap size={15} fill="currentColor" /></span><div><strong>Up to 25% off</strong><small>on selected tables</small></div></div>
              <div className="floating-seat"><span className="seat-icon"><Users size={17} /></span><div><strong>Tables available</strong><small>Ready when you are</small></div><span className="seat-pulse" /></div>
            </div>
            <div className="hero-bottom-note">LESS EMPTY SEATS. MORE GREAT NIGHTS. <ArrowDownRight size={14} /></div>
          </section>

          <main className="main-content">
            <section className="search-panel" aria-label="Find a restaurant table">
              <div className="search-field destination-field">
                <span className="field-icon"><MapPin size={18} /></span>
                <label><small>LOCATION</small><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Restaurant, cuisine or area" /></label>
              </div>
              <div className="search-divider" />
              <div className="search-field">
                <span className="field-icon"><CalendarDays size={18} /></span>
                <label><small>WHEN</small><select value={time} onChange={(e) => setTime(e.target.value)}><option>Tonight</option><option>Tomorrow</option><option>This weekend</option></select></label>
              </div>
              <div className="search-divider" />
              <div className="search-field guest-field">
                <span className="field-icon"><Users size={18} /></span>
                <label><small>GUESTS</small><select value={guests} onChange={(e) => setGuests(Number(e.target.value))}><option value={1}>1 person</option><option value={2}>2 people</option><option value={3}>3 people</option><option value={4}>4 people</option><option value={5}>5 people</option><option value={6}>6 people</option><option value={8}>8+ people</option></select></label>
              </div>
              <button className="search-button" onClick={() => document.getElementById("available-tables")?.scrollIntoView({ behavior: "smooth" })}><Search size={18} /> Find a table</button>
            </section>

            <section className="intro-row" id="available-tables">
              <div><div className="section-kicker">A SEAT WITH YOUR NAME ON IT</div><h2>Tables worth <em>going out for.</em></h2><p>Explore available tables and reserve before someone else does.</p></div>
              <div className="availability-note"><span className="live-dot" /><span><strong>{isSupabaseConfigured ? "Live TABLEX offers" : "Prototype preview"}</strong><small>{isSupabaseConfigured ? (liveLoaded ? "Connected to TABLEX database" : "Loading available offers…") : "Sample availability · " + time.toLowerCase()}</small></span></div>
            </section>

            <div className="filter-row">
              <div className="category-list">{categories.map((category) => <button key={category} className={activeCategory === category ? "category-chip selected" : "category-chip"} onClick={() => setActiveCategory(category)}>{category === "All tables" && <Sparkles size={14} />}{category === "Near me" && <MapPin size={13} />}{category}{category === "All tables" && <span className="chip-count">06</span>}</button>)}</div>
              <label className="sort-control"><SlidersHorizontal size={15} /><select value={sort} onChange={(e) => setSort(e.target.value)}><option>Recommended</option><option>Lowest price</option><option>Biggest deal</option><option>Top rated</option></select><ChevronDown size={13} /></label>
            </div>

            <div className="results-meta"><span><strong>{filtered.length.toString().padStart(2, "0")}</strong> {isSupabaseConfigured ? "available offers" : "places with sample tables"}</span><span className="results-side-note"><Flame size={14} /> Handpicked for a good night out</span></div>

            {filtered.length ? <div className="restaurant-grid">
              {filtered.map((restaurant, index) => <motion.article className="restaurant-card" key={restaurant.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.055 }} whileHover={{ y: -5 }} onClick={() => openRestaurant(restaurant)}>
                <div className="card-image-wrap"><img src={restaurant.image} alt={restaurant.name} className="card-image" loading="lazy" /><div className="image-shade" /><span className="discount-badge">{restaurant.discount}% OFF</span><button className={saved.includes(restaurant.id) ? "save-button saved" : "save-button"} aria-label="Save restaurant" onClick={(e) => { e.stopPropagation(); toggleSaved(restaurant.id); }}><Heart size={17} fill={saved.includes(restaurant.id) ? "currentColor" : "none"} /></button><span className="image-tag">{restaurant.tag}</span></div>
                <div className="card-body"><div className="card-title-line"><h3>{restaurant.name}</h3><span className="rating"><Star size={13} fill="currentColor" /> {restaurant.rating} <small>({restaurant.reviews})</small></span></div><p className="card-cuisine">{restaurant.cuisine}</p><p className="card-area"><MapPin size={13} /> {restaurant.area}</p>
                  <div className="card-separator" /><div className="card-bottom"><div className="price-block"><strong>{money(restaurant.price)}<small> est. for 2</small></strong><del>{money(restaurant.originalPrice)}</del></div><div className="availability"><span className="available-dot" />{restaurant.available} tables <small>· {restaurant.nextSlot}</small></div></div>
                  <button className="card-book" onClick={(e) => { e.stopPropagation(); openRestaurant(restaurant); }}>View availability <ArrowUpRight size={15} /></button>
                </div>
              </motion.article>)}
            </div> : <div className="empty-state"><Search size={28} /><h3>No tables found just yet</h3><p>{isSupabaseConfigured && !liveLoaded ? "Loading live offers…" : isSupabaseConfigured ? "No approved restaurants have published available tables yet." : "Try another cuisine, area or search term."}</p><button onClick={() => { setSearch(""); setActiveCategory("All tables"); }}>Clear filters</button></div>}

            <section className="how-section" id="how-it-works"><div className="how-copy"><div className="section-kicker">A BETTER WAY TO BOOK</div><h2>Three steps.<br /><em>One great night.</em></h2><p>No calling around. No guesswork. Just find a table that works for you.</p></div><div className="steps"><div className="step"><span className="step-number">01</span><span className="step-icon"><Search size={20} /></span><div><h3>Find your spot</h3><p>Explore restaurants with tables available for your time and group.</p></div></div><div className="step"><span className="step-number">02</span><span className="step-icon"><CalendarDays size={20} /></span><div><h3>Choose & request</h3><p>Pick a slot, see the price and send your reservation request.</p></div></div><div className="step"><span className="step-number">03</span><span className="step-icon"><Utensils size={20} /></span><div><h3>Show up & enjoy</h3><p>Get confirmation and let the restaurant take care of the rest.</p></div></div></div></section>

            <section className="partner-banner"><div className="partner-banner-orb" /><div><div className="section-kicker light-kicker">FOR RESTAURANT PARTNERS</div><h2>Empty tables?<br /><em>Let's fill them.</em></h2><p>Put your available tables in front of people ready to dine. You stay in control of your availability and pricing.</p><button onClick={() => setView("partner")}>List your tables for free <ArrowRight size={16} /></button></div><div className="partner-stat"><span className="stat-icon"><Zap size={20} /></span><strong>More covers.<br />Less empty seats.</strong><small>Pay only for successful bookings.</small></div></section>
          </main>
        </>
      ) : view === "partner" ? (
        <main className="partner-page">
          <div className="partner-hero"><div className="section-kicker light-kicker">GROW WITH TABLEX</div><h1>Your empty tables<br /><em>deserve a full house.</em></h1><p>Reach nearby diners, publish available tables and turn quiet slots into real covers. You control the inventory. You control the price.</p><div className="partner-benefits"><span><Check size={15} /> Free to get started</span><span><Check size={15} /> You control availability</span><span><Check size={15} /> Pay per confirmed visit</span></div></div>
          <div className="partner-form-wrap"><form className="partner-form" onSubmit={(e) => { e.preventDefault(); notify("Thanks! Your partner interest has been recorded in this demo."); setOwnerName(""); setRestaurantName(""); }}><div className="form-heading"><span className="form-icon"><Utensils size={20} /></span><div><h2>Become a partner</h2><p>Tell us a little about your restaurant.</p></div></div><label>YOUR NAME<input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Restaurant owner or manager" /></label><label>RESTAURANT NAME<input required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="e.g. The Greenhouse" /></label><label>HOW MANY TABLES DO YOU WANT TO LIST?<select value={tableCount} onChange={(e) => setTableCount(e.target.value)}><option value="1">1 table</option><option value="2">2 tables</option><option value="3">3–5 tables</option><option value="6">6–10 tables</option><option value="10">10+ tables</option></select></label><label>YOUR INTRODUCTORY OFFER<select value={offer} onChange={(e) => setOffer(e.target.value)}><option value="0">No discount — regular price</option><option value="10">10% off</option><option value="15">15% off</option><option value="20">20% off</option><option value="25">25% off</option></select></label><button className="form-submit" type="submit">Request a partner call <ArrowRight size={16} /></button><small className="form-disclaimer">Demo form only. Partner requests are not yet sent to a server.</small></form><div className="partner-side-note"><div className="side-note-icon"><Sparkles size={18} /></div><h3>You know your tables best.</h3><p>List only the tables you want to make available. Set the time window, party size and price. TABLEX helps diners discover them.</p><div className="mini-feature"><Check size={15} /> No POS integration required for the pilot</div><div className="mini-feature"><Check size={15} /> Pause or edit listings any time</div><div className="mini-feature"><Check size={15} /> Start with just one available table</div></div></div>
        </main>
      ) : (
        <PartnerDashboard />
      )}

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><Utensils size={17} /></span><span>TABLE<span className="brand-x">X</span><small>FIND YOUR TABLE</small></span></a><span>Good tables make good stories.</span><span>© 2026 TABLEX · Nepal</span></footer>

      <AnimatePresence>{selected && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}><motion.div className="booking-modal" initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 280 }} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={19} /></button><img className="modal-image" src={selected.image} alt={selected.name} /><div className="modal-content">{bookingDone ? <div className="booking-success"><span className="success-icon"><Check size={27} /></span><div className="section-kicker">REQUEST PREVIEWED</div><h2>You're one step<br /><em>closer to dinner.</em></h2><p>This is a prototype booking. No reservation has been sent to the restaurant yet.</p><button className="form-submit" onClick={() => setSelected(null)}>Back to exploring <ArrowRight size={16} /></button></div> : <><div className="modal-topline"><span className="discount-badge">{selected.discount}% OFF</span><span className="rating"><Star size={13} fill="currentColor" /> {selected.rating} ({selected.reviews})</span></div><h2>{selected.name}</h2><p className="modal-meta">{selected.cuisine} <span>·</span> <MapPin size={13} /> {selected.area}</p><div className="modal-price"><strong>{money(selected.price)}</strong><del>{money(selected.originalPrice)}</del><span>{selected.offerId ? "booking price for this table offer" : "sample estimated table spend"}</span></div><div className="modal-divider" /><div className="booking-option"><div><strong><CalendarDays size={16} /> Date & time</strong><span>{selected.serviceDate || time} · {selected.nextSlot}</span></div><span className="option-pill">Available</span></div><div className="booking-option"><div><strong><Users size={16} /> Guests</strong><span>How many people?</span></div><div className="guest-stepper"><button onClick={() => setGuests(Math.max(1, guests - 1))}><Minus size={13} /></button><strong>{guests}</strong><button onClick={() => setGuests(Math.min(12, guests + 1))}><Plus size={13} /></button></div></div><div className="availability-callout"><span className="available-dot" /><span><strong>{selected.offerId ? "This table offer is available" : selected.available + " sample tables available"}</strong><small>{selected.offerId ? "A request will be sent to the restaurant." : "Sample data only."}</small></span></div>{selected.offerId && <><label className="booking-auth-field">YOUR NAME<input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Full name"/></label><label className="booking-auth-field">PHONE NUMBER<input value={guestPhone} onChange={e=>setGuestPhone(e.target.value)} placeholder="+977..." /></label><label className="booking-auth-field">EMAIL<input type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} placeholder="you@example.com"/></label><label className="booking-auth-field">PASSWORD<input type="password" value={customerPassword} onChange={e=>setCustomerPassword(e.target.value)} placeholder="At least 8 characters"/></label><button type="button" className="owner-text-button" onClick={()=>setCustomerAuthMode(customerAuthMode==="login"?"signup":"login")}>{customerAuthMode==="login"?"New customer? Create account":"Already registered? Sign in"}</button></>}<button className="form-submit reserve-button" onClick={() => void reserveSelected()}>Request this table <ArrowRight size={16} /></button><p className="modal-footnote">{selected.offerId ? "Your request is saved securely. The restaurant must confirm it." : "Prototype booking preview only."}</p></>}</div></motion.div></motion.div>}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><Check size={16} />{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}
