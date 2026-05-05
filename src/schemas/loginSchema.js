import Sidebar from "../components/layout/Sidebar.jsx";
import Header from "../components/layout/Header.jsx";

export default function Layout({ children }) {
    return (
        <div className="layout">
            <Sidebar />

            <div className="content-area">
                <Header />

                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}