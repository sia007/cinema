import React, { useEffect, useMemo, useState } from "react";

const formatUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const seatLabel = (r, c) => `${alpha[r]}${c + 1}`;

const MOVIES = [
  {
    id: "mv1",
    title: "Starlight Odyssey",
    hallId: "hall-a",
    time: "Today 7:30 PM",
    price: 12,
    poster:
      "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "mv2",
    title: "Neon City Nights",
    hallId: "hall-b",
    time: "Today 8:00 PM",
    price: 15,
    poster:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "mv3",
    title: "Whispering Pines",
    hallId: "hall-c",
    time: "Today 9:15 PM",
    price: 10,
    poster:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "mv4",
    title: "Quantum Chef",
    hallId: "hall-d",
    time: "Today 10:00 PM",
    price: 13,
    poster:
      "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=800&auto=format&fit=crop",
  },
];

const HALLS = {
  "hall-a": { id: "hall-a", name: "Hall A", rows: 8, cols: 12, aisles: [6] },
  "hall-b": { id: "hall-b", name: "Hall B", rows: 10, cols: 14, aisles: [4, 10] },
  "hall-c": { id: "hall-c", name: "Hall C", rows: 7, cols: 10, aisles: [5] },
  "hall-d": { id: "hall-d", name: "Hall D", rows: 9, cols: 12, aisles: [6] },
};

// prebooked demo seats (occupied)
const PREBOOKED = {
  "hall-a": ["A1", "A2", "C7", "D6", "E5", "F8"],
  "hall-b": ["B3", "B4", "B5", "H10", "H11"],
  "hall-c": ["A9", "B9", "E2"],
  "hall-d": ["C6", "C7", "F1", "F2"],
};

// upsell catalog (promo does NOT apply)
const ADDONS = [
  {
    id: "popcorn",
    name: "Popcorn Combo",
    price: 6,
    img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=300&auto=format&fit=crop",
    note: "Popcorn + small drink",
  },
  {
    id: "drink",
    name: "Large Drink",
    price: 4,
    img: "https://images.unsplash.com/photo-1510627498534-cf7e9002facc?q=80&w=300&auto=format&fit=crop",
    note: "Choose any flavor",
  },
  {
    id: "poster",
    name: "Limited Poster",
    price: 12,
    img: "https://images.unsplash.com/photo-1505245208761-ba872912fac0?w=300&q=80&auto=format&fit=crop",
    note: "18x24 premium print",
  },
  {
    id: "shirt",
    name: "Movie T-Shirt",
    price: 20,
    img: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?q=80&w=300&auto=format&fit=crop",
    note: "Black, S-XL",
  },
];

const BOOKINGS_KEY = "cinemaBookings";
function loadBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : { mv1: [], mv2: [], mv3: [], mv4: [] };
  } catch {
    return { mv1: [], mv2: [], mv3: [], mv4: [] };
  }
}
function saveBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch {}
}

function useHallBookings(hallId, movieId) {
  const seed = PREBOOKED[hallId] || [];
  const [booked, setBooked] = useState(() => {
    const all = loadBookings();
    const movieBooked = all[movieId] || [];
    return Array.from(new Set([...seed, ...movieBooked]));
  });

  const bookSeats = (seats) => {
    const all = loadBookings();
    const before = all[movieId] || [];
    const after = Array.from(new Set([...before, ...seats]));
    all[movieId] = after;
    saveBookings(all);
    setBooked(Array.from(new Set([...seed, ...after])));
  };

  const isBooked = (label) => booked.includes(label);
  return { booked, isBooked, bookSeats };
}

