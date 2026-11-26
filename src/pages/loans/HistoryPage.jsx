import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/axios";
import { formatApiDate, formatApiDateTime } from "../../utils/dateTime.js";

const emptyPage = { content: [], page: 0, totalPages: 0, totalElements: 0 };

const statusLabel = {
    REQUESTED: "Solicitado",
    ACTIVE: "Ativo",
    RETURNED: "Devolvido",
    LATE: "Atrasado",
    CANCELED: "Cancelado"
};

const statusClass = {
    REQUESTED: "active",
    ACTIVE: "active",
    RETURNED: "finished",
    LATE: "unavailable",
    CANCELED: "finished"
};

const pageResponse = (response) => response?.data ?? emptyPage;

export default function HistoryPage({ showAll = false }) {
    const [historyPage, setHistoryPage] = useState(emptyPage);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = showAll
                ? await api.get("/loans", { params: { page: 0, size: 100, sort: "requestDate,desc" } })
                : await api.get("/loans/my", { params: { page: 0, size: 100, sort: "requestDate,desc" } });

            setHistoryPage(pageResponse(res));
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar histórico");
        } finally {
            setLoading(false);
        }
    }, [showAll]);

    useEffect(() => {
        // Initial/API synchronization is intentionally performed from the effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadHistory();
    }, [loadHistory]);

    const filteredHistory = useMemo(() => {
        const value = search.trim().toLowerCase();
        if (!value) return historyPage.content ?? [];

        return (historyPage.content ?? []).filter((loan) => (
            [loan.bookTitle, loan.userName, loan.status]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(value))
        ));
    }, [historyPage.content, search]);

    return (
        <div className="page-content">
            <div className="page-header">
                <span className="eyebrow">CIRCULAÇÃO</span>
                <h1>{showAll ? "Histórico (Todos)" : "Meu histórico"}</h1>
                <p>
                    {showAll
                        ? "Consulte o histórico completo de empréstimos da biblioteca."
                        : "Consulte seus empréstimos anteriores e atuais."}
                </p>
            </div>

            <div className="card history-toolbar">
                <div>
                    <strong>{historyPage.totalElements ?? 0}</strong>
                    <span> registro(s) no histórico</span>
                </div>
                {showAll && (
                    <input
                        placeholder="Buscar por livro, usuário ou status"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                )}
            </div>

            {error && <p className="error-text">{error}</p>}
            {loading && <p>Carregando histórico...</p>}

            {!loading && filteredHistory.length === 0 && (
                <div className="empty-state card">Nenhum empréstimo encontrado.</div>
            )}

            <div className="history-grid">
                {filteredHistory.map((loan) => (
                    <article className="history-card" key={loan.id}>
                        <div className="history-card-heading">
                            <div>
                                <span className="eyebrow">#{loan.id}</span>
                                <h3>{loan.bookTitle}</h3>
                            </div>
                            <span className={`status ${statusClass[loan.status] || "active"}`}>
                                {statusLabel[loan.status] || loan.status}
                            </span>
                        </div>

                        {showAll && <p><strong>Usuário:</strong> {loan.userName}</p>}
                        {loan.requestDate && (
                            <p><strong>Solicitação:</strong> {formatApiDateTime(loan.requestDate)}</p>
                        )}
                        {loan.approvalDate && (
                            <p><strong>Aprovação:</strong> {formatApiDateTime(loan.approvalDate)}</p>
                        )}
                        {loan.withdrawDate && (
                            <p><strong>Retirada:</strong> {formatApiDateTime(loan.withdrawDate)}</p>
                        )}
                        {loan.dueDate && (
                            <p><strong>Prazo:</strong> {formatApiDate(loan.dueDate)}</p>
                        )}
                        {loan.returnDate && (
                            <p><strong>Devolução:</strong> {formatApiDateTime(loan.returnDate)}</p>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
}
