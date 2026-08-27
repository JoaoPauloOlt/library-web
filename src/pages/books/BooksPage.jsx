import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";

const emptyPage = { content: [], page: 0, totalPages: 0, totalElements: 0 };

export default function BooksPage() {
    const { hasPermission } = useAuth();
    const canCreateBook = hasPermission("BOOK_CREATE");
    const [booksPage, setBooksPage] = useState(emptyPage);
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBooks = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const params = { page, size: 12, sort: "title,asc" };
            if (search.trim()) params[searchType === "author" ? "authorName" : searchType] = search.trim();
            const res = await api.get("/books", { params });
            setBooksPage(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar livros");
            setBooksPage(emptyPage);
        } finally {
            setLoading(false);
        }
    }, [page, search, searchType]);

    useEffect(() => {
        // API synchronization belongs in an effect because it is an external side effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBooks();
    }, [loadBooks]);

    const handleSearch = (event) => { event.preventDefault(); setPage(0); };
    const handleClear = () => { setSearch(""); setPage(0); };
    const books = booksPage.content ?? [];

    return (
        <div className="page-content">
            <div className="page-header page-header-inline">
                <div><span className="eyebrow">ACERVO</span><h1>Livros</h1><p>Explore o acervo e encontre livros disponíveis.</p></div>
                {canCreateBook && <Link className="btn-primary" to="/books/new">+ Novo Livro</Link>}
            </div>
            <form className="card search-bar" onSubmit={handleSearch}>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="title">Buscar por título</option><option value="genre">Buscar por gênero</option><option value="author">Buscar por autor</option>
                </select>
                <input type="text" placeholder="Digite sua busca" value={search} onChange={(e) => setSearch(e.target.value)} />
                <button className="btn-primary" type="submit">Buscar</button>
                <button className="btn-secondary" type="button" onClick={handleClear}>Limpar</button>
            </form>
            {error && <p className="error-text">{error}</p>}
            <div className="catalog-toolbar"><span>{booksPage.totalElements ?? 0} livro(s) encontrado(s)</span>{loading && <span>Carregando...</span>}</div>
            {!loading && !error && books.length === 0 && <div className="empty-state card">Nenhum livro encontrado.</div>}
            <div className="book-grid">
                {books.map((book) => (
                    <Link className="book-card" key={book.id} to={`/books/${book.id}`}>
                        <div className="book-cover">
                            {book.coverUrl ? <img src={book.coverUrl} alt={`Capa de ${book.title}`} loading="lazy" /> : <span>Sem capa</span>}
                        </div>
                        <div className="book-info">
                            <h3>{book.title}</h3>
                            <p>{book.genre || "Gênero não informado"}</p>
                            <small>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</small>
                            <small>ISBN: {book.isbn}</small>
                            <div className="book-meta-row">
                                <span>{book.totalCopies ?? 0} exemplar(es)</span>
                                <span className={`status ${(book.availableCopies ?? 0) > 0 ? "available" : "unavailable"}`}>
                                    {(book.availableCopies ?? 0) > 0 ? `${book.availableCopies} disponível(is)` : "Indisponível"}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {booksPage.totalPages > 1 && <div className="pagination">
                <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Anterior</button>
                <span>Página {page + 1} de {booksPage.totalPages}</span>
                <button className="btn-secondary" disabled={page + 1 >= booksPage.totalPages} onClick={() => setPage((current) => current + 1)}>Próxima</button>
            </div>}
        </div>
    );
}
