import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";

const emptyPage = {
    content: [],
    page: 0,
    totalPages: 0,
    totalElements: 0
};

export default function AuthorsPage() {
    const { hasPermission } = useAuth();
    const canCreateAuthor = hasPermission("AUTHOR_CREATE");

    const [authorsPage, setAuthorsPage] = useState(emptyPage);
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAuthors = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/authors", {
                params: {
                    page,
                    size: 12,
                    sort: "name,asc"
                }
            });

            setAuthorsPage(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar autores");
            setAuthorsPage(emptyPage);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        // Initial/API synchronization is intentionally performed from the effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAuthors();
    }, [loadAuthors]);

    const filteredAuthors = useMemo(() => {
        const value = filter.toLowerCase().trim();
        if (!value) return authorsPage.content ?? [];

        return (authorsPage.content ?? []).filter((author) => (
            author.name?.toLowerCase().includes(value) ||
            author.nationality?.toLowerCase().includes(value) ||
            String(author.id).includes(value)
        ));
    }, [authorsPage.content, filter]);

    return (
        <div className="page-content">
            <div className="page-header page-header-inline">
                <div>
                    <span className="eyebrow">ACERVO</span>
                    <h1>Autores</h1>
                    <p>Consulte os autores cadastrados na biblioteca.</p>
                </div>

                {canCreateAuthor && (
                    <Link className="btn-primary" to="/authors/new">+ Novo Autor</Link>
                )}
            </div>

            <div className="card search-card">
                <input
                    type="text"
                    placeholder="Filtrar esta página por nome, nacionalidade ou ID"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="catalog-toolbar">
                <span>{authorsPage.totalElements ?? 0} autor(es) cadastrado(s)</span>
                {loading && <span>Carregando...</span>}
            </div>

            {!loading && !error && filteredAuthors.length === 0 && (
                <div className="empty-state card">
                    Nenhum autor encontrado nesta página.
                </div>
            )}

            {!error && filteredAuthors.length > 0 && (
                <div className="author-grid">
                    {filteredAuthors.map((author) => (
                        <article className="author-card" key={author.id}>
                            <div className="author-card-top">
                                <span className="author-badge">#{author.id}</span>
                            </div>
                            <h3>{author.name}</h3>
                            <p>{author.nationality || "Nacionalidade não informada"}</p>
                            <div className="author-meta">
                                <span>Autor cadastrado</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {authorsPage.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn-secondary"
                        disabled={page === 0}
                        onClick={() => setPage((current) => current - 1)}
                    >
                        Anterior
                    </button>
                    <span>Página {page + 1} de {authorsPage.totalPages}</span>
                    <button
                        className="btn-secondary"
                        disabled={page + 1 >= authorsPage.totalPages}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
}
