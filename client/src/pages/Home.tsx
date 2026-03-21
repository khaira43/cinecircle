import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMedia } from "../api/mediaApi";
import type { MediaItem } from "../types/media";

const formatRating = (rating: number) => rating.toFixed(1);

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
            <section className="page-hero">
                <p className="eyebrow">Browse</p>
                <h1>Find your next movie night favorite.</h1>
                <p className="page-subtitle">
                    Explore community-reviewed movies and shows, then jump into the detail
                    page for live audience activity and review breakdowns.
                </p>
            </section>

            <div className="filters filters-panel">
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

            <section className="media-grid" aria-label="Media list">
                {filteredMedia.map((item) => (
                    <Link
                        to={`/media/${item._id}`}
                        className="media-card"
                        key={item._id}
                    >
                        <img src={item.posterUrl} alt={`${item.title} poster`} />
                        <div className="media-card-body">
                            <div className="media-card-header">
                                <h2>{item.title}</h2>
                                <span className="badge">{item.type}</span>
                            </div>

                            <p className="media-meta">
                                {item.genre} • {item.releaseYear}
                            </p>

                            <div className="rating-summary">
                                {item.averageRatings?.reviewCount &&
                                item.averageRatings.reviewCount > 0 ? (
                                    <>
                                        <p className="rating-score">
                                            ★ {formatRating(item.averageRatings.overall ?? 0)}
                                        </p>
                                        <p className="rating-count">
                                            ({item.averageRatings.reviewCount} reviews)
                                        </p>
                                    </>
                                ) : (
                                    <p className="rating-empty">No reviews yet</p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </section>
        </main>
    );
};

export default Home;