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
            const res = await api.get("/books");
            let filtered = res.data;

            if (!search.trim()) {
                setBooks(filtered);
                return;
            }

            if (searchType === "id") {
                filtered = filtered.filter((b) =>
                    String(b.id).includes(search)
                );
            }

            if (searchType === "isbn") {
                filtered = filtered.filter((b) =>
                    b.isbn.includes(search)
                );
            }

            if (searchType === "title") {
                filtered = filtered.filter((b) =>
                    b.title.toLowerCase().includes(search.toLowerCase())
                );
            }

            setBooks(filtered);
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
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="title">Buscar por Título</option>
                        <option value="isbn">Buscar por ISBN</option>
                        <option value="id">Buscar por ID</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Digite sua busca"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button className="btn-primary" onClick={handleSearch}>
                        Buscar
                    </button>

                    <button className="btn-secondary" onClick={loadBooks}>
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
                            <small>{book.author?.name}</small>
                            <small>ISBN: {book.isbn}</small>

                            <span
                                className={`status ${
                                    book.available ? "available" : "unavailable"
                                }`}
                            >
                                {book.available ? "Disponível" : "Emprestado"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}