import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";

const pageContent = (data) => data?.content ?? [];

export default function HomePage() {
    const { user, hasPermission } = useAuth();
    const canReadAllLoans = hasPermission("LOAN_READ_ALL");

    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                setLoading(true);
                const requests = [
                    api.get("/books", { params: { size: 100, sort: "title,asc" } }),
                    api.get("/authors", { params: { size: 100, sort: "name,asc" } }),
                    canReadAllLoans
                        ? api.get("/loans", { params: { size: 100, sort: "requestDate,desc" } })
                        : api.get("/loans/my", { params: { size: 100, sort: "requestDate,desc" } })
                ];

                const [booksRes, authorsRes, loansRes] = await Promise.all(requests);

                if (active) {
                    setBooks(pageContent(booksRes.data));
                    setAuthors(pageContent(authorsRes.data));
                    setLoans(pageContent(loansRes.data));
                    setError("");
                }
            } catch (err) {
                if (active) {
                    setError(err.response?.data?.detail || "Não foi possível carregar o painel");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, [canReadAllLoans]);

    const activeLoans = useMemo(
        () => loans.filter((loan) => !["RETURNED", "CANCELLED"].includes(loan.status)),
        [loans]
    );

    const mostBorrowed = useMemo(() => {
        if (!canReadAllLoans) return [];

        const counts = loans.reduce((acc, loan) => {
            if (loan.bookTitle) {
                acc[loan.bookTitle] = (acc[loan.bookTitle] || 0) + 1;
            }
            return acc;
        }, {});

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    }, [canReadAllLoans, loans]);

    const availableBooks = books.filter((book) => (book.availableCopies ?? 0) > 0).slice(0, 5);

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

            <div className="stat-grid">
                <div className="stat-card">
                    <span>Livros no acervo</span>
                    <strong>{loading ? "—" : books.length}</strong>
                    <small>Disponíveis para consulta</small>
                </div>
                <div className="stat-card">
                    <span>Autores</span>
                    <strong>{loading ? "—" : authors.length}</strong>
                    <small>Autores cadastrados</small>
                </div>
                <div className="stat-card">
                    <span>{canReadAllLoans ? "Empréstimos ativos" : "Meus empréstimos"}</span>
                    <strong>{loading ? "—" : activeLoans.length}</strong>
                    <small>{canReadAllLoans ? "Em toda a biblioteca" : "Em andamento"}</small>
                </div>
            </div>

            <div className="dashboard-grid">
                <section className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">ACERVO</span>
                            <h2>Destaques disponíveis</h2>
                        </div>
                        <Link to="/books">Ver todos</Link>
                    </div>

                    {availableBooks.length === 0 && !loading ? (
                        <div className="empty-state compact">Nenhum livro disponível no momento.</div>
                    ) : (
                        <div className="mini-book-list">
                            {availableBooks.map((book) => (
                                <Link to="/books" className="mini-book" key={book.id}>
                                    <div className="mini-book-cover">▣</div>
                                    <div>
                                        <strong>{book.title}</strong>
                                        <span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span>
                                        <small>{book.availableCopies} disponível(is)</small>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-panel">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">CIRCULAÇÃO</span>
                            <h2>{canReadAllLoans ? "Mais emprestados" : "Meus empréstimos"}</h2>
                        </div>
                        <Link to={canReadAllLoans ? "/history" : "/loans"}>Ver detalhes</Link>
                    </div>

                    {canReadAllLoans ? (
                        mostBorrowed.length > 0 ? (
                            <div className="ranking-list">
                                {mostBorrowed.map(([title, count], index) => (
                                    <div className="ranking-item" key={title}>
                                        <span className="ranking-position">0{index + 1}</span>
                                        <strong>{title}</strong>
                                        <span>{count} empréstimo(s)</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state compact">Ainda não há dados de empréstimos.</div>
                        )
                    ) : (
                        <div className="loan-summary-list">
                            {activeLoans.slice(0, 5).map((loan) => (
                                <div className="loan-summary" key={loan.id}>
                                    <strong>{loan.bookTitle}</strong>
                                    <span>{loan.status}</span>
                                </div>
                            ))}
                            {activeLoans.length === 0 && !loading && (
                                <div className="empty-state compact">Você não possui empréstimos ativos.</div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
