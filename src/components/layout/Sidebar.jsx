import { NavLink } from "react-router-dom";

const NavItem = ({ to, label, icon, onClose }) => (
    <NavLink to={to} onClick={onClose}>
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
    </NavLink>
);

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
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
                    <span className="nav-section-title">NAVEGAÇÃO</span>
                    <NavItem to="/home" label="Início" icon="⌂" onClose={onClose} />
                </div>
                <div className="nav-section">
                    <span className="nav-section-title">ACERVO</span>
                    <NavItem to="/books" label="Livros" icon="▣" onClose={onClose} />
                    <NavItem to="/authors" label="Autores" icon="♙" onClose={onClose} />
                </div>
                <div className="nav-section">
                    <span className="nav-section-title">CIRCULAÇÃO</span>
                    <NavItem to="/loans" label="Empréstimos" icon="↗" onClose={onClose} />
                    <NavItem to="/history" label="Histórico" icon="◷" onClose={onClose} />
                </div>
            </nav>
        </aside>
    );
}
