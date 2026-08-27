import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/axios";

export default function BookDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        api.get(`/books/${id}`)
            .then((response) => active && setBook(response.data))
            .catch((err) => active && setError(err.response?.data?.detail || "Livro não encontrado"))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [id]);

    if (loading) return <div className="page-content"><p>Carregando livro...</p></div>;
    if (error) return <div className="page-content"><p className="error-text">{error}</p><Link className="btn-secondary" to="/books">Voltar aos livros</Link></div>;

    const authors = book.authors?.map((author) => author.name).join(", ") || "Autor não informado";
    const available = Number(book.availableCopies ?? 0) > 0;
    return <div className="page-content book-detail-page">
        <Link className="back-link" to="/books">← Voltar aos livros</Link>
        <section className="book-detail card">
            <div className="book-detail-cover">{book.coverUrl ? <img src={book.coverUrl} alt={`Capa de ${book.title}`} /> : <span>Sem capa</span>}</div>
            <div className="book-detail-content">
                <span className="eyebrow">DETALHES DO LIVRO</span><h1>{book.title}</h1><p className="book-detail-author">{authors}</p>
                <div className="book-detail-meta"><span>{book.genre || "Gênero não informado"}</span><span>ISBN: {book.isbn}</span><span>{book.totalCopies ?? 0} exemplar(es)</span></div>
                <div className={`status ${available ? "available" : "unavailable"}`}>{available ? `${book.availableCopies} disponível(is)` : "Indisponível"}</div>
                <div className="book-description"><h2>Sinopse</h2><p>{book.description || "Este livro ainda não possui uma sinopse cadastrada."}</p></div>
                <div className="book-detail-actions"><button className="btn-primary" disabled={!available} onClick={() => navigate(`/loans?bookId=${book.id}`)}>{available ? "Solicitar empréstimo" : "Livro indisponível"}</button></div>
            </div>
        </section>
    </div>;
}
