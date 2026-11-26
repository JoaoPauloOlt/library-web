import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import { useAuth } from "../../hooks/useAuth";
import "./dashboard.css";
import { formatApiDate, getSaoPauloMonthRange } from "../../utils/dateTime.js";

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

export default function HomePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loans, setLoans] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genreBooks, setGenreBooks] = useState({});
  const [genreBookErrors, setGenreBookErrors] = useState({});
  const [summary, setSummary] = useState(null);
  const [booksLoading, setBooksLoading] = useState(true);
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [genresLoading, setGenresLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [highlightsError, setHighlightsError] = useState("");
  const [loansError, setLoansError] = useState("");
  const [genresError, setGenresError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const { from, to } = getSaoPauloMonthRange();
      const requests = await Promise.allSettled([
        api.get("/dashboard/most-borrowed", { params: { page: 0, size: 5 } }),
        api.get("/dashboard/available-highlights", { params: { page: 0, size: 5 } }),
        api.get("/loans/my/active", { params: { page: 0, size: 5, sort: "requestDate,desc" } }),
        api.get("/dashboard/genres"),
        api.get("/dashboard/my-summary", { params: { from, to } }),
      ]);

      if (!active) return;
      const [booksResult, highlightsResult, loansResult, genresResult, summaryResult] = requests;

      if (booksResult.status === "fulfilled") {
        setBooks(asList(booksResult.value.data));
        setBooksError("");
      } else {
        setBooksError(booksResult.reason?.response?.data?.detail || "Não foi possível carregar os livros mais emprestados.");
      }
      setBooksLoading(false);

      if (highlightsResult.status === "fulfilled") {
        setHighlights(asList(highlightsResult.value.data));
        setHighlightsError("");
      } else {
        setHighlightsError(highlightsResult.reason?.response?.data?.detail || "Não foi possível carregar os destaques.");
      }
      setHighlightsLoading(false);

      if (loansResult.status === "fulfilled") {
        setLoans(asList(loansResult.value.data));
        setLoansError("");
      } else {
        setLoansError(loansResult.reason?.response?.data?.detail || "Não foi possível carregar os empréstimos.");
      }
      setLoansLoading(false);

      if (genresResult.status === "fulfilled") {
        const genreMetrics = asList(genresResult.value.data).slice(0, 5);
        setGenres(genreMetrics);
        setGenresError("");
        const genreBookResults = await Promise.allSettled(genreMetrics.map((group) =>
          api.get(`/dashboard/genres/${encodeURIComponent(group.genre)}/books`, {
            params: { page: 0, size: 4 },
          })
        ));
        if (active) {
          const booksByGenre = {};
          const errorsByGenre = {};
          genreBookResults.forEach((result, index) => {
            const genre = genreMetrics[index].genre;
            if (result.status === "fulfilled") {
              booksByGenre[genre] = asList(result.value.data);
            } else {
              booksByGenre[genre] = [];
              errorsByGenre[genre] = result.reason?.response?.data?.detail
                || "Não foi possível carregar os livros deste gênero.";
            }
          });
          setGenreBooks(booksByGenre);
          setGenreBookErrors(errorsByGenre);
        }
      } else {
        setGenresError(genresResult.reason?.response?.data?.detail || "Não foi possível carregar os gêneros.");
      }
      setGenresLoading(false);

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

  const activeLoans = useMemo(
    () => loans.filter((loan) => !closedStatuses.includes(loan.status)).slice(0, 5),
    [loans]
  );

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
            <strong>{summaryLoading ? "—" : summaryError ? "Indisponível" : stat.value ?? "—"}</strong>
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
              : books.length === 0
                ? <div className="empty-state compact">Ainda não há dados de empréstimos.</div>
                : <div className="popular-list">
                    {books.map((book, index) => (
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
          {highlightsLoading
            ? <div className="dashboard-loading">Carregando...</div>
            : highlightsError
              ? <div className="error-text">{highlightsError}</div>
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
                          <span>{loan.dueDate ? `Prazo: ${formatApiDate(loan.dueDate)}` : "Sem prazo definido"}</span>
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
          <div><span className="eyebrow">POPULARIDADE</span><h2>Empréstimos por gênero no acervo</h2></div>
          <Link to="/books">Explorar acervo</Link>
        </div>
        {genresLoading
          ? <div className="dashboard-loading">Carregando...</div>
          : genresError
            ? <div className="error-text">{genresError}</div>
            : genres.length === 0
              ? <div className="empty-state compact">Ainda não há dados de leitura.</div>
              : <div className="genre-list">
                  {genres.map((group) => (
                    <article className="genre-section" key={group.genre}>
                      <div className="genre-heading">
                        <div><h3>{group.genre}</h3><span>{group.loanCount} empréstimo(s)</span></div>
                      </div>
                      {genreBookErrors[group.genre]
                        ? <p className="error-text">{genreBookErrors[group.genre]}</p>
                        : genreBooks[group.genre]?.length
                          ? <div className="genre-books">
                              {genreBooks[group.genre].map((book) => (
                                <Link className="genre-book" to={`/books/${book.id}`} key={book.id}>
                                  <BookCover book={book} className="dashboard-book-cover genre-cover" />
                                  <div>
                                    <strong>{book.title}</strong>
                                    <span>{book.authors?.map((author) => author.name).join(", ") || "Autor não informado"}</span>
                                    <small>{Number(book.loanCount ?? 0)} empréstimo(s)</small>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          : <div className="empty-state compact">Nenhum livro encontrado para este gênero.</div>}
                    </article>
                  ))}
                </div>}
      </section>
    </div>
  );
}