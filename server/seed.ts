import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Media from "./src/models/Media";

const seedMedia = [
  {
    title: "Inception",
    type: "movie",
    genre: "Sci-Fi",
    synopsis: "A thief enters dreams to steal secrets and is given a chance at redemption.",
    releaseYear: 2010,
    posterUrl: "https://image.tmdb.org/t/p/w1280/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
  },
  {
    title: "Interstellar",
    type: "movie",
    genre: "Sci-Fi",
    synopsis: "A team travels through a wormhole to save humanity.",
    releaseYear: 2014,
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    title: "The Dark Knight",
    type: "movie",
    genre: "Action",
    synopsis: "Batman faces the Joker in Gotham City.",
    releaseYear: 2008,
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    title: "Breaking Bad",
    type: "show",
    genre: "Crime",
    synopsis: "A chemistry teacher turns to making meth.",
    releaseYear: 2008,
    posterUrl: "https://image.tmdb.org/t/p/w1280/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
  },
  {
    title: "Stranger Things",
    type: "show",
    genre: "Sci-Fi",
    synopsis: "Kids uncover strange supernatural events in their town.",
    releaseYear: 2016,
    posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  },
  {
    title: "The Matrix",
    type: "movie",
    genre: "Sci-Fi",
    synopsis: "A hacker discovers reality is a simulation.",
    releaseYear: 1999,
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  },
  {
    title: "The Shawshank Redemption",
    type: "movie",
    genre: "Drama",
    synopsis: "Two imprisoned men form a lasting friendship.",
    releaseYear: 1994,
    posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
  },
  {
    title: "The Office",
    type: "show",
    genre: "Comedy",
    synopsis: "A mockumentary on a group of office workers.",
    releaseYear: 2005,
    posterUrl: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
  },
  {
    title: "Game of Thrones",
    type: "show",
    genre: "Fantasy",
    synopsis: "Noble families battle for control of the Iron Throne.",
    releaseYear: 2011,
    posterUrl: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
  },
  {
    title: "Parasite",
    type: "movie",
    genre: "Thriller",
    synopsis: "A poor family infiltrates a wealthy household.",
    releaseYear: 2019,
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },
  {
    title: "Avatar",
    type: "movie",
    genre: "Adventure",
    synopsis: "A marine joins the Na’vi on Pandora.",
    releaseYear: 2009,
    posterUrl: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  },
  {
    title: "Friends",
    type: "show",
    genre: "Comedy",
    synopsis: "Six friends navigate life and relationships in New York.",
    releaseYear: 1994,
    posterUrl: "https://image.tmdb.org/t/p/w500/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg",
  },
  {
    title: "The Mandalorian",
    type: "show",
    genre: "Sci-Fi",
    synopsis: "A bounty hunter travels through the galaxy.",
    releaseYear: 2019,
    posterUrl: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
  },
  {
    title: "Gladiator",
    type: "movie",
    genre: "Historical Drama",
    synopsis: "A Roman general seeks revenge after betrayal.",
    releaseYear: 2000,
    posterUrl: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
  },
  {
    title: "Wednesday",
    type: "show",
    genre: "Fantasy",
    synopsis: "Wednesday Addams investigates mysteries at Nevermore Academy.",
    releaseYear: 2022,
    posterUrl: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    await Media.deleteMany({});
    await Media.insertMany(seedMedia);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();