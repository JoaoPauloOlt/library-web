export default function HomePage() {
    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Biblioteca Acadêmica</h1>
                <p>Bem-vindo ao sistema de gestão de biblioteca</p>
            </div>

            <div className="card">
                <h3>📚 Novos livros adicionados</h3>
                <p>Ex: engenharia de software, banco de dados, etc...</p>
            </div>

            <div className="card">
                <h3>📊 Status do sistema</h3>
                <p>Empréstimos ativos, livros disponíveis, usuários cadastrados</p>
            </div>
        </div>
    );
}