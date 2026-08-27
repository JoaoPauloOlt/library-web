import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";

const emptyPage = { content: [], page: 0, totalPages: 0, totalElements: 0 };
const CLOSED_STATUSES = ["RETURNED", "CANCELED"];

const statusLabel = {
    REQUESTED: "Solicitado",
    ACTIVE: "Ativo",
    RETURNED: "Devolvido",
    LATE: "Atrasado",
    CANCELED: "Cancelado"
};

export default function LoansPage({ showAll = false }) {
    const { hasPermission } = useAuth();
    const canReadAll = hasPermission("LOAN_READ_ALL");
    const canCreate = hasPermission("LOAN_CREATE");
    const canApprove = hasPermission("LOAN_APPROVE");
    const canReturn = hasPermission("LOAN_RETURN");
    const canCancel = hasPermission("LOAN_CANCEL");
    const canWithdraw = hasPermission("LOAN_WITHDRAW");

    const [loansPage, setLoansPage] = useState(emptyPage);
    const [booksPage, setBooksPage] = useState(emptyPage);
    const [bookId, setBookId] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const loanRequest = showAll
                ? api.get("/loans", { params: { page: 0, size: 100, sort: "createdAt,desc" } })
                : api.get("/loans/my", { params: { page: 0, size: 100, sort: "createdAt,desc" } });

            const requests = [loanRequest];
            if (canCreate) {
                requests.push(api.get("/books", { params: { page: 0, size: 100, sort: "title,asc" } }));
            }

            const [loansRes, booksRes] = await Promise.all(requests);
            setLoansPage(loansRes.data);
            if (booksRes) setBooksPage(booksRes.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar empréstimos");
        } finally {
            setLoading(false);
        }
    }, [canCreate, showAll]);

    useEffect(() => {
        // Initial/API synchronization is intentionally performed from the effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const visibleLoans = useMemo(() => {
        const value = search.trim().toLowerCase();
        return (loansPage.content ?? [])
            .filter((loan) => !CLOSED_STATUSES.includes(loan.status))
            .filter((loan) => {
                if (!value) return true;
                return [loan.bookTitle, loan.userName, loan.status]
                    .filter(Boolean)
                    .some((field) => field.toLowerCase().includes(value));
            });
    }, [loansPage.content, search]);

    const availableBooks = (booksPage.content ?? []).filter(
        (book) => (book.availableCopies ?? 0) > 0
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!bookId) return;

        try {
            setSubmitting(true);
            setError("");
            await api.post("/loans", { bookId: Number(bookId) });
            setBookId("");
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao solicitar empréstimo");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            setError("");
            await api.put(`/loans/${id}/${action}`);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || "Não foi possível atualizar o empréstimo");
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <span className="eyebrow">CIRCULAÇÃO</span>
                <h1>{showAll ? "Empréstimos (Todos)" : "Meus empréstimos"}</h1>
                <p>
                    {showAll
                        ? "Pesquise e gerencie os empréstimos em andamento da biblioteca."
                        : "Acompanhe suas solicitações e empréstimos em andamento."}
                </p>
            </div>

            {!showAll && canCreate && (
                <section className="card loan-request-card">
                    <div className="panel-heading">
                        <div>
                            <span className="eyebrow">NOVA SOLICITAÇÃO</span>
                            <h2>Solicitar um livro</h2>
                        </div>
                    </div>
                    <form className="loan-request-form" onSubmit={handleSubmit}>
                        <select value={bookId} onChange={(event) => setBookId(event.target.value)}>
                            <option value="">Selecione um livro disponível</option>
                            {availableBooks.map((book) => (
                                <option key={book.id} value={book.id}>
                                    {book.title} — {book.availableCopies} disponível(is)
                                </option>
                            ))}
                        </select>
                        <button className="btn-primary" type="submit" disabled={!bookId || submitting}>
                            {submitting ? "Solicitando..." : "Solicitar empréstimo"}
                        </button>
                    </form>
                </section>
            )}

            <div className="card">
                <div className="loan-list-heading">
                    <div>
                        <h2>{showAll ? "Todos os ativos" : "Em andamento"}</h2>
                        <span>{visibleLoans.length} registro(s)</span>
                    </div>
                    {showAll && canReadAll && (
                        <input
                            className="loan-search"
                            placeholder="Buscar por livro, usuário ou status"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    )}
                </div>

                {error && <p className="error-text">{error}</p>}
                {loading && <p>Carregando empréstimos...</p>}
                {!loading && visibleLoans.length === 0 && (
                    <div className="empty-state compact">Nenhum empréstimo ativo encontrado.</div>
                )}

                <div className="loan-list">
                    {visibleLoans.map((loan) => (
                        <article className="loan-row" key={loan.id}>
                            <div>
                                <span className="eyebrow">#{loan.id}</span>
                                <h3>{loan.bookTitle}</h3>
                                {showAll && <p>Usuário: {loan.userName}</p>}
                                <p>Status: <strong>{statusLabel[loan.status] || loan.status}</strong></p>
                                {loan.dueDate && (
                                    <p>Prazo: {new Date(loan.dueDate).toLocaleDateString("pt-BR")}</p>
                                )}
                            </div>

                            <div className="loan-actions">
                                <span className={`status ${loan.status === "LATE" ? "unavailable" : "active"}`}>
                                    {statusLabel[loan.status] || loan.status}
                                </span>
                                {showAll && canApprove && loan.status === "REQUESTED" && (
                                    <button className="btn-primary" onClick={() => handleAction(loan.id, "approve")}>
                                        Aprovar
                                    </button>
                                )}
                                {canReturn && ["ACTIVE", "LATE"].includes(loan.status) && (
                                    <button className="btn-secondary" onClick={() => handleAction(loan.id, "return")}>
                                        Devolver
                                    </button>
                                )}
                                {canCancel && loan.status === "REQUESTED" && (
                                    <button className="btn-secondary" onClick={() => handleAction(loan.id, "cancel")}>
                                        Cancelar
                                    </button>
                                )}
                                {!showAll && canWithdraw && loan.status === "REQUESTED" && (
                                    <button className="btn-secondary" onClick={() => handleAction(loan.id, "withdraw")}>
                                        Retirar solicitação
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
