import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/axios";

const NATIONALITIES = [
    "American",
    "Argentine",
    "Australian",
    "Brazilian",
    "British",
    "Canadian",
    "Chinese",
    "French",
    "German",
    "Indian",
    "Irish",
    "Italian",
    "Japanese",
    "Mexican",
    "Portuguese",
    "Russian",
    "South Korean",
    "Spanish",
    "Other"
];

export default function AuthorFormPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", nationality: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.nationality.trim()) {
            setError("Preencha nome e nacionalidade");
            return;
        }
        try {
            setLoading(true);
            setError("");
            await api.post("/authors", form);
            navigate("/authors");
        } catch (err) {
            setError(err.response?.data?.detail || "Erro ao criar autor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header page-header-inline">
                <div>
                    <h1>Novo Autor</h1>
                    <p>Cadastre um novo autor no sistema</p>
                </div>
                <Link to="/authors"><button className="btn-secondary">Voltar</button></Link>
            </div>

            <form className="card form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <input
                        name="name"
                        placeholder="Nome do autor"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <select name="nationality" value={form.nationality} onChange={handleChange}>
                        <option value="">Selecione a nacionalidade</option>
                        {NATIONALITIES.map((nationality) => (
                            <option key={nationality} value={nationality}>{nationality}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate("/authors")}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Autor"}
                    </button>
                </div>
            </form>
        </div>
    );
}
