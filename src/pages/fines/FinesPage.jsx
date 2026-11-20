import { useCallback, useEffect, useState } from "react";
import { getFines, getMyFines, waiveFine } from "../../api/fineApi";
import { useAuth } from "../../hooks/useAuth";
import { fineStatusLabel, formatFineAmount } from "../../utils/fineUtils";
import "./FinesPage.css";

const PAGE_SIZE = 20;

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR").format(date);
};

export default function FinesPage() {
    const { hasPermission } = useAuth();
    const canReadAll = hasPermission("FINE_READ_ALL");
    const canReadOwn = hasPermission("FINE_READ_OWN");
    const canWaive = hasPermission("FINE_WAIVE");
    const [fines, setFines] = useState([]);
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFine, setSelectedFine] = useState(null);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState("");

    const loadFines = useCallback(async () => {
        try {
            const params = { page, size: PAGE_SIZE, sort: "createdAt,desc" };
            if (status) params.status = status;
            const request = canReadAll
                ? getFines(params)
                : canReadOwn
                    ? getMyFines(params)
                    : Promise.reject(new Error("Você não possui permissão para consultar multas."));
            const response = await request;
            const result = response.data ?? {};
            setFines(result.content ?? []);
            setTotalPages(result.totalPages ?? 0);
        } catch (requestError) {
            setError(requestError.response?.data?.message
                || requestError.response?.data?.detail
                || "Não foi possível carregar as multas.");
        } finally {
            setLoading(false);
        }
    }, [canReadAll, canReadOwn, page, status]);

    useEffect(() => {
        loadFines();
    }, [loadFines]);

    const handleWaive = async (event) => {
        event.preventDefault();
        if (!selectedFine || !reason.trim()) return;

        setSubmitting(true);
        setError("");
        setNotice("");
        try {
            await waiveFine(selectedFine.id, reason.trim());
            setNotice(`Multa #${selectedFine.id} isentada com sucesso.`);
            setSelectedFine(null);
            setReason("");
            await loadFines();
        } catch (requestError) {
            setError(requestError.response?.data?.message
                || requestError.response?.data?.detail
                || "Não foi possível isentar a multa.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fines-page">
            <header className="page-header fines-header">
                <div>
                    <span className="eyebrow">CIRCULAÇÃO</span>
                    <h1>Multas</h1>
                    <p>{canReadAll
                        ? "Consulte as multas registradas para os empréstimos da biblioteca."
                        : "Acompanhe as multas vinculadas aos seus empréstimos."}</p>
                </div>
                <label className="fine-filter">
                    <span>Status</span>
                    <select value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); setPage(0); }}>
                        <option value="">Todos</option>
                        <option value="OPEN">Em aberto</option>
                        <option value="WAIVED">Isentas</option>
                    </select>
                </label>
            </header>

            {notice && <p className="fine-notice" role="status">{notice}</p>}
            {error && <p className="fine-error" role="alert">{error}</p>}

            {selectedFine && (
                <form className="fine-waiver-panel" onSubmit={handleWaive}>
                    <div>
                        <h2>Isentar multa #{selectedFine.id}</h2>
                        <p>O registro será preservado com o administrador responsável, data e justificativa.</p>
                    </div>
                    <label>
                        Justificativa
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            maxLength={500}
                            minLength={1}
                            required
                            rows={3}
                            placeholder="Informe o motivo da isenção"
                        />
                    </label>
                    <div className="fine-actions">
                        <button type="button" className="fine-button secondary" onClick={() => { setSelectedFine(null); setReason(""); }}>
                            Voltar
                        </button>
                        <button type="submit" className="fine-button primary" disabled={!reason.trim() || submitting}>
                            {submitting ? "Salvando..." : "Confirmar isenção"}
                        </button>
                    </div>
                </form>
            )}

            <section className="fine-list-panel" aria-label="Lista de multas">
                {loading ? (
                    <p className="fine-empty" role="status">Carregando multas...</p>
                ) : fines.length === 0 ? (
                    <div className="fine-empty">
                        <strong>Nenhuma multa encontrada</strong>
                        <span>As multas serão registradas automaticamente quando um empréstimo atrasado for devolvido.</span>
                    </div>
                ) : (
                    <>
                        <div className="fine-table-wrap">
                            <table className="fine-table">
                                <thead>
                                    <tr>
                                        <th>Multa</th>
                                        {canReadAll && <th>Usuário</th>}
                                        <th>Empréstimo</th>
                                        <th>Atraso</th>
                                        <th>Valor</th>
                                        <th>Registro</th>
                                        <th>Status</th>
                                        {canWaive && <th>Ações</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fines.map((fine) => (
                                        <tr key={fine.id}>
                                            <td data-label="Multa">#{fine.id}</td>
                                            {canReadAll && <td data-label="Usuário">#{fine.userId}</td>}
                                            <td data-label="Empréstimo">#{fine.loanId}</td>
                                            <td data-label="Atraso">{fine.lateDays} dia(s)</td>
                                            <td data-label="Valor" className="fine-amount">{formatFineAmount(fine.amount)}</td>
                                            <td data-label="Registro">{formatDate(fine.createdAt)}</td>
                                            <td data-label="Status">
                                                <span className={`fine-status ${fine.status === "OPEN" ? "open" : "waived"}`}>
                                                    {fineStatusLabel(fine.status)}
                                                </span>
                                            </td>
                                            {canWaive && (
                                                <td data-label="Ações">
                                                    {fine.status === "OPEN" && (
                                                        <button
                                                            type="button"
                                                            className="fine-button secondary"
                                                            onClick={() => { setSelectedFine(fine); setReason(""); }}
                                                        >
                                                            Isentar
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="fine-pagination">
                            <span>Página {page + 1} de {Math.max(totalPages, 1)}</span>
                            <div>
                                <button type="button" className="fine-button secondary" disabled={page === 0} onClick={() => { setLoading(true); setPage((current) => current - 1); }}>
                                    Anterior
                                </button>
                                <button type="button" className="fine-button secondary" disabled={page + 1 >= totalPages} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
