import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const openSidebar = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);
    const toggleSidebarDesktop = () => setSidebarCollapsed((prev) => !prev);

    return (
        <div className="layout">
            <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}
            <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onClose={closeSidebar}
            />
            <div className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
                <Header
                    onMenuClick={openSidebar}
                    onToggleSidebar={toggleSidebarDesktop}
                />
                <main id="main-content" className="page-content" tabIndex="-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
