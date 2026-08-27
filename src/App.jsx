import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import BooksPage from "./pages/books/BooksPage";
import BookFormPage from "./pages/books/BookFormPage";

import AuthorsPage from "./pages/authors/AuthorsPage";
import AuthorFormPage from "./pages/authors/AuthorFormPage";

import LoansPage from "./pages/loans/LoansPage";
import HistoryPage from "./pages/loans/HistoryPage";
import HomePage from "./pages/dashboard/HomePage";
import ReportsPage from "./pages/reports/ReportsPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import PermissionRoute from "./routes/PermissionRoute";
import Layout from "./components/layout/Layout";

const WithLayout = ({ children }) => (
    <ProtectedRoute>
        <Layout>{children}</Layout>
    </ProtectedRoute>
);

const WithPermission = ({ permission, children }) => (
    <PermissionRoute permission={permission}>
        <Layout>{children}</Layout>
    </PermissionRoute>
);

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />}
            />

            <Route path="/home" element={<WithLayout><HomePage /></WithLayout>} />
            <Route path="/books" element={<WithLayout><BooksPage /></WithLayout>} />
            <Route
                path="/books/new"
                element={<WithPermission permission="BOOK_CREATE"><BookFormPage /></WithPermission>}
            />
            <Route path="/authors" element={<WithLayout><AuthorsPage /></WithLayout>} />
            <Route
                path="/authors/new"
                element={<WithPermission permission="AUTHOR_CREATE"><AuthorFormPage /></WithPermission>}
            />

            <Route path="/loans" element={<WithLayout><LoansPage showAll={false} /></WithLayout>} />
            <Route
                path="/loans/all"
                element={<WithPermission permission="LOAN_READ_ALL"><LoansPage showAll /></WithPermission>}
            />
            <Route path="/history" element={<WithLayout><HistoryPage showAll={false} /></WithLayout>} />
            <Route
                path="/history/all"
                element={<WithPermission permission="LOAN_READ_ALL"><HistoryPage showAll /></WithPermission>}
            />

            <Route
                path="/reports/most-borrowed"
                element={<WithPermission permission="LOAN_READ_ALL"><ReportsPage type="most-borrowed" /></WithPermission>}
            />
            <Route
                path="/reports/recommended"
                element={<WithPermission permission="LOAN_READ_ALL"><ReportsPage type="recommended" /></WithPermission>}
            />
            <Route
                path="/reports/categories"
                element={<WithPermission permission="LOAN_READ_ALL"><ReportsPage type="categories" /></WithPermission>}
            />
            <Route
                path="/reports/active-users"
                element={<WithPermission permission="LOAN_READ_ALL"><ReportsPage type="active-users" /></WithPermission>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
