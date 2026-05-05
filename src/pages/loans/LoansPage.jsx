import { useState, useEffect, useCallback } from "react";
import api from "../../services/axios";

export default function LoansPage() {
    const [loans, setLoans] = useState([]);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);

    const [form, setForm] = useState({
        bookId: "",
        userId: ""
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [loansRes, booksRes, usersRes] = await Promise.all([
                api.get("/loans"),
                api.get("/books"),
                api.get("/users")
            ]);

            setLoans(loansRes.data.filter((loan) => !loan.returnDate));
            setBooks(booksRes.data.filter((book) => book.available));
            setUsers(usersRes.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao carregar empréstimos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.bookId || !form.userId) {
            setError("Selecione um livro e um usuário");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await api.post("/loans", form);

            setForm({
                bookId: "",
                userId: ""
            });

            loadData();
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao registrar empréstimo");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (id) => {
        try {
            await api.put(`/loans/${id}/return`);
            loadData();
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao devolver livro");
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Empréstimos</h1>
                <p>Gerencie os empréstimos ativos da biblioteca</p>
            </div>

            <div className="card">
                <form className="form-grid" onSubmit={handleSubmit}>
                    <select
                        name="bookId"
                        value={form.bookId}
                        onChange={handleChange}
                    >
                        <option value="">Selecione um livro</option>
                        {books.map((book) => (
                            <option key={book.id} value={book.id}>
                                {book.title}
                            </option>
                        ))}
                    </select>

                    <select
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                    >
                        <option value="">Selecione um usuário</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Salvando..." : "Registrar empréstimo"}
                    </button>
                </form>

                {error && <p className="error-text">{error}</p>}
            </div>

            <div className="card">
                <h3>Empréstimos em aberto</h3>

                {loading && <p>Carregando...</p>}

                {!loading && loans.length === 0 && (
                    <p>Nenhum empréstimo ativo</p>
                )}

                <div className="list">
                    {loans.map((loan) => (
                        <div className="list-item" key={loan.id}>
                            <div>
                                <strong>{loan.book?.title}</strong>
                                <p>Usuário: {loan.user?.name}</p>
                                <p>Data: {new Date(loan.loanDate).toLocaleString()}</p>
                            </div>

                            <button onClick={() => handleReturn(loan.id)}>
                                Devolver
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}