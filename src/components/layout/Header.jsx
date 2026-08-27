import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

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

export default function Header({ onMenuClick, onToggleSidebar }) {
    const { logout, user, groups } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const displayName = user?.name || user?.email || "Usuário";
    const displayRole = roleLabel(groups);

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn mobile-only" onClick={onMenuClick} aria-label="Abrir menu">
                    ☰
                </button>
                <button className="menu-btn desktop-only" onClick={onToggleSidebar} aria-label="Recolher menu">
                    ☰
                </button>
                <h3>Library System</h3>
            </div>

            <div className="header-right">
                <button className="profile-trigger" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
                    <span className="profile-avatar header-avatar" aria-hidden="true">{initials(displayName)}</span>
                    <span className="header-profile-copy">
                        <strong>{displayName}</strong>
                        <span>{displayRole}</span>
                    </span>
                    <span className={`profile-chevron ${profileOpen ? "open" : ""}`} aria-hidden="true">⌄</span>
                </button>

                {profileOpen && (
                    <div className="profile-menu">
                        <button type="button" onClick={logout}>Sair</button>
                    </div>
                )}
            </div>
        </header>
    );
}
