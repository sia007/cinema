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

function Row({ label, value, className = "" }) {
  return (
    <div className={`flex justify-between text-[14px] ${className}`}>
      <span className="text-zinc-300">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

function Legend({ colorClass, label }) {
  return (
    <span className="inline-flex items-center gap-2 text-zinc-400">
      <span className={`inline-block w-[14px] h-[14px] rounded border border-zinc-800 ${colorClass}`} />
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
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-700 font-extrabold">
              CS
            </div>
            <h1 className="m-0 text-[18px]">Cinema Seats</h1>
          </div>
          {screen !== "home" && (
            <button
              onClick={goHome}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:text-white"
            >
              Home
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
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
            onBack={() => setScreen("seats")}
            onConfirm={() => setScreen("confirmation")}
          />
        )}

        {screen === "confirmation" && movie && (
          <Confirmation movie={movie} seats={selectedSeats} onHome={goHome} />
        )}
      </main>

      <footer className="mt-6 border-t border-zinc-800 px-4 py-4 text-center text-xs text-zinc-400">
        Demo only — no real payments. React + Tailwind CSS.
      </footer>
    </div>
  );
}

function Home({ onPick }) {
  return (
    <div>
      <h2 className="mb-3 text-[22px] font-bold">Now Showing</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {MOVIES.map((m) => (
          <div
            key={m.id}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
          >
            <div className="overflow-hidden [aspect-ratio:3/4]">
              <img
                src={m.poster}
                alt={m.title}
                className="block h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="mb-1 font-bold">{m.title}</div>
              <div className="mb-1 text-xs text-zinc-400">{m.time}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-200">{formatUSD(m.price)}</span>
                <button
                  onClick={() => onPick(m.id)}
                  className="rounded-xl bg-red-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-red-500"
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
                  <div className="font-bold text-rose-300">Seat {label}</div>
                  <div className="text-zinc-200">
                    Row {alpha[r]}, Col {c + 1}
                  </div>
                  <div className="text-rose-300">{formatUSD(movie.price)}</div>
                  <div className="text-zinc-400">
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
          className={[
            "m-1 h-9 w-9 rounded-md border text-xs transition",
            booked
              ? "cursor-not-allowed border-zinc-700 bg-zinc-900 text-zinc-400"
              : isSel
              ? "border-red-500 bg-red-500/15 text-rose-200 hover:bg-red-500/20"
              : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
          ].join(" ")}
          title={label}
        >
          {label}
        </button>
      );
      if (isAisle) rowBtns.push(<div key={`gap-${r}-${c}`} className="w-3" />);
    }
    seatRows.push(
      <div key={r} className="flex items-center justify-center">
        {rowBtns}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-6">
      {/* Left: chart */}
      <div>
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-white">
          ← Back
        </button>
        <h2 className="mb-4 mt-2 text-[22px] font-bold">Choose your seats</h2>

        <div className="relative mx-auto w-fit rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-center text-[11px] tracking-[0.2em] text-zinc-400">SCREEN</div>
          <div className="my-2 h-2 rounded-full bg-gradient-to-r from-red-700/70 via-red-500/70 to-red-700/70" />
          {seatRows}
        </div>

        {/* Tooltip */}
        {tip.visible && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-red-900 bg-black/95 p-2 text-xs text-rose-300 shadow-2xl"
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.html}
          </div>
        )}

        <div className="mt-3 flex justify-center gap-4 text-center text-xs text-zinc-400">
          <Legend colorClass="bg-zinc-800" label="Available" />
          <Legend colorClass="bg-red-500/25" label="Selected" />
          <Legend colorClass="bg-zinc-900" label="Occupied" />
        </div>
      </div>

      {/* Right: sidebar */}
      <aside className="min-h-[200px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="mb-3 text-rose-400">Checkout</h3>

        {selected.length === 0 ? (
          <p className="text-sm text-zinc-400">No seats selected yet.</p>
        ) : (
          <>
            <ul className="mb-3 overflow-hidden rounded-xl border border-zinc-800">
              {selected.map((s, i) => (
                <li
                  key={s}
                  className={`flex justify-between px-3 py-2 text-sm ${
                    i ? "border-t border-zinc-800" : ""
                  }`}
                >
                  <span>Seat {s}</span>
                  <span>{formatUSD(movie.price)}</span>
                </li>
              ))}
            </ul>

            {/* Promo */}
            <div className="mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoStatus(null);
                  }}
                  placeholder={'Enter "111" to get discount'}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
                />
                <button
                  onClick={handleApplyPromo}
                  className="rounded-xl border border-red-700 px-3 py-2 text-[13px] text-rose-200 hover:bg-red-900/20"
                >
                  Apply
                </button>
              </div>
              {promoStatus === "applied" && promo && (
                <div className="mt-1 text-xs text-green-500">
                  ✅ Promo applied: −{formatUSD(promo.amount)} (10%)
                </div>
              )}
              {promoStatus === "invalid" && (
                <div className="mt-1 text-xs text-rose-300">❌ Invalid code</div>
              )}
            </div>

            <Row label="Subtotal" value={formatUSD(subtotal)} />
            <Row label="Booking fee (5%)" value={formatUSD(bookingFee)} />
            {promo && <Row label={`Promo (${promo.code})`} value={`- ${formatUSD(promoDisc)}`} />}
            <div className="mt-2 flex justify-between">
              <span className="text-zinc-100">Total</span>
              <span className="font-bold">{formatUSD(total)}</span>
            </div>

            <button
              disabled={selected.length === 0}
              onClick={() => onProceed(selected, promo)}
              className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
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
    <div className="grid grid-cols-[1.5fr_1fr] gap-6">
      <div>
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-white">
          ← Back
        </button>
        <h2 className="mb-4 mt-2 text-[22px] font-bold">Checkout</h2>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="m-0 text-lg">Make it even better</h3>
            <span className="text-xs text-zinc-400">Snacks & merch (promo not applied)</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {ADDONS.map((a) => {
              const qty = addons[a.id] || 0;
              return (
                <div
                  key={a.id}
                  className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                >
                  <img
                    src={a.img}
                    alt={a.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-xs text-zinc-400">{a.note}</div>
                      </div>
                      <div className="text-sm text-zinc-200">{formatUSD(a.price)}</div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="inline-flex items-center rounded-lg border border-zinc-700">
                        <button
                          onClick={() => incAddon(a.id, qty - 1)}
                          className="rounded-lg px-3 py-1.5 text-base text-zinc-200 hover:bg-zinc-800"
                        >
                          −
                        </button>
                        <span className="w-9 text-center">{qty}</span>
                        <button
                          onClick={() => incAddon(a.id, qty + 1)}
                          className="rounded-lg px-3 py-1.5 text-base text-zinc-200 hover:bg-zinc-800"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-zinc-300">
                        {qty > 0 ? formatUSD(qty * a.price) : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Order Summary + Your Details (stacked) */}
      <aside className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="mb-3 mt-0 text-lg text-white">Order Summary</h3>

        <Row label="Tickets" value={formatUSD(ticketsSubtotal)} />
        <Row label="Booking fee (5%)" value={formatUSD(bookingFee)} />
        {promoDisc > 0 && <Row label="Promo" value={`- ${formatUSD(promoDisc)}`} />}
        <Row label="Add-ons" value={formatUSD(merchSubtotal)} />
        <div className="mt-2 flex justify-between">
          <span className="text-zinc-100">Total</span>
          <span className="font-bold">{formatUSD(total)}</span>
        </div>

        <div className="mt-5">
          <h4 className="mb-2 text-lg">Your Details</h4>

          <label className="mb-1 block text-sm text-zinc-200">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            className="mb-3 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <label className="mb-1 block text-sm text-zinc-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-3 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <label className="mb-3 flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I understand this is a demo (no payment will be processed).
          </label>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={!name || !email || seats.length === 0 || !agree}
          className="w-full rounded-xl border border-red-600 bg-red-600 px-4 py-3 text-[15px] font-bold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-green-700/40 bg-green-600/15">
        <svg viewBox="0 0 24 24" width="36" height="36" className="text-green-500">
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

      <h2 className="mb-2 text-[22px] font-bold">You're all set!</h2>
      <p className="mb-4 text-sm text-slate-300">
        Your order is confirmed for <span className="text-white">{movie.title}</span>.
      </p>

      <div className="mx-auto mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left">
        <div className="mb-2 flex justify-between">
          <span className="text-sm text-zinc-400">Order ID</span>
          <span className="font-mono">{order?.id ?? "N/A"}</span>
        </div>

        <div className="mb-2">
          <div className="mb-1 text-sm text-zinc-400">Seats</div>
          <div className="flex flex-wrap gap-2">
            {storedSeats.map((s) => (
              <span key={s} className="rounded-md bg-zinc-800 px-2 py-1">
                {s}
              </span>
            ))}
          </div>
        </div>

        {addons.length > 0 && (
          <div className="mb-2">
            <div className="mb-1 text-sm text-zinc-400">Add-ons</div>
            <ul className="list-inside list-disc">
              {addons.map((a) => (
                <li key={a.id} className="flex justify-between">
                  <span>
                    {a.name} × {a.qty}
                  </span>
                  <span>{formatUSD(a.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2">
          <Row label="Subtotal (tickets)" value={formatUSD(ticketsSubtotal)} />
          <Row label="Booking fee (5%)" value={formatUSD(bookingFee)} />
          {promoObj && <Row label={`Promo (${promoObj.code})`} value={`- ${formatUSD(promoDisc)}`} />}
          <Row label="Add-ons subtotal" value={formatUSD(merchSubtotal)} />
          <div className="mt-2 flex justify-between">
            <span className="text-zinc-100">Total</span>
            <span className="font-bold">{formatUSD(total)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onHome}
        className="rounded-xl border border-red-600 bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
      >
        Back to Home
      </button>
    </div>
  );
}
