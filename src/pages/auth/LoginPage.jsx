import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Preencha todos os campos");
            return;
        }

        try {
            await login(email, password);
            navigate("/books");
        } catch (err) {
            const message =
                err.response?.data?.detail || "Erro ao logar";

            alert(message);
        }
    };

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>Login</h1>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    placeholder="Senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <p style={{ textAlign: "center" }}>
                    Não tem conta?{" "}
                    <Link to="/register">Cadastre-se</Link>
                </p>
            </form>
        </div>
    );
}