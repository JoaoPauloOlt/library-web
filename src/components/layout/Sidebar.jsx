import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggle }) {
    return (
        <aside
            className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
        >
            {/* Toggle desktop */}
            <button className="sidebar-toggle" onClick={onToggle}>
                {isCollapsed ? "›" : "‹"}
            </button>

            <div className="sidebar-top">
                <h2>Biblioteca</h2>

                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>
            </div>

            <nav>
                <NavLink to="/" onClick={onClose}>Home</NavLink>
                <NavLink to="/books" onClick={onClose}>Livros</NavLink>
                <NavLink to="/books/new" onClick={onClose}>Novo Livro</NavLink>
                <NavLink to="/authors" onClick={onClose}>Autores</NavLink>
                <NavLink to="/authors/new" onClick={onClose}>Novo Autor</NavLink>
                <NavLink to="/loans" onClick={onClose}>Empréstimos</NavLink>
                <NavLink to="/history" onClick={onClose}>Histórico</NavLink>
            </nav>
        </aside>
    );
}