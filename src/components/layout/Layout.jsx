import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop

    const openSidebar = () => setSidebarOpen(true);
    const closeSidebar = () => setSidebarOpen(false);

    const toggleSidebarDesktop = () => {
        setSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="layout">
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onClose={closeSidebar}
                onToggle={toggleSidebarDesktop}
            />

            <div className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
                <Header
                    onMenuClick={openSidebar}
                    onToggleSidebar={toggleSidebarDesktop}
                />
                <main className="page-content">{children}</main>
            </div>
        </div>
    );
}