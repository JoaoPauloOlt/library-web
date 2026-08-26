import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";
import "./dashboard.css";

const pageContent = (data) => data?.content ?? [];

function BookCover({ book, className = "dashboard-book-cover" }) {
    return (
        <div className={className}>
            {book?.coverUrl ? (
                <img src={book.coverUrl} alt={`Capa de ${book.title}`} loading="lazy" />
            ) : (
                <span aria-hidden="true">▣</span>
            )}
        </div>
    );
}

function authorsOf(book) {
    return book?.authors?.map((author) => author.name).join(", ") || "Autor não informado";
}

function loanAuthors(loan) {
    return loan?.bookAuthors?.join(", ") || "Autor não informado";
}

function loanStatus(loan) {
    if (loan.status === "REQUESTED") return { label: "Aguardando", tone: "pending" };
    if (loan.status === "ACTIVE" || loan.status === "LATE") {
        const overdue = loan.dueDate && new Date(loan.dueDate).getTime() < Date.now();
        return overdue || loan.status === "LATE"
            ? { label: "Atrasado", tone: "danger" }
            : { label: "No prazo", tone: "success" };
    }
    return { label: loan.status || "—", tone: "neutral" };
}

function formatDueDate(date) {
    if (!date) return "Data de devolução não definida";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
}

export default function HomePage() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                const [booksRes, loansRes] = await Promise.all([
                    api.get("/books", { params: { size: 1000, sort: "createdAt,desc" } }),
                    api.get("/loans/my", { params: { size: 100, sort: "requestDate,desc" } }),
                ]);

                if (!active) return;
                setBooks(pageContent(booksRes.data));
                setLoans(pageContent(loansRes.data));
                setError("");
            } catch (err) {
                if (active) {
                    setError(err.response?.data?.detail || "Não foi possível carregar o painel");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();
        return () => { active = false; };
    }, []);

    const popularBooks = useMemo(
        () => [...books]
            .filter((book) => Number(book.loanCount ?? 0) > 0)
            .sort((a, b) => Number(b.loanCount ?? 0) - Number(a.loanCount ?? 0))
            .slice(0, 5),
        [books]
    );

    const highlightedBooks = useMemo(
        () => [...books]
            .filter((book) => Number(book.availableCopies ?? 0) > 0)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5),
        [books]
    );

    const activeLoans = useMemo(
        () => loans
            .filter((loan) => !["RETURNED", "CANCELED", "CANCELLED"].includes(loan.status))
            .slice(0, 5),
        [loans]
    );

    return (
        <div className="page-content dashboard-page">
            <div className="dashboard-hero">
                <div>
                    <span className="eyebrow">PAINEL DA BIBLIOTECA</span>
                    <h1>Olá, {user?.name || "usuário"}.</h1>
                    <p>Consulte o acervo, acompanhe seus empréstimos e encontre seu próximo livro.</p>
                </div>
                <Link className="btn-primary" to="/books">Explorar livros</Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="dashboard-home-grid">
                <section className="dashboard-panel home-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">POPULARIDADE</span>
                            <h2>Livros mais emprestados</h2>
                        </div>
                        <Link to="/books">Ver todos</Link>
                    </div>

                    {loading ? (
                        <div className="dashboard-loading">Carregando...</div>
                    ) : popularBooks.length === 0 ? (
                        <div className="empty-state compact">Ainda não há dados de empréstimos.</div>
                    ) : (
                        <div className="popular-list">
                            {popularBooks.map((book, index) => (
                                <Link className="popular-item" to={`/books/${book.id}`} key={book.id}>
                                    <span className="popular-position">{index + 1}</span>
                                    <BookCover book={book} className="dashboard-book-cover ranking-cover" />
                                    <div className="book-list-info">
                                        <strong>{book.title}</strong>
                                        <span>{authorsOf(book)}</span>
                                    </div>
                                    <strong className="loan-count">{book.loanCount}</strong>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-panel home-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">ACERVO</span>
                            <h2>Destaques disponíveis</h2>
                        </div>
                        <Link to="/books">Ver todos</Link>
                    </div>

                    {loading ? (
                        <div className="dashboard-loading">Carregando...</div>
                    ) : highlightedBooks.length === 0 ? (
                        <div className="empty-state compact">Nenhum livro disponível no momento.</div>
                    ) : (
                        <div className="highlight-list">
                            {highlightedBooks.slice(0, 3).map((book) => (
                                <Link className="highlight-item" to={`/books/${book.id}`} key={book.id}>
                                    <BookCover book={book} className="dashboard-book-cover highlight-cover" />
                                    <div className="book-list-info">
                                        <strong>{book.title}</strong>
                                        <span>{authorsOf(book)}</span>
                                        <small>{book.availableCopies} disponível(is)</small>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-panel home-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">CIRCULAÇÃO</span>
                            <h2>Meus empréstimos</h2>
                        </div>
                        <Link to="/loans">Ver todos</Link>
                    </div>

                    {loading ? (
                        <div className="dashboard-loading">Carregando...</div>
                    ) : activeLoans.length === 0 ? (
                        <div className="empty-state compact">Você não possui empréstimos ativos.</div>
                    ) : (
                        <div className="loan-list">
                            {activeLoans.map((loan) => {
                                const status = loanStatus(loan);
                                return (
                                    <Link className="loan-item" to="/loans" key={loan.id}>
                                        <div className="dashboard-book-cover loan-cover">
                                            {loan.bookCoverUrl ? (
                                                <img src={loan.bookCoverUrl} alt={`Capa de ${loan.bookTitle}`} loading="lazy" />
                                            ) : (
                                                <span aria-hidden="true">▣</span>
                                            )}
                                        </div>
                                        <div className="book-list-info">
                                            <strong>{loan.bookTitle || "Livro sem título"}</strong>
                                            <span>{loanAuthors(loan)}</span>
                                            <small>Data de devolução: {formatDueDate(loan.dueDate)}</small>
                                        </div>
                                        <span className={`loan-status ${status.tone}`}>{status.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
