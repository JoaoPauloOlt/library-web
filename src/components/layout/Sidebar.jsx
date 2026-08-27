import { useState } from "react";
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

const roleLabel = (groups = []) => {
    if (groups.includes("ADMIN")) return "Administrador";
    if (groups.includes("LIBRARIAN")) return "Bibliotecário";
    return "Usuário";
};

const initials = (name = "Usuário") => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
    const { hasPermission, user, groups } = useAuth();
    const [loansExpanded, setLoansExpanded] = useState(true);
    const [historyExpanded, setHistoryExpanded] = useState(true);
    const canReadAllLoans = hasPermission("LOAN_READ_ALL");
    const canViewReports = canReadAllLoans;
    const displayName = user?.name || user?.email || "Usuário";
    const displayRole = roleLabel(groups);

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

                    <div className="nav-group">
                        <button
                            type="button"
                            className="nav-parent"
                            onClick={() => setLoansExpanded((expanded) => !expanded)}
                            aria-expanded={loansExpanded}
                        >
                            <span aria-hidden="true">↗</span>
                            <span>Empréstimos</span>
                            <span className={`nav-chevron ${loansExpanded ? "open" : ""}`} aria-hidden="true">⌄</span>
                        </button>
                        {!isCollapsed && loansExpanded && (
                            <div className="nav-subitems">
                                <NavSubItem to="/loans" label="Meus Empréstimos" onClose={onClose} end />
                                {canReadAllLoans && (
                                    <NavSubItem to="/loans/all" label="Empréstimos (Todos)" onClose={onClose} />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="nav-group">
                        <button
                            type="button"
                            className="nav-parent"
                            onClick={() => setHistoryExpanded((expanded) => !expanded)}
                            aria-expanded={historyExpanded}
                        >
                            <span aria-hidden="true">◷</span>
                            <span>Histórico</span>
                            <span className={`nav-chevron ${historyExpanded ? "open" : ""}`} aria-hidden="true">⌄</span>
                        </button>
                        {!isCollapsed && historyExpanded && (
                            <div className="nav-subitems">
                                <NavSubItem to="/history" label="Meu Histórico" onClose={onClose} end />
                                {canReadAllLoans && (
                                    <NavSubItem to="/history/all" label="Histórico (Todos)" onClose={onClose} />
                                )}
                            </div>
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

            <div className="sidebar-profile">
                <div className="profile-avatar" aria-hidden="true">{initials(displayName)}</div>
                <div className="profile-copy">
                    <strong>{displayName}</strong>
                    <span>{displayRole}</span>
                </div>
            </div>
        </aside>
    );
}
