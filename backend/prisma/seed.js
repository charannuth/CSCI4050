"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const db_1 = require("../src/db");
function daysFromNow(days, hour, minute) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d;
}
async function main() {
    await db_1.prisma.showtime.deleteMany();
    await db_1.prisma.movie.deleteMany();
    const movies = [
        {
            title: "Neon Horizon",
            rating: "PG-13",
            description: "A hacker stumbles into a city-wide conspiracy in a near-future metro.",
            genre: "Sci-Fi",
            status: client_1.MovieStatus.CURRENTLY_RUNNING,
            posterUrl: "https://picsum.photos/seed/neon-horizon/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Maple Street Mystery",
            rating: "PG",
            description: "A neighborhood’s annual block party takes an unexpected turn.",
            genre: "Mystery",
            status: client_1.MovieStatus.CURRENTLY_RUNNING,
            posterUrl: "https://picsum.photos/seed/maple-street/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Summer Encore",
            rating: "PG-13",
            description: "A touring musician returns home for one last show—and one last chance.",
            genre: "Drama",
            status: client_1.MovieStatus.CURRENTLY_RUNNING,
            posterUrl: "https://picsum.photos/seed/summer-encore/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "The Last Lantern",
            rating: "PG",
            description: "A young inventor finds a lantern that reveals hidden paths.",
            genre: "Adventure",
            status: client_1.MovieStatus.CURRENTLY_RUNNING,
            posterUrl: "https://picsum.photos/seed/last-lantern/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Cafeteria Royale",
            rating: "PG-13",
            description: "A lunchroom rivalry escalates into an all-out culinary showdown.",
            genre: "Comedy",
            status: client_1.MovieStatus.CURRENTLY_RUNNING,
            posterUrl: "https://picsum.photos/seed/cafeteria-royale/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Midnight Station",
            rating: "R",
            description: "A late-night commuter train becomes a maze of choices and consequences.",
            genre: "Thriller",
            status: client_1.MovieStatus.CURRENTLY_RUNNING,
            posterUrl: "https://picsum.photos/seed/midnight-station/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Skyline Hearts",
            rating: "PG-13",
            description: "Two architects compete for a project and find something unexpected.",
            genre: "Romance",
            status: client_1.MovieStatus.COMING_SOON,
            posterUrl: "https://picsum.photos/seed/skyline-hearts/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Dragonfruit Protocol",
            rating: "PG-13",
            description: "A codebreaker races to stop a cascading system failure.",
            genre: "Action",
            status: client_1.MovieStatus.COMING_SOON,
            posterUrl: "https://picsum.photos/seed/dragonfruit-protocol/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Orbit of Ash",
            rating: "PG-13",
            description: "A rescue mission to a damaged station uncovers an impossible signal.",
            genre: "Sci-Fi",
            status: client_1.MovieStatus.COMING_SOON,
            posterUrl: "https://picsum.photos/seed/orbit-of-ash/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Garden of Glass",
            rating: "PG",
            description: "A botanist learns the greenhouse has a mind of its own.",
            genre: "Fantasy",
            status: client_1.MovieStatus.COMING_SOON,
            posterUrl: "https://picsum.photos/seed/garden-of-glass/500/750",
            trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    ];
    for (const [idx, m] of movies.entries()) {
        const created = await db_1.prisma.movie.create({
            data: {
                ...m,
                showtimes: {
                    create: [
                        { startsAt: daysFromNow(idx % 3, 14, 0) },
                        { startsAt: daysFromNow(idx % 3, 17, 0) },
                        { startsAt: daysFromNow(idx % 3, 20, 0) }
                    ]
                }
            }
        });
        // eslint-disable-next-line no-console
        console.log(`Seeded movie: ${created.title}`);
    }
}
main()
    .then(async () => db_1.prisma.$disconnect())
    .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await db_1.prisma.$disconnect();
    process.exit(1);
});