function Row({ label, value, style }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, ...style }}>
      <span style={{ color: "#ddd" }}>{label}</span>
      <span style={{ color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#aaa" }}>
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          borderRadius: 4,
          background: color,
          border: "1px solid #3a3a3a",
        }}
      />
      {label}
    </span>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // persist between screens
  const [appliedPromo, setAppliedPromo] = useState(null); // {code, amount}

  const movie = useMemo(
    () => MOVIES.find((m) => m.id === selectedMovieId) || null,
    [selectedMovieId]
  );

  const goHome = () => {
    setScreen("home");
    setSelectedMovieId(null);
    setSelectedSeats([]);
    setAppliedPromo(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <header
        style={{
          borderBottom: "1px solid #262626",
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "#000",
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "#b91c1c",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
            }}
          >
            CS
          </div>
          <h1 style={{ fontSize: 18, margin: 0 }}>Cinema Seats</h1>
        </div>
        {screen !== "home" && (
          <button
            onClick={goHome}
            style={{
              background: "transparent",
              color: "#d4d4d4",
              border: "1px solid #333",
              padding: "6px 10px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Home
          </button>
        )}
      </header>

      <main style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
        {screen === "home" && (
          <Home
            onPick={(id) => {
              setSelectedMovieId(id);
              setScreen("seats");
            }}
          />
        )}

        {screen === "seats" && movie && (
          <SeatPicker
            movie={movie}
            selected={selectedSeats}
            setSelected={setSelectedSeats}
            onBack={goHome}
            onProceed={(seats, promo) => {
              setSelectedSeats(seats);
              setAppliedPromo(promo || null);
              setScreen("checkout");
            }}
          />
        )}

        {screen === "checkout" && movie && (
          <Checkout
            movie={movie}
            seats={selectedSeats}
            promo={appliedPromo}
            onBack={() => setScreen("seats")} // keep selection when going back
            onConfirm={() => setScreen("confirmation")}
          />
        )}

        {screen === "confirmation" && movie && (
          <Confirmation movie={movie} seats={selectedSeats} onHome={goHome} />
        )}
      </main>

      <footer
        style={{
          borderTop: "1px solid #262626",
          padding: 16,
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 12,
          marginTop: 24,
        }}
      >
        Demo only — no real payments. React + plain CSS.
      </footer>
    </div>
  );
}

function Home({ onPick }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Now Showing</h2>
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {MOVIES.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #262626",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0a0a0a",
            }}
          >
            <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
              <img
                src={m.poster}
                alt={m.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.title}</div>
              <div style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 6 }}>{m.time}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#ddd", fontSize: 14 }}>{formatUSD(m.price)}</span>
                <button
                  onClick={() => onPick(m.id)}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "8px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Pick seats
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeatPicker({ movie, selected, setSelected, onBack, onProceed }) {
  const hall = HALLS[movie.hallId];
  const { isBooked } = useHallBookings(hall.id, movie.id);

  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState(null); // {code, amount}
  const [promoStatus, setPromoStatus] = useState(null); // "applied" | "invalid" | null

  // bottom-right tooltip (like Ticketbooth)
  const [tip, setTip] = useState({ visible: false, x: 0, y: 0, html: null });

  useEffect(() => {
    if (promo?.code === "111") {
      const amount = Math.round(selected.length * movie.price * 0.1);
      setPromo((p) => (p ? { ...p, amount } : p));
    }
  }, [selected, movie.price, promo?.code]);

  const handleApplyPromo = () => {
    if (promoCode.trim() === "111" && selected.length > 0) {
      const amount = Math.round(selected.length * movie.price * 0.1);
      setPromo({ code: "111", amount });
      setPromoStatus("applied");
    } else {
      setPromo(null);
      setPromoStatus("invalid");
    }
  };

  const subtotal = selected.length * movie.price;
  const bookingFee = Math.round(subtotal * 0.05);
  const promoDisc = promo?.amount ?? 0;
  const total = Math.max(0, subtotal + bookingFee - promoDisc);

  // build seat rows
  const seatRows = [];
  for (let r = 0; r < hall.rows; r++) {
    const rowBtns = [];
    for (let c = 0; c < hall.cols; c++) {
      const label = seatLabel(r, c);
      const booked = isBooked(label);
      const isSel = selected.includes(label);
      const isAisle = hall.aisles.includes(c);
      rowBtns.push(
        <button
          key={label}
          disabled={booked}
          onMouseEnter={(e) =>
            setTip({
              visible: true,
              x: e.clientX + 20,
              y: e.clientY + 20,
              html: (
                <div>
                  <div style={{ fontWeight: 700, color: "#fca5a5" }}>Seat {label}</div>
                  <div style={{ color: "#e5e7eb" }}>
                    Row {alpha[r]}, Col {c + 1}
                  </div>
                  <div style={{ color: "#fca5a5" }}>{formatUSD(movie.price)}</div>
                  <div style={{ color: "#a1a1aa" }}>
                    {booked ? "Occupied" : isSel ? "Selected" : "Available"}
                  </div>
                </div>
              ),
            })
          }
          onMouseMove={(e) => setTip((t) => ({ ...t, x: e.clientX + 20, y: e.clientY + 20 }))}
          onMouseLeave={() => setTip({ visible: false, x: 0, y: 0, html: null })}
          onClick={() =>
            setSelected((prev) =>
              prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
            )
          }
          style={{
            margin: 4,
            width: 36,
            height: 36,
            borderRadius: 6,
            border: "1px solid " + (booked ? "#3a3a3a" : isSel ? "#ef4444" : "#3a3a3a"),
            background: booked ? "#1a1a1a" : isSel ? "rgba(239,68,68,.15)" : "#1f1f1f",
            color: booked ? "#6b7280" : isSel ? "#fecaca" : "#e5e7eb",
            fontSize: 12,
            cursor: booked ? "not-allowed" : "pointer",
          }}
          title={label}
        >
          {label}
        </button>
      );
      if (isAisle) rowBtns.push(<div key={`gap-${r}-${c}`} style={{ width: 12 }} />);
    }
    seatRows.push(
      <div key={r} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {rowBtns}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "2fr 1fr",
      }}
    >
      {/* Left: chart */}
      <div>
        <button onClick={onBack} style={linkBtn}>
          ← Back
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 16px" }}>Choose your seats</h2>

        <div
          style={{
            position: "relative",
            margin: "0 auto",
            border: "1px solid #262626",
            borderRadius: 14,
            padding: 16,
            background: "#0a0a0a",
            width: "fit-content",
          }}
        >
          <div style={{ textAlign: "center", color: "#a1a1aa", fontSize: 11, letterSpacing: 2 }}>
            SCREEN
          </div>
          <div
            style={{
              height: 8,
              background:
                "linear-gradient(90deg, rgba(185,28,28,.7), rgba(239,68,68,.7), rgba(185,28,28,.7))",
              borderRadius: 999,
              margin: "8px 0 16px",
            }}
          />
          {seatRows}
        </div>

        {/* Tooltip */}
        {tip.visible && (
          <div
            style={{
              position: "fixed",
              left: tip.x,
              top: tip.y,
              zIndex: 50,
              background: "rgba(0,0,0,.95)",
              color: "#fecaca",
              border: "1px solid #7f1d1d",
              padding: "8px 10px",
              fontSize: 12,
              borderRadius: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,.6)",
              pointerEvents: "none",
            }}
          >
            {tip.html}
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: "center", display: "flex", gap: 18, justifyContent: "center", color: "#a1a1aa", fontSize: 12 }}>
          <Legend color="#1f1f1f" label="Available" />
          <Legend color="rgba(239,68,68,.25)" label="Selected" />
          <Legend color="#151515" label="Occupied" />
        </div>
      </div>

      {/* Right: sidebar */}
      <aside
        style={{
          border: "1px solid #262626",
          borderRadius: 16,
          padding: 18,
          background: "#0a0a0a",
          minHeight: 200,
        }}
      >
        <h3 style={{ margin: "0 0 12px", color: "#f87171" }}>Checkout</h3>

        {selected.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14 }}>No seats selected yet.</p>
        ) : (
          <>
            <ul
              style={{
                border: "1px solid #262626",
                borderRadius: 12,
                overflow: "hidden",
                margin: "0 0 12px",
              }}
            >
              {selected.map((s, i) => (
                <li
                  key={s}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderTop: i ? "1px solid #262626" : "none",
                    fontSize: 14,
                  }}
                >
                  <span>Seat {s}</span>
                  <span>{formatUSD(movie.price)}</span>
                </li>
              ))}
            </ul>

            {/* Promo */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoStatus(null);
                  }}
                  placeholder={'Enter "111" to get discount'}
                  style={input}
                />
                <button onClick={handleApplyPromo} style={outlineRedBtn}>
                  Apply
                </button>
              </div>
              {promoStatus === "applied" && promo && (
                <div style={{ color: "#22c55e", fontSize: 12, marginTop: 6 }}>
                  ✅ Promo applied: −{formatUSD(promo.amount)} (10%)
                </div>
              )}
              {promoStatus === "invalid" && (
                <div style={{ color: "#fca5a5", fontSize: 12, marginTop: 6 }}>
                  ❌ Invalid code
                </div>
              )}
            </div>

            <Row label="Subtotal" value={formatUSD(subtotal)} />
            <Row label="Booking fee (5%)" value={formatUSD(bookingFee)} />
            {promo && <Row label={`Promo (${promo.code})`} value={`- ${formatUSD(promoDisc)}`} />}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "#eee" }}>Total</span>
              <span style={{ fontWeight: 700 }}>{formatUSD(total)}</span>
            </div>

            <button
            disabled={selected.length === 0}
            onClick={() => onProceed(selected, promo)}
            className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:bg-zinc-700"
          >
            Checkout →
          </button>

          </>
        )}
      </aside>
    </div>
  );
}

