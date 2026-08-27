import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/axios";

const NATIONALITIES = ["American", "Argentine", "Australian", "Brazilian", "British", "Canadian", "Chinese", "French", "German", "Indian", "Irish", "Italian", "Japanese", "Mexican", "Portuguese", "Russian", "South Korean", "Spanish", "Other"];

export default function AuthorFormPage() {
    const navigate = useNavigate(); const [form, setForm] = useState({ name: "", nationality: "" }); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const handleSubmit = async (event) => {
        event.preventDefault(); setError("");
        if (!form.name.trim() || !form.nationality) { setError("Preencha nome e nacionalidade."); return; }
        try { setLoading(true); await api.post("/authors", form); navigate("/authors"); }
        catch (err) { setError(err.response?.data?.detail || "Erro ao criar autor"); }
        finally { setLoading(false); }
    };
    return <div className="page-content form-page"><div className="page-header page-header-inline"><div><span className="eyebrow">ACERVO</span><h1>Novo autor</h1><p>Cadastre um autor para vinculá-lo aos livros do acervo.</p></div><Link to="/authors"><button type="button" className="btn-secondary">Voltar</button></Link></div>
        <form className="card form-card" onSubmit={handleSubmit}><div className="form-card-header"><div><h2>Dados do autor</h2><p>Mantenha a nacionalidade no padrão cadastrado pelo sistema.</p></div></div><div className="form-grid form-grid-author">
            <div className="form-field"><label htmlFor="name">Nome <span>*</span></label><input id="name" name="name" value={form.name} placeholder="Nome completo do autor" onChange={handleChange} /></div>
            <div className="form-field"><label htmlFor="nationality">Nacionalidade <span>*</span></label><select id="nationality" name="nationality" value={form.nationality} onChange={handleChange}><option value="">Selecione a nacionalidade</option>{NATIONALITIES.map((nationality) => <option key={nationality} value={nationality}>{nationality}</option>)}</select></div>
        </div>{error && <p className="error-text">{error}</p>}<div className="form-actions"><button type="button" className="btn-secondary" onClick={() => navigate("/authors")}>Cancelar</button><button type="submit" className="btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar autor"}</button></div></form>
    </div>;
}
