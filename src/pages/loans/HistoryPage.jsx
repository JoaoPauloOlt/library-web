// src/pages/loans/HistoryPage.jsx
import { useEffect, useState } from "react";
import api from "../../services/axios";

export default function HistoryPage() {
    const [loans, setLoans] = useState([]);
    const [error, setError] = useState("");

    const loadHistory = async () => {
        try {
            setError("");
            const res = await api.get("/loans");
            setLoans(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar histórico");
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Histórico de Empréstimos</h1>
                <p>Acompanhe empréstimos ativos e finalizados</p>
            </div>

            {error && <p className="error-text">{error}</p>}

            {!error && loans.length === 0 && (
                <div className="empty-state">
                    <p>Nenhum empréstimo encontrado.</p>
                </div>
            )}

            <div className="history-grid">
                {loans.map((loan) => {
                    const loanDate = new Date(loan.loanDate);
                    const dueDate = new Date(loanDate);
                    dueDate.setDate(dueDate.getDate() + 7);

                    return (
                        <div className="history-card" key={loan.id}>
                            <h3>{loan.book?.title}</h3>

                            <p>
                                <strong>Empréstimo:</strong>{" "}
                                {loanDate.toLocaleString("pt-BR")}
                            </p>

                            <p>
                                <strong>Devolução prevista:</strong>{" "}
                                {loan.returnDate
                                    ? new Date(loan.returnDate).toLocaleString("pt-BR")
                                    : dueDate.toLocaleDateString("pt-BR")}
                            </p>

                            <span
                                className={`status ${
                                    loan.returnDate ? "finished" : "active"
                                }`}
                            >
                                {loan.returnDate ? "Finalizado" : "Ativo"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