function Checkout({ movie, seats, promo, onBack, onConfirm }) {
  const hall = HALLS[movie.hallId];
  const { bookSeats } = useHallBookings(hall.id, movie.id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);

  // Upsell
  const [addons, setAddons] = useState(Object.fromEntries(ADDONS.map((a) => [a.id, 0])));
  const incAddon = (id, v) => setAddons((s) => ({ ...s, [id]: Math.max(0, v) }));

  // Math
  const ticketsSubtotal = seats.length * movie.price;
  const bookingFee = Math.round(ticketsSubtotal * 0.05);
  const promoDisc = promo?.amount ?? 0;
  const merchSubtotal = ADDONS.reduce((sum, a) => sum + a.price * (addons[a.id] || 0), 0);
  const total = Math.max(0, ticketsSubtotal + bookingFee - promoDisc + merchSubtotal);

  const handlePlaceOrder = () => {
    if (!name || !email || !agree) return;
    // persist purchased seats
    bookSeats(seats);

    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      movieId: movie.id,
      hallId: hall.id,
      name,
      email,
      seats,
      ticketsSubtotal,
      bookingFee,
      promo: promo ? { code: promo.code, amount: promo.amount } : null,
      merchSubtotal,
      addons: ADDONS.filter((a) => (addons[a.id] || 0) > 0).map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
        qty: addons[a.id],
        lineTotal: a.price * addons[a.id],
      })),
      total,
      createdAt: new Date().toISOString(),
    };
    sessionStorage.setItem("lastOrder", JSON.stringify(order));
    onConfirm();
  };

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div>
        <button onClick={onBack} style={linkBtn}>← Back</button>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 16px" }}>Checkout</h2>

        <div style={{ border: "1px solid #262626", borderRadius: 14, padding: 16, background: "#0a0a0a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Make it even better</h3>
            <span style={{ color: "#9ca3af", fontSize: 12 }}>Snacks & merch (promo not applied)</span>
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {ADDONS.map((a) => {
              const qty = addons[a.id] || 0;
              return (
                <div key={a.id} style={{ display: "flex", gap: 12, border: "1px solid #303030", borderRadius: 12, padding: 12, background: "#0b0b0b" }}>
                  <img src={a.img} alt={a.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ color: "#a1a1aa", fontSize: 12 }}>{a.note}</div>
                      </div>
                      <div style={{ color: "#e5e7eb", fontSize: 14 }}>{formatUSD(a.price)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #3a3a3a", borderRadius: 8 }}>
                        <button onClick={() => incAddon(a.id, qty - 1)} style={qtyBtn}>−</button>
                        <span style={{ width: 36, textAlign: "center" }}>{qty}</span>
                        <button onClick={() => incAddon(a.id, qty + 1)} style={qtyBtn}>+</button>
                      </div>
                      <div style={{ color: "#ddd" }}>{qty > 0 ? formatUSD(qty * a.price) : ""}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Order Summary + Your Details (restored stack + button) */}
      <aside style={{ border: "1px solid #262626", borderRadius: 16, padding: 18, background: "#0a0a0a" }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, color: "#fff" }}>Order Summary</h3>

        <Row label="Tickets" value={formatUSD(ticketsSubtotal)} />
        <Row label="Booking fee (5%)" value={formatUSD(bookingFee)} />
        {promoDisc > 0 && <Row label="Promo" value={`- ${formatUSD(promoDisc)}`} />}
        <Row label="Add-ons" value={formatUSD(merchSubtotal)} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ color: "#eee" }}>Total</span>
          <span style={{ fontWeight: 700 }}>{formatUSD(total)}</span>
        </div>

        <div style={{ marginTop: 20 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 18 }}>Your Details</h4>

          <label style={{ display: "block", fontSize: 14, marginBottom: 6, color: "#e5e7eb" }}>
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            style={{ ...input, width: "100%", marginBottom: 12, display: "block" }}
          />

          <label style={{ display: "block", fontSize: 14, marginBottom: 6, color: "#e5e7eb" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ ...input, width: "100%", marginBottom: 12, display: "block" }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#d1d5db", marginBottom: 12 }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I understand this is a demo (no payment will be processed).
          </label>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={!name || !email || seats.length === 0 || !agree}
          style={{
            ...solidRedBtn,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            opacity: !name || !email || seats.length === 0 || !agree ? 0.6 : 1,
            cursor: !name || !email || seats.length === 0 || !agree ? "not-allowed" : "pointer",
          }}
        >
          Place Order
        </button>
      </aside>
    </div>
  );
}

function Confirmation({ movie, seats, onHome }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  const storedSeats = order?.seats ?? seats;
  const ticketsSubtotal = order?.ticketsSubtotal ?? storedSeats.length * movie.price;
  const bookingFee = order?.bookingFee ?? Math.round(storedSeats.length * movie.price * 0.05);
  const promoObj = order?.promo && typeof order.promo === "object" ? order.promo : null;
  const promoDisc = promoObj?.amount ?? 0;
  const merchSubtotal = order?.merchSubtotal ?? 0;
  const addons = order?.addons ?? [];
  const total =
    order?.total ?? Math.max(0, ticketsSubtotal + bookingFee - promoDisc + merchSubtotal);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div
        style={{
          margin: "0 auto 16px",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(22,163,74,.15)",
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(22,163,74,.4)",
        }}
      >
        <svg viewBox="0 0 24 24" width="36" height="36" style={{ color: "#22c55e" }}>
          <path
            d="M20 7L9 18l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You're all set!</h2>
      <p style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 16 }}>
        Your order is confirmed for <span style={{ color: "#fff" }}>{movie.title}</span>.
      </p>

      <div
        style={{
          border: "1px solid #262626",
          borderRadius: 16,
          padding: 16,
          background: "#0a0a0a",
          textAlign: "left",
          margin: "0 auto 16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#a1a1aa", fontSize: 14 }}>Order ID</span>
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {order?.id ?? "N/A"}
          </span>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 4 }}>Seats</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {storedSeats.map((s) => (
              <span key={s} style={{ background: "#1f1f1f", padding: "4px 8px", borderRadius: 6 }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {addons.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 4 }}>Add-ons</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {addons.map((a) => (
                <li key={a.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {a.name} × {a.qty}
                  </span>
                  <span>{formatUSD(a.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <Row label="Subtotal (tickets)" value={formatUSD(ticketsSubtotal)} />
          <Row label="Booking fee (5%)" value={formatUSD(bookingFee)} />
          {promoObj && <Row label={`Promo (${promoObj.code})`} value={`- ${formatUSD(promoDisc)}`} />}
          <Row label="Add-ons subtotal" value={formatUSD(merchSubtotal)} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ color: "#eee" }}>Total</span>
            <span style={{ fontWeight: 700 }}>{formatUSD(total)}</span>
          </div>
        </div>
      </div>

      <button onClick={onHome} style={solidRedBtn}>
        Back to Home
      </button>
    </div>
  );
}

const linkBtn = {
  background: "transparent",
  color: "#9ca3af",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: 14,
};

const input = {
  flex: 1,
  background: "#0b0b0b",
  color: "#fff",
  border: "1px solid #3a3a3a",
  padding: "8px 10px",
  borderRadius: 10,
  outline: "none",
  fontSize: 14,
};

const outlineRedBtn = {
  background: "transparent",
  color: "#fecaca",
  border: "1px solid #b91c1c",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 13,
};

const solidRedBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "1px solid #dc2626",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
};

const qtyBtn = {
  background: "transparent",
  color: "#e5e7eb",
  border: "none",
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 16,
};
