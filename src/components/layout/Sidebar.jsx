import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NavItem = ({ to, label, icon, onClose, end = false }) => (
    <NavLink to={to} end={end} onClick={onClose}>
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
    </NavLink>
);

const NavSubItem = ({ to, label, onClose, end = false }) => (
    <NavLink className="nav-subitem" to={to} end={end} onClick={onClose}>
        <span>{label}</span>
    </NavLink>
);

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
    const { hasPermission } = useAuth();
    const canReadAllLoans = hasPermission("LOAN_READ_ALL");
    const canViewReports = canReadAllLoans;

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-top">
                <h2>Biblioteca</h2>
                <button className="close-btn" onClick={onClose} aria-label="Fechar menu">
                    ✕
                </button>
            </div>

            <nav>
                <div className="nav-section">
                    <span className="nav-section-title">MENU</span>
                    <NavItem to="/home" label="Dashboard" icon="⌂" onClose={onClose} end />
                    <NavItem to="/books" label="Livros" icon="▣" onClose={onClose} />
                    <NavItem to="/authors" label="Autores" icon="♙" onClose={onClose} />

                    <NavItem to="/loans" label="Empréstimos" icon="↗" onClose={onClose} />
                    <div className="nav-subitems">
                        <NavSubItem to="/loans" label="Meus Empréstimos" onClose={onClose} end />
                        {canReadAllLoans && (
                            <NavSubItem to="/loans/all" label="Empréstimos (Todos)" onClose={onClose} />
                        )}
                    </div>

                    <NavItem to="/history" label="Histórico" icon="◷" onClose={onClose} />
                    <div className="nav-subitems">
                        <NavSubItem to="/history" label="Meu Histórico" onClose={onClose} end />
                        {canReadAllLoans && (
                            <NavSubItem to="/history/all" label="Histórico (Todos)" onClose={onClose} />
                        )}
                    </div>
                </div>

                {canViewReports && (
                    <div className="nav-section">
                        <span className="nav-section-title">RELATÓRIOS</span>
                        <NavItem to="/reports/most-borrowed" label="Mais Emprestados" icon="▥" onClose={onClose} />
                        <NavItem to="/reports/recommended" label="Recomendados" icon="★" onClose={onClose} />
                        <NavItem to="/reports/categories" label="Livros por Categoria" icon="▤" onClose={onClose} />
                        <NavItem to="/reports/active-users" label="Usuários Ativos" icon="♙" onClose={onClose} />
                    </div>
                )}
            </nav>
        </aside>
    );
}
