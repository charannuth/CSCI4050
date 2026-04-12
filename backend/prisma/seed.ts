import "dotenv/config";
import { PrismaClient, MovieStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import process from "process";

const prisma = new PrismaClient();

// Helper to generate dynamic showtimes so you always have upcoming dates
function daysFromNow(days: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create the 3 Required Showrooms (Auditoriums) for Deliverable 7
  const theater1 = await prisma.auditorium.create({
    data: { name: "Theater 1 - Standard", capacity: 30 },
  });
  const theater2 = await prisma.auditorium.create({
    data: { name: "Theater 2 - IMAX", capacity: 50 },
  });
  const theater3 = await prisma.auditorium.create({
    data: { name: "Theater 3 - VIP Deluxe", capacity: 20 },
  });
  console.log("✅ Created 3 Showrooms");

  const theaters = [theater1, theater2, theater3];

  // 2. The Original 10-Movie Catalog (Updated with Sprint 3 Fields)
  const movies = [
    {
      title: "Dune: Part Two",
      rating: "PG-13",
      description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      genre: "Sci-Fi",
      status: MovieStatus.CURRENTLY_RUNNING,
      posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
      trailerUrl: "https://www.youtube.com/embed/8g18jFHCLXk",
      cast: "Timothée Chalamet, Zendaya",
      director: "Denis Villeneuve",
      producer: "Mary Parent"
    },
    {
      title: "The Batman",
      rating: "PG-13",
      description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
      genre: "Action",
      status: MovieStatus.CURRENTLY_RUNNING,
      posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4",
      cast: "Robert Pattinson, Zoë Kravitz",
      director: "Matt Reeves",
      producer: "Dylan Clark"
    },
    {
      title: "Everything Everywhere All at Once",
      rating: "R",
      description: "An aging Chinese immigrant is swept into an adventure in which she must connect different versions of herself in the parallel universe.",
      genre: "Comedy",
      status: MovieStatus.CURRENTLY_RUNNING,
      posterUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
      trailerUrl: "https://www.youtube.com/embed/wxN1T1uxQ2g",
      cast: "Michelle Yeoh, Ke Huy Quan",
      director: "Daniel Kwan, Daniel Scheinert",
      producer: "Jonathan Wang"
    },
    {
      title: "Top Gun: Maverick",
      rating: "PG-13",
      description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on a mission.",
      genre: "Action",
      status: MovieStatus.CURRENTLY_RUNNING,
      posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
      trailerUrl: "https://www.youtube.com/embed/qSqVVswa420",
      cast: "Tom Cruise, Miles Teller",
      director: "Joseph Kosinski",
      producer: "Jerry Bruckheimer"
    },
    {
      title: "Oppenheimer",
      rating: "R",
      description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      genre: "Drama",
      status: MovieStatus.CURRENTLY_RUNNING,
      posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
      cast: "Cillian Murphy, Emily Blunt",
      director: "Christopher Nolan",
      producer: "Emma Thomas"
    },
    {
      title: "Spider-Man: No Way Home",
      rating: "PG-13",
      description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
      genre: "Action",
      status: MovieStatus.CURRENTLY_RUNNING,
      posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
      trailerUrl: "https://www.youtube.com/embed/JfVOs4VSpmA",
      cast: "Tom Holland, Zendaya",
      director: "Jon Watts",
      producer: "Kevin Feige"
    },
    {
      title: "Barbie",
      rating: "PG-13",
      description: "Barbie suffers a crisis that leads her to question her world and her existence.",
      genre: "Comedy",
      status: MovieStatus.COMING_SOON,
      posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      trailerUrl: "https://www.youtube.com/embed/pBk4NYhWNMM",
      cast: "Margot Robbie, Ryan Gosling",
      director: "Greta Gerwig",
      producer: "David Heyman"
    },
    {
      title: "Black Panther: Wakanda Forever",
      rating: "PG-13",
      description: "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of King T'Challa.",
      genre: "Action",
      status: MovieStatus.COMING_SOON,
      posterUrl: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
      trailerUrl: "https://www.youtube.com/embed/RlOB3UALvrQ",
      cast: "Letitia Wright, Lupita Nyong'o",
      director: "Ryan Coogler",
      producer: "Kevin Feige"
    },
    {
      title: "Inception",
      rating: "PG-13",
      description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genre: "Sci-Fi",
      status: MovieStatus.COMING_SOON,
      posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
      trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
      cast: "Leonardo DiCaprio, Joseph Gordon-Levitt",
      director: "Christopher Nolan",
      producer: "Emma Thomas"
    },
    {
      title: "La La Land",
      rating: "PG-13",
      description: "A jazz pianist falls for an aspiring actress in Los Angeles.",
      genre: "Romance",
      status: MovieStatus.COMING_SOON,
      posterUrl: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      trailerUrl: "https://www.youtube.com/embed/0pdqf4P9MB8",
      cast: "Ryan Gosling, Emma Stone",
      director: "Damien Chazelle",
      producer: "Fred Berger"
    }
  ];

  for (const [idx, m] of movies.entries()) {
    const created = await prisma.movie.create({
      data: {
        ...m,
        // Schedule each movie dynamically across your 3 theaters
        showtimes: {
          create: [
            { startsAt: daysFromNow(idx % 3, 14, 0), auditoriumId: theaters[0].id },
            { startsAt: daysFromNow(idx % 3, 17, 0), auditoriumId: theaters[1].id },
            { startsAt: daysFromNow(idx % 3, 20, 0), auditoriumId: theaters[2].id }
          ]
        }
      }
    });
    console.log(`🎬 Seeded movie: ${created.title}`);
  }

  // 3. Create Users with secure passwords and Sprint 3 Opt-In flags
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@email.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: adminHash,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
      isSubscribed: true // Required for Sprint 3 Promo logic
    }
  });
  console.log(`👑 Seeded admin user: ${adminEmail} (password: ${adminPassword})`);

  const verifiedEmail = process.env.SEED_VERIFIED_USER_EMAIL ?? "user@email.com";
  const verifiedPassword = process.env.SEED_VERIFIED_USER_PASSWORD ?? "User123!";
  const verifiedHash = await bcrypt.hash(verifiedPassword, 12);

  await prisma.user.create({
    data: {
      email: verifiedEmail,
      password: verifiedHash,
      firstName: "Verified",
      lastName: "Customer",
      role: "CUSTOMER",
      status: "ACTIVE",
      isSubscribed: true // Required for Sprint 3 Promo logic
    }
  });
  console.log(`👤 Seeded verified user: ${verifiedEmail} (password: ${verifiedPassword})`);

  console.log("🎉 Seeding finished successfully!");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });