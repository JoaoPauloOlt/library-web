import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";

export default function BooksPage() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [error, setError] = useState("");

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setError("");
            const res = await api.get("/books");
            setBooks(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar livros");
        }
    };

    const handleSearch = async () => {
        try {
            setError("");
            const params = {};

            if (search.trim()) {
                if (searchType === "title") params.title = search.trim();
                if (searchType === "genre") params.genre = search.trim();
                if (searchType === "author") params.authorName = search.trim();
            }

            const res = await api.get("/books", { params });
            setBooks(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao buscar livros");
        }
    };

    return (
        <div className="page-content">
            <div className="page-header page-header-inline">
                <div>
                    <h1>Livros</h1>
                    <p>Gerencie o acervo da biblioteca</p>
                </div>

                <Link to="/books/new">
                    <button className="btn-primary">+ Novo Livro</button>
                </Link>
            </div>

            <div className="card">
                <div className="search-bar">
                    <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                        <option value="title">Buscar por Título</option>
                        <option value="genre">Buscar por Gênero</option>
                        <option value="author">Buscar por Autor</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Digite sua busca"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button className="btn-primary" onClick={handleSearch}>Buscar</button>
                    <button className="btn-secondary" onClick={() => {
                        setSearch("");
                        loadBooks();
                    }}>
                        Limpar
                    </button>
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            {!error && books.length === 0 && (
                <div className="empty-state">
                    <p>Nenhum livro encontrado.</p>
                </div>
            )}

            <div className="book-grid">
                {books.map((book) => (
                    <div className="book-card" key={book.id}>
                        <div className="book-cover">
                            <span>Sem capa</span>
                        </div>

                        <div className="book-info">
                            <h3>{book.title}</h3>
                            <p>{book.genre}</p>

                            {book.authors?.map((author) => (
                                <small key={author.id}>{author.name}</small>
                            ))}

                            <small>ISBN: {book.isbn}</small>
                            <small>Total: {book.totalCopies ?? 0}</small>
                            <small>Disponíveis: {book.availableCopies ?? 0}</small>

                            <span className={`status ${
                                (book.availableCopies ?? 0) > 0 ? "available" : "unavailable"
                            }`}>
                                {(book.availableCopies ?? 0) > 0 ? "Disponível" : "Indisponível"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
