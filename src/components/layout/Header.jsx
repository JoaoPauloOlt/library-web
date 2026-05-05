import { useAuth } from "../../hooks/useAuth";

export default function Header({ onMenuClick, onToggleSidebar }) {
    const { logout } = useAuth();

    return (
        <header className="header">
            <div className="header-left">
                {/* Mobile */}
                <button className="menu-btn mobile-only" onClick={onMenuClick}>
                    ☰
                </button>

                {/* Desktop */}
                <button className="menu-btn desktop-only" onClick={onToggleSidebar}>
                    ☰
                </button>

                <h3>Library System</h3>
            </div>

            <div className="header-right">
                <button onClick={logout}>Sair</button>
            </div>
        </header>
    );
}