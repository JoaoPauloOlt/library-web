import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toastSuccess, toastError } from "../../utils/toast";
import {getErrorMessage} from "../../utils/getErrorMessage.js";
import api from "../../services/axios";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        telephone: ""
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Nome é obrigatório";
        }

        if (!emailRegex.test(form.email)) {
            newErrors.email = "Email inválido";
        }

        if (form.password.length < 6) {
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";
        }

        if (!form.telephone.trim()) {
            newErrors.telephone = "Telefone obrigatório";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });

        setErrors({
            ...errors,
            [name]: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            await api.post("/users", form);

            toastSuccess("Usuário cadastrado com sucesso!")

            await login(form.email, form.password);

            navigate("/books");

        } catch (err) {
            toastError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>Cadastro</h1>

                <input name="name" placeholder="Nome" onChange={handleChange} />
                {errors.name && <span className="error">{errors.name}</span>}

                <input name="email" placeholder="Email" onChange={handleChange} />
                {errors.email && <span className="error">{errors.email}</span>}

                <input name="password" type="password" placeholder="Senha" onChange={handleChange} />
                {errors.password && <span className="error">{errors.password}</span>}

                <input name="telephone" placeholder="Telefone" onChange={handleChange} />
                {errors.telephone && <span className="error">{errors.telephone}</span>}

                <button disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>

                <p style={{ textAlign: "center" }}>
                    Já tem conta? <Link to="/">Entrar</Link>
                </p>
            </form>
        </div>
    );
}