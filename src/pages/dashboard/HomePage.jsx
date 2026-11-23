import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";
import "./dashboard.css";

const asList = (data) => Array.isArray(data) ? data : data?.content ?? [];
const closedStatuses = ["RETURNED", "CANCELED", "CANCELLED"];

function BookCover({ book, className = "dashboard-book-cover" }) {
  return (
    <div className={className}>
      {book?.coverUrl
        ? <img src={book.coverUrl} alt={`Capa de ${book.title}`} loading="lazy" />
        : <span aria-hidden="true">▣</span>}
    </div>
  );
}

function Panel({ eyebrow, title, children, action }) {
  return (
    <section className="dashboard-panel home-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
        {action}
      </div>
      {children}
    </section>
  );
}

function getUtcMonthRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const from = new Date(Date.UTC(year, month, 1));
  const to = new Date(Date.UTC(year, month + 1, 1));
  const format = (date) => date.toISOString().slice(0, 10);
  return { from: format(from), to: format(to) };
}

export default function HomePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [booksLoading, setBooksLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [loansError, setLoansError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const { from, to } = getUtcMonthRange();
      const requests = await Promise.allSettled([
        api.get("/books", { params: { page: 0, size: 5, sort: "loanCount,desc" } }),
        api.get("/loans/my/active", { params: { page: 0, size: 5, sort: "requestDate,desc" } }),
        api.get("/dashboard/my-summary", { params: { from, to } }),
      ]);

      if (!active) return;

      const [booksResult, loansResult, summaryResult] = requests;

      if (booksResult.status === "fulfilled") {
        setBooks(asList(booksResult.value.data));
        setBooksError("");
      } else {
        setBooksError(booksResult.reason?.response?.data?.detail || "Não foi possível carregar os livros.");
      }
      setBooksLoading(false);

      if (loansResult.status === "fulfilled") {
        setLoans(asList(loansResult.value.data));
        setLoansError("");
      } else {
        setLoansError(loansResult.reason?.response?.data?.detail || "Não foi possível carregar os empréstimos.");
      }
      setLoansLoading(false);

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value.data);
        setSummaryError("");
      } else {
        setSummaryError(summaryResult.reason?.response?.data?.detail || "Não foi possível carregar os indicadores.");
      }
      setSummaryLoading(false);
    };

    loadDashboard();
    return () => { active = false; };
  }, []);

  const mostBorrowed = useMemo(
    () => [...books]
      .sort((a, b) => Number(b.loanCount ?? 0) - Number(a.loanCount ?? 0)
        || a.title.localeCompare(b.title))
      .slice(0, 5),
    [books]
  );

  const highlights = useMemo(
    () => [...books]
      .filter((book) => Number(book.availableCopies ?? 0) > 0)
      .sort((a, b) => Number(Boolean(b.coverUrl)) - Number(Boolean(a.coverUrl))
        || Number(b.loanCount ?? 0) - Number(a.loanCount ?? 0)
        || a.title.localeCompare(b.title))
      .slice(0, 5),
    [books]
  );

  const activeLoans = useMemo(
    () => loans.filter((loan) => !closedStatuses.includes(loan.status)).slice(0, 5),
    [loans]
  );

  const genres = useMemo(() => {
    const groups = new Map();
    books.forEach((book) => {
      const genre = book.genre || "Não informado";
      const current = groups.get(genre) || { genre, count: 0, books: [] };
      current.count += Number(book.loanCount ?? 0);
      current.books.push(book);
      groups.set(genre, current);
    });
    return [...groups.values()]
      .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
      .slice(0, 5)
      .map((group) => ({
        ...group,
        books: group.books
          .sort((a, b) => Number(b.loanCount ?? 0) - Number(a.loanCount ?? 0))
          .slice(0, 4),
      }));
  }, [books]);

  const stats = [
    { label: "Total de livros", value: summary?.totalBooks, note: "Itens cadastrados no acervo" },
    { label: "Meus empréstimos no mês", value: summary?.monthlyLoans, note: "Solicitações no mês atual" },
    { label: "Empréstimos vencidos", value: summary?.overdueLoans, note: "Entre os seus empréstimos" },
  ];

  return (
    <div className="page-content dashboard-page">
      <div className="page-header">
        <span className="eyebrow">DASHBOARD</span>
        <h1>Olá, {user?.name || "usuário"}.</h1>
        <p>Acompanhe o acervo, os livros em destaque e seus empréstimos.</p>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>
              {summaryLoading ? "—" : summaryError ? "Indisponível" : stat.value ?? "—"}
            </strong>
            <small>{summaryError || stat.note}</small>
          </div>
        ))}
      </div>

      <div className="dashboard-home-grid">
        <Panel eyebrow="POPULARIDADE" title="Livros mais emprestados" action={<Link to="/books">Ver acervo</Link>}>
          {booksLoading
            ? <div className="dashboard-loading">Carregando...</div>
            : booksError
              ? <div className="error-text">{booksError}</div>
              : mostBorrowed.length === 0
                ? <div className="empty-state compact">Ainda não há dados de empréstimos.</div>
                : <div className="popular-list">
                    {mostBorrowed.map((book, index) => (
                      <Link className="popular-item" to={`/books/${book.id}`} key={book.id}>
                        <span className="popular-position">{index + 1}</span>
                        <BookCover book={book} className="dashboard-book-cover ranking-cover" />
                        <span className="book-list-info">
                          <strong>{book.title}</strong>
                          <span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span>
                        </span>
                        <span className="loan-count">{Number(book.loanCount ?? 0)}x</span>
                      </Link>
                    ))}
                  </div>}
        </Panel>

        <Panel eyebrow="DESTAQUES" title="Os destaques" action={<Link to="/books">Explorar</Link>}>
          {booksLoading
            ? <div className="dashboard-loading">Carregando...</div>
            : booksError
              ? <div className="error-text">{booksError}</div>
              : highlights.length === 0
                ? <div className="empty-state compact">Nenhum livro disponível.</div>
                : <div className="highlight-list">
                    {highlights.map((book) => (
                      <Link className="highlight-item" to={`/books/${book.id}`} key={book.id}>
                        <BookCover book={book} className="dashboard-book-cover highlight-cover" />
                        <span className="book-list-info">
                          <strong>{book.title}</strong>
                          <span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span>
                          <small>{book.availableCopies} exemplar(es) disponível(is)</small>
                        </span>
                      </Link>
                    ))}
                  </div>}
        </Panel>

        <Panel eyebrow="CIRCULAÇÃO" title="Empréstimos ativos" action={<Link to="/loans">Meus empréstimos</Link>}>
          {loansLoading
            ? <div className="dashboard-loading">Carregando...</div>
            : loansError
              ? <div className="error-text">{loansError}</div>
              : activeLoans.length === 0
                ? <div className="empty-state compact">Você não possui empréstimos ativos.</div>
                : <div className="loan-list">
                    {activeLoans.map((loan) => (
                      <div className="loan-item" key={loan.id}>
                        <BookCover book={{ title: loan.bookTitle, coverUrl: loan.coverUrl }} className="dashboard-book-cover loan-cover" />
                        <span className="book-list-info">
                          <strong>{loan.bookTitle}</strong>
                          <span>{loan.dueDate ? `Prazo: ${new Date(loan.dueDate).toLocaleDateString("pt-BR")}` : "Sem prazo definido"}</span>
                        </span>
                        <span className={`loan-status ${loan.status === "ACTIVE" ? "success" : loan.status === "REQUESTED" ? "pending" : "neutral"}`}>
                          {loan.status === "ACTIVE" ? "Ativo" : loan.status === "REQUESTED" ? "Solicitado" : loan.status}
                        </span>
                      </div>
                    ))}
                  </div>}
        </Panel>
      </div>

      <section className="dashboard-panel genres-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">POPULARIDADE</span><h2>Gêneros entre os livros mais emprestados</h2></div>
          <Link to="/books">Explorar acervo</Link>
        </div>
        {booksLoading
          ? <div className="dashboard-loading">Carregando...</div>
          : booksError
            ? <div className="error-text">{booksError}</div>
            : genres.length === 0
              ? <div className="empty-state compact">Ainda não há dados de leitura.</div>
              : <div className="genre-list">
                  {genres.map((group) => (
                    <article className="genre-section" key={group.genre}>
                      <div className="genre-heading">
                        <div><h3>{group.genre}</h3><span>{group.count} empréstimo(s)</span></div>
                      </div>
                      <div className="genre-books">
                        {group.books.map((book) => (
                          <Link className="genre-book" to={`/books/${book.id}`} key={book.id}>
                            <BookCover book={book} className="dashboard-book-cover genre-cover" />
                            <div>
                              <strong>{book.title}</strong>
                              <span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>}
      </section>
    </div>
  );
}