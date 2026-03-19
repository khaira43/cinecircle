import { calculateMediaRating } from "../utils/calculateRating";
import { mockReviews } from "../mock/mockData";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMedia } from "../api/mediaApi";
import type { MediaItem } from "../types/media";

const Home = () => {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [genreFilter, setGenreFilter] = useState("All");

    useEffect(() => {
        const loadMedia = async () => {
            const result = await getMedia();
            setMedia(result);
        };

        void loadMedia();
    }, []);

    const genres = useMemo(() => {
        const uniqueGenres = Array.from(new Set(media.map((item) => item.genre)));
        return ["All", ...uniqueGenres];
    }, [media]);

    const filteredMedia = useMemo(() => {
        return media.filter((item) => {
            const matchesSearch = item.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase().trim());
            const matchesGenre = genreFilter === "All" || item.genre === genreFilter;
            return matchesSearch && matchesGenre;
        });
    }, [media, searchTerm, genreFilter]);

    return (
        <main className="page">
            <h1>Browse Movies & TV Shows</h1>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search title..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />

                <select
                    value={genreFilter}
                    onChange={(event) => setGenreFilter(event.target.value)}
                >
                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </div>

            {(searchTerm || genreFilter !== "All") && (
                <p className="result-count">
                    Showing {filteredMedia.length}{" "}
                    {filteredMedia.length === 1 ? "result" : "results"}
                </p>
            )}

            <section className="media-grid" aria-label="Media list">
                {filteredMedia.map((item) => {
                    const rating = calculateMediaRating(item.id, mockReviews);

                    return (
                        <Link to={`/media/${item.id}`} className="media-card" key={item.id}>
                            <img src={item.posterUrl} alt={`${item.title} poster`} />

                            <div className="media-card-body">
                                <h2>{item.title}</h2>

                                <span className="badge">{item.type}</span>

                                <p className="rating">
                                    ⭐ {rating ?? "N/A"} • {item.genre} • {item.releaseYear}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
};

export default Home;