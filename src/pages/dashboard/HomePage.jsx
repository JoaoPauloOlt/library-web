import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";
import "./dashboard.css";

const pageContent = (data) => data?.content ?? [];
const monthKey = (date) => {
    if (!date) return null;
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
};
const getMonthOffset = (offset) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
const getTrend = (current, previous) => {
    if (previous === 0 && current === 0) return { value: 0, direction: "neutral" };
    if (previous === 0) return { value: 100, direction: "up" };
    const value = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(value), direction: value > 0 ? "up" : value < 0 ? "down" : "neutral" };
};

function StatCard({ label, value, description, trend }) {
    return (
        <div className="stat-card">
            <span>{label}</span>
            <div className="stat-value-row">
                <strong>{value}</strong>
                {trend && <span className={`stat-trend ${trend.direction}`}>
                    {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}%
                </span>}
            </div>
            <small>{description}</small>
        </div>
    );
}

export default function HomePage() {
    const { user, hasPermission } = useAuth();
    const canReadAllLoans = hasPermission("LOAN_READ_ALL");
    const canReadUsers = hasPermission("USER_ADMIN");
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
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
                    canReadUsers ? api.get("/users", { params: { size: 100, sort: "dateRegister,desc" } }) : Promise.resolve({ data: { content: [] } }),
                    canReadAllLoans
                        ? api.get("/loans", { params: { size: 100, sort: "requestDate,desc" } })
                        : api.get("/loans/my", { params: { size: 100, sort: "requestDate,desc" } })
                ];
                const [booksRes, usersRes, loansRes] = await Promise.all(requests);
                if (active) {
                    setBooks(pageContent(booksRes.data));
                    setUsers(pageContent(usersRes.data));
                    setLoans(pageContent(loansRes.data));
                    setError("");
                }
            } catch (err) {
                if (active) setError(err.response?.data?.detail || "Não foi possível carregar o painel");
            } finally {
                if (active) setLoading(false);
            }
        };
        loadDashboard();
        return () => { active = false; };
    }, [canReadAllLoans, canReadUsers]);

    const activeLoans = useMemo(() => loans.filter((loan) => !["RETURNED", "CANCELLED"].includes(loan.status)), [loans]);
    const currentMonth = getMonthOffset(0);
    const previousMonth = getMonthOffset(-1);
    const userTrend = useMemo(() => {
        if (!canReadUsers) return null;
        const current = users.filter((item) => monthKey(item.dateRegister) === currentMonth).length;
        const previous = users.filter((item) => monthKey(item.dateRegister) === previousMonth).length;
        return getTrend(current, previous);
    }, [users, currentMonth, previousMonth, canReadUsers]);
    const loanTrend = useMemo(() => {
        const current = loans.filter((item) => monthKey(item.requestDate) === currentMonth).length;
        const previous = loans.filter((item) => monthKey(item.requestDate) === previousMonth).length;
        return getTrend(current, previous);
    }, [loans, currentMonth, previousMonth]);
    const monthlyLoans = useMemo(() => loans.filter((loan) => monthKey(loan.requestDate) === currentMonth).length, [loans, currentMonth]);
    const mostBorrowed = useMemo(() => {
        if (!canReadAllLoans) return [];
        const counts = loans.reduce((acc, loan) => {
            if (loan.bookTitle) acc[loan.bookTitle] = (acc[loan.bookTitle] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
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
                <StatCard label="Livros no acervo" value={loading ? "—" : books.length} description="Livros cadastrados" />
                <StatCard label="Usuários cadastrados" value={loading ? "—" : canReadUsers ? users.length : "—"} description={canReadUsers ? "Cadastros no sistema" : "Restrito ao administrador"} trend={loading ? null : userTrend} />
                <StatCard label="Empréstimos no mês" value={loading ? "—" : monthlyLoans} description="Solicitações neste mês" trend={loading ? null : loanTrend} />
            </div>
            <div className="dashboard-grid">
                <section className="dashboard-panel">
                    <div className="panel-heading"><div><span className="eyebrow">ACERVO</span><h2>Destaques disponíveis</h2></div><Link to="/books">Ver todos</Link></div>
                    {availableBooks.length === 0 && !loading ? <div className="empty-state compact">Nenhum livro disponível no momento.</div> : <div className="mini-book-list">
                        {availableBooks.map((book) => <Link to="/books" className="mini-book" key={book.id}><div className="mini-book-cover">▣</div><div><strong>{book.title}</strong><span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span><small>{book.availableCopies} disponível(is)</small></div></Link>)}
                    </div>}
                </section>
                <section className="dashboard-panel">
                    <div className="panel-heading"><div><span className="eyebrow">CIRCULAÇÃO</span><h2>{canReadAllLoans ? "Mais emprestados" : "Meus empréstimos"}</h2></div><Link to={canReadAllLoans ? "/history" : "/loans"}>Ver detalhes</Link></div>
                    {canReadAllLoans ? (mostBorrowed.length > 0 ? <div className="ranking-list">{mostBorrowed.map(([title, count], index) => <div className="ranking-item" key={title}><span className="ranking-position">0{index + 1}</span><strong>{title}</strong><span>{count} empréstimo(s)</span></div>)}</div> : <div className="empty-state compact">Ainda não há dados de empréstimos.</div>) : <div className="loan-summary-list">
                        {activeLoans.slice(0, 5).map((loan) => <div className="loan-summary" key={loan.id}><strong>{loan.bookTitle}</strong><span>{loan.status}</span></div>)}
                        {activeLoans.length === 0 && !loading && <div className="empty-state compact">Você não possui empréstimos ativos.</div>}
                    </div>}
                </section>
            </div>
        </div>
    );
}
