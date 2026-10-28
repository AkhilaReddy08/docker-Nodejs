const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- In-memory data ----------
const movies = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi",
    showtime: "2024-05-01T18:30:00Z",
    price: 12.5,
    seatMap: { A1:"available",A2:"available",A3:"available",A4:"available",
               B1:"available",B2:"available",B3:"available",B4:"available" }
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action",
    showtime: "2024-05-01T21:00:00Z",
    price: 14.0,
    seatMap: { A1:"available",A2:"available",A3:"available",A4:"available",
               B1:"available",B2:"available",B3:"available",B4:"available" }
  }
];

const bookings = [];

// ---------- Routes ----------
app.get("/api/movies", (req, res) => {
  res.json({ movies });
});

app.get("/api/movies/:id", (req, res) => {
  const movie = movies.find(m => m.id === Number(req.params.id));
  if (!movie) return res.status(404).json({ error: "Movie not found" });
  res.json({ movie });
});

app.post("/api/movies/:id/book", (req, res) => {
  const { customerName, email, seats } = req.body;
  if (!customerName || !email || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "customerName, email and seats[] required" });
  }

  const movie = movies.find(m => m.id === Number(req.params.id));
  if (!movie) return res.status(404).json({ error: "Movie not found" });

  const taken = seats.filter(s => movie.seatMap[s] === "booked");
  if (taken.length) {
    return res.status(409).json({ error: `Seats already booked: ${taken.join(", ")}` });
  }

  seats.forEach(s => { movie.seatMap[s] = "booked"; });

  const booking = {
    bookingId: "BK" + Date.now(),
    movieId: movie.id,
    movieTitle: movie.title,
    customerName,
    email,
    seats,
    totalPrice: seats.length * movie.price,
    bookedAt: new Date().toISOString()
  };
  bookings.push(booking);

  res.status(201).json({ message: "Booking confirmed", booking });
});

app.get("/api/bookings", (req, res) => {
  res.json({ bookings });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🎬 Movie Booking App on http://localhost:${PORT}`);
});
