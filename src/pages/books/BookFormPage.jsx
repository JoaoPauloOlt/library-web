import { useState, useEffect } from "react";
import api from "../../services/axios";
import { useNavigate, Link } from "react-router-dom";

export default function BookFormPage() {
    const navigate = useNavigate();

    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        isbn: "",
        title: "",
        genre: "",
        authorId: ""
    });

    useEffect(() => {
        api.get("/authors").then(res => setAuthors(res.data));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title || !form.isbn || !form.authorId) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        try {
            setLoading(true);

            await api.post("/books", form);

            navigate("/books");

        } catch (err) {
            alert(err.response?.data?.detail || "Erro ao criar livro");
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
                    <button className="btn-secondary">
                        Voltar
                    </button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="card">

                <div className="form-grid">

                    <input
                        name="isbn"
                        maxLength={13}
                        value={form.isbn}
                        placeholder="ISBN"
                        onChange={(e) => setForm({...form,
                            isbn: e.target.value.replace(/\D/g, "").slice(0,13)})}
                    />

                    <input
                        name="title"
                        placeholder="Título"
                        onChange={handleChange}
                    />

                    <input
                        name="genre"
                        placeholder="Gênero"
                        onChange={handleChange}
                    />

                    <select name="authorId" onChange={handleChange}>
                        <option value="">Selecione o autor</option>
                        {authors.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>

                    <button className="btn-primary" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Livro"}
                    </button>

                </div>
            </form>

        </div>
    );
}