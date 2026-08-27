import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";
import "./dashboard.css";

const pageContent = (data) => data?.content ?? [];
const completedStatuses = ["RETURNED", "CANCELED", "CANCELLED"];
function BookCover({ book, className = "dashboard-book-cover" }) { return <div className={className}>{book?.coverUrl ? <img src={book.coverUrl} alt={`Capa de ${book.title}`} loading="lazy" /> : <span aria-hidden="true">▣</span>}</div>; }

export default function HomePage() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]); const [loans, setLoans] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
    const [currentTime] = useState(() => Date.now());

    // API synchronization is an external side effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
                setBooks(pageContent(booksRes.data)); setLoans(pageContent(loansRes.data)); setError("");
            } catch (err) { if (active) setError(err.response?.data?.detail || "Não foi possível carregar o painel"); }
            finally { if (active) setLoading(false); }
        };
        loadDashboard();
        return () => { active = false; };
    }, []);

    const currentDate = new Date(currentTime);
    const monthlyLoans = useMemo(() => loans.filter((loan) => { const date = loan.requestDate || loan.createdAt; if (!date) return false; const value = new Date(date); return value.getMonth() === currentDate.getMonth() && value.getFullYear() === currentDate.getFullYear(); }).length, [loans, currentDate]);
    const overdueLoans = useMemo(() => loans.filter((loan) => { if (completedStatuses.includes(loan.status) || !loan.dueDate) return false; return new Date(loan.dueDate).getTime() < currentTime; }).length, [loans, currentTime]);
    const genres = useMemo(() => {
        const groups = new Map();
        books.forEach((book) => { const genre = book.genre || "Não informado"; const current = groups.get(genre) || { genre, count: 0, books: [] }; current.count += Number(book.loanCount ?? 0); current.books.push(book); groups.set(genre, current); });
        return [...groups.values()].sort((a, b) => b.count - a.count).slice(0, 5).map((group) => ({ ...group, books: group.books.sort((a, b) => Number(b.loanCount ?? 0) - Number(a.loanCount ?? 0)).slice(0, 4) }));
    }, [books]);
    const stats = [{ label: "Total de livros", value: loading ? "—" : books.length }, { label: "Meus empréstimos no mês", value: loading ? "—" : monthlyLoans }, { label: "Empréstimos vencidos", value: loading ? "—" : overdueLoans }];

    return <div className="page-content dashboard-page">
        <div className="page-header"><span className="eyebrow">DASHBOARD</span><h1>Olá, {user?.name || "usuário"}.</h1><p>Tenha uma visão rápida do seu uso da biblioteca e dos gêneros mais lidos.</p></div>
        {error && <p className="error-text">{error}</p>}
        <div className="stat-grid">{stats.map((stat) => <div className="stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>Dados atualizados do acervo</small></div>)}</div>
        <section className="dashboard-panel genres-panel">
            <div className="panel-heading"><div><span className="eyebrow">POPULARIDADE</span><h2>Gêneros mais lidos</h2></div><Link to="/books">Explorar acervo</Link></div>
            {loading ? <div className="dashboard-loading">Carregando...</div> : genres.length === 0 ? <div className="empty-state compact">Ainda não há dados de leitura.</div> : <div className="genre-list">{genres.map((group) => <article className="genre-section" key={group.genre}><div className="genre-heading"><div><h3>{group.genre}</h3><span>{group.count} empréstimo(s)</span></div></div><div className="genre-books">{group.books.map((book) => <Link className="genre-book" to={`/books/${book.id}`} key={book.id}><BookCover book={book} className="dashboard-book-cover genre-cover" /><div><strong>{book.title}</strong><span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span></div></Link>)}</div></article>)}</div>}
        </section>
    </div>;
}
