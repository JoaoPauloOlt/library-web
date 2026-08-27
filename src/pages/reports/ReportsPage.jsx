import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/axios";

const REPORTS = {
    "most-borrowed": {
        eyebrow: "RELATÓRIOS",
        title: "Livros Mais Emprestados",
        description: "Ranking dos livros com maior número de empréstimos registrados.",
        icon: "▥"
    },
    recommended: {
        eyebrow: "RELATÓRIOS",
        title: "Recomendados",
        description: "Livros disponíveis para destaque no catálogo da biblioteca.",
        icon: "★"
    },
    categories: {
        eyebrow: "RELATÓRIOS",
        title: "Livros por Categoria",
        description: "Distribuição do acervo por categoria literária.",
        icon: "▤"
    },
    "active-users": {
        eyebrow: "RELATÓRIOS",
        title: "Usuários Ativos",
        description: "Usuários com empréstimos atualmente em andamento.",
        icon: "♙"
    }
};

const CLOSED_STATUSES = ["RETURNED", "CANCELED"];

const genreLabel = (genre) => {
    if (!genre) return "Sem categoria";
    return genre
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function ReportsPage({ type }) {
    const report = REPORTS[type] ?? REPORTS["most-borrowed"];
    const [books, setBooks] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReportData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const needsLoans = type === "most-borrowed" || type === "active-users";
            const requests = [api.get("/books", { params: { page: 0, size: 100, sort: "title,asc" } })];

            if (needsLoans) {
                requests.push(api.get("/loans", { params: { page: 0, size: 100, sort: "createdAt,desc" } }));
            }

            const [booksRes, loansRes] = await Promise.all(requests);
            setBooks(booksRes.data ?? []);
            setLoans(loansRes?.data ?? []);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar relatório");
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        // Initial/API synchronization is intentionally performed from the effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadReportData();
    }, [loadReportData]);

    const borrowedRanking = useMemo(() => {
        const counts = new Map();
        loans.forEach((loan) => {
            if (!loan.bookTitle) return;
            counts.set(loan.bookTitle, (counts.get(loan.bookTitle) ?? 0) + 1);
        });

        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, 10);
    }, [loans]);

    const recommendations = useMemo(() => (
        [...books]
            .filter((book) => (book.availableCopies ?? 0) > 0)
            .sort((a, b) => (b.availableCopies ?? 0) - (a.availableCopies ?? 0) || a.title.localeCompare(b.title))
            .slice(0, 5)
    ), [books]);

    const categories = useMemo(() => {
        const counts = new Map();
        books.forEach((book) => {
            const label = genreLabel(book.genre);
            counts.set(label, (counts.get(label) ?? 0) + 1);
        });
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [books]);

    const activeUsers = useMemo(() => {
        const counts = new Map();
        loans
            .filter((loan) => !CLOSED_STATUSES.includes(loan.status))
            .forEach((loan) => {
                if (!loan.userName) return;
                counts.set(loan.userName, (counts.get(loan.userName) ?? 0) + 1);
            });
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [loans]);

    const renderContent = () => {
        if (loading) return <div className="empty-state">Carregando relatório...</div>;
        if (error) return <div className="empty-state"><p className="error-text">{error}</p></div>;

        if (type === "most-borrowed") {
            return borrowedRanking.length ? (
                <div className="report-ranking">
                    {borrowedRanking.map(([title, count], index) => (
                        <article className="report-ranking-row" key={title}>
                            <span className="report-rank">{index + 1}</span>
                            <div>
                                <strong>{title}</strong>
                                <span>{count} empréstimo(s)</span>
                            </div>
                        </article>
                    ))}
                </div>
            ) : <div className="empty-state">Nenhum empréstimo registrado.</div>;
        }

        if (type === "recommended") {
            return recommendations.length ? (
                <div className="report-book-grid">
                    {recommendations.map((book) => (
                        <article className="report-book-card" key={book.id}>
                            {book.coverUrl ? <img src={book.coverUrl} alt={`Capa de ${book.title}`} /> : <div className="book-cover-placeholder">▣</div>}
                            <div>
                                <h3>{book.title}</h3>
                                <p>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</p>
                                <span>{book.availableCopies} disponível(is)</span>
                            </div>
                        </article>
                    ))}
                </div>
            ) : <div className="empty-state">Nenhum livro disponível para recomendação.</div>;
        }

        if (type === "categories") {
            return categories.length ? (
                <div className="report-category-list">
                    {categories.map(([category, count]) => (
                        <article className="report-category-row" key={category}>
                            <div><strong>{category}</strong><span>{count} livro(s)</span></div>
                            <div className="report-category-bar"><span style={{ width: `${Math.max(8, (count / categories[0][1]) * 100)}%` }} /></div>
                        </article>
                    ))}
                </div>
            ) : <div className="empty-state">Nenhum livro cadastrado.</div>;
        }

        return activeUsers.length ? (
            <div className="report-ranking">
                {activeUsers.map(([name, count], index) => (
                    <article className="report-ranking-row" key={name}>
                        <span className="report-rank">{index + 1}</span>
                        <div><strong>{name}</strong><span>{count} empréstimo(s) em andamento</span></div>
                    </article>
                ))}
            </div>
        ) : <div className="empty-state">Nenhum usuário com empréstimo ativo.</div>;
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <span className="eyebrow">{report.eyebrow}</span>
                <h1>{report.title}</h1>
                <p>{report.description}</p>
            </div>

            <section className="card report-panel">
                <div className="panel-heading">
                    <div>
                        <span className="report-icon" aria-hidden="true">{report.icon}</span>
                        <h2>{report.title}</h2>
                    </div>
                </div>
                {renderContent()}
            </section>
        </div>
    );
}
