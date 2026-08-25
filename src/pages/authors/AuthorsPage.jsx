import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";

export default function AuthorsPage() {
    const [authors, setAuthors] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAuthors = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/authors");
            setAuthors(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar autores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial data fetch intentionally synchronizes the page with the API.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAuthors();
    }, []);

    const filteredAuthors = useMemo(() => {
        const value = filter.toLowerCase().trim();

        if (!value) return authors;

        return authors.filter((author) => {
            return (
                author.name?.toLowerCase().includes(value) ||
                author.nationality?.toLowerCase().includes(value) ||
                String(author.id).includes(value)
            );
        });
    }, [authors, filter]);

    return (
        <div className="page-content">
            <div className="page-header page-header-inline">
                <div>
                    <h1>Autores</h1>
                    <p>Gerencie e consulte os autores cadastrados</p>
                </div>

                <Link to="/authors/new">
                    <button className="btn-primary">+ Novo Autor</button>
                </Link>
            </div>

            <div className="card search-card">
                <input
                    type="text"
                    placeholder="Buscar por nome, nacionalidade ou ID"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {loading && <p>Carregando autores...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && filteredAuthors.length === 0 && (
                <div className="empty-state">
                    <h3>Nenhum autor encontrado</h3>
                    <p>Tente outro termo ou cadastre um novo autor.</p>
                </div>
            )}

            {!loading && !error && filteredAuthors.length > 0 && (
                <div className="author-grid">
                    {filteredAuthors.map((author) => (
                        <div className="author-card" key={author.id}>
                            <div className="author-card-top">
                                <span className="author-badge">#{author.id}</span>
                            </div>

                            <h3>{author.name}</h3>
                            <p>{author.nationality}</p>

                            <div className="author-meta">
                                <span>Autor cadastrado</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
