import { useState, useEffect } from "react";
import api from "../../services/axios";
import { useNavigate, Link } from "react-router-dom";

const GENRES = ["ACTION", "ADVENTURE", "CLASSIC", "COMIC", "DRAMA", "FANTASY", "HISTORICAL", "HORROR", "MYSTERY", "ROMANCE", "SCIENCE_FICTION"];
const googleBooksCover = (isbn) => isbn.length === 13 ? `https://books.google.com/books/content?vid=isbn${isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api` : "";

export default function BookFormPage() {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const [form, setForm] = useState({ isbn: "", title: "", genre: "", description: "", coverUrl: "", quantity: 1, authorIds: [] });

    // API synchronization is an external side effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        const loadAuthors = async () => {
            try {
                const res = await api.get("/authors", { params: { page: 0, size: 100, sort: "name,asc" } });
                setAuthors(Array.isArray(res.data) ? res.data : res.data?.content ?? []);
            } catch (err) { setError(err.response?.data?.detail || "Erro ao carregar autores"); }
        };
        loadAuthors();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleIsbnChange = (e) => { const isbn = e.target.value.replace(/\D/g, "").slice(0, 13); setForm((current) => ({ ...current, isbn, coverUrl: current.coverUrl || googleBooksCover(isbn) })); };
    const handleSubmit = async (e) => {
        e.preventDefault(); setError("");
        if (!form.title || !form.isbn || !form.genre || form.authorIds.length === 0) { setError("Preencha todos os campos obrigatórios"); return; }
        const quantity = Number.parseInt(form.quantity, 10);
        if (!Number.isInteger(quantity) || quantity < 0) { setError("A quantidade de exemplares deve ser um número maior ou igual a zero."); return; }
        try { setLoading(true); await api.post("/books", { ...form, quantity, coverUrl: form.coverUrl || null }); navigate("/books"); }
        catch (err) { setError(err.response?.data?.detail || "Erro ao criar livro"); }
        finally { setLoading(false); }
    };

    return <div className="page-content">
        <div className="page-header"><div><h1>Novo Livro</h1><p>Cadastre o livro, sua descrição, capa e quantidade de exemplares físicos.</p></div><Link to="/books"><button className="btn-secondary">Voltar</button></Link></div>
        <form onSubmit={handleSubmit} className="card"><div className="form-grid">
            <input name="isbn" maxLength={13} value={form.isbn} placeholder="ISBN (13 dígitos)" onChange={handleIsbnChange} />
            <input name="title" placeholder="Título" value={form.title} onChange={handleChange} />
            <select name="genre" value={form.genre} onChange={handleChange}><option value="">Selecione o gênero</option>{GENRES.map((genre) => <option key={genre} value={genre}>{genre.replace("_", " ")}</option>)}</select>
            <select value={form.authorIds[0] ?? ""} onChange={(e) => setForm({ ...form, authorIds: e.target.value ? [Number(e.target.value)] : [] })}><option value="">Selecione o autor</option>{authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}</select>
            <div className="form-field-full"><label htmlFor="description">Sinopse / descrição</label><textarea id="description" name="description" rows="6" maxLength="5000" placeholder="Descreva brevemente o livro" value={form.description} onChange={handleChange} /></div>
            <label>Quantidade de exemplares físicos<input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} /><small>Os exemplares criados aqui entram automaticamente como disponíveis.</small></label>
            <div className="form-field-full"><label htmlFor="coverUrl">Capa do livro</label><input id="coverUrl" name="coverUrl" type="url" placeholder="URL da capa (preenchida automaticamente pelo ISBN)" value={form.coverUrl} onChange={handleChange} /><small>Você pode substituir a URL automática por outra imagem.</small></div>
            {form.coverUrl && <div className="book-form-cover-preview"><img src={form.coverUrl} alt="Pré-visualização da capa" /></div>}
            {error && <p className="error-text">{error}</p>}<button className="btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar Livro"}</button>
        </div></form>
    </div>;
}
