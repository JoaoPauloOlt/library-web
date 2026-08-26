import { useState, useEffect } from "react";
import api from "../../services/axios";
import { useNavigate, Link } from "react-router-dom";

const GENRES = [
    "ACTION",
    "ADVENTURE",
    "CLASSIC",
    "COMIC",
    "DRAMA",
    "FANTASY",
    "HISTORICAL",
    "HORROR",
    "MYSTERY",
    "ROMANCE",
    "SCIENCE_FICTION"
];

export default function BookFormPage() {
    const navigate = useNavigate();

    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        isbn: "",
        title: "",
        genre: "",
        authorIds: []
    });

    useEffect(() => {
        const loadAuthors = async () => {
            try {
                const res = await api.get("/authors", {
                    params: {
                        page: 0,
                        size: 100,
                        sort: "name,asc"
                    }
                });

                const authorsData = Array.isArray(res.data)
                    ? res.data
                    : res.data?.content ?? [];

                setAuthors(authorsData);
            } catch (err) {
                setError(err.response?.data?.detail || "Erro ao carregar autores");
            }
        };

        loadAuthors();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.title || !form.isbn || !form.genre || form.authorIds.length === 0) {
            setError("Preencha todos os campos obrigatórios");
            return;
        }

        try {
            setLoading(true);
            await api.post("/books", form);
            navigate("/books");
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao criar livro");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1>Novo Livro</h1>
                    <p>Cadastro de livros no acervo</p>
                </div>

                <Link to="/books">
                    <button className="btn-secondary">Voltar</button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <div className="form-grid">
                    <input
                        name="isbn"
                        maxLength={13}
                        value={form.isbn}
                        placeholder="ISBN (13 dígitos)"
                        onChange={(e) => setForm({
                            ...form,
                            isbn: e.target.value.replace(/\D/g, "").slice(0, 13)
                        })}
                    />

                    <input
                        name="title"
                        placeholder="Título"
                        value={form.title}
                        onChange={handleChange}
                    />

                    <select name="genre" value={form.genre} onChange={handleChange}>
                        <option value="">Selecione o gênero</option>
                        {GENRES.map((genre) => (
                            <option key={genre} value={genre}>
                                {genre.replace("_", " ")}
                            </option>
                        ))}
                    </select>

                    <select
                        value={form.authorIds[0] ?? ""}
                        onChange={(e) => setForm({
                            ...form,
                            authorIds: e.target.value ? [Number(e.target.value)] : []
                        })}
                    >
                        <option value="">Selecione o autor</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>

                    {error && <p className="error-text">{error}</p>}

                    <button className="btn-primary" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Livro"}
                    </button>
                </div>
            </form>
        </div>
    );
}
