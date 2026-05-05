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

import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Públicas */}
            <Route
                path="/"
                element={
                    isAuthenticated ? <Navigate to="/home" /> : <LoginPage />
                }
            />

            <Route
                path="/register"
                element={
                    isAuthenticated ? <Navigate to="/home" /> : <RegisterPage />
                }
            />

            {/* Protegidas */}
            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <HomePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* BOOKS */}
            <Route
                path="/books"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <BooksPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/books/new"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <BookFormPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* AUTHORS */}
            <Route
                path="/authors"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AuthorsPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/authors/new"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AuthorFormPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* LOANS */}
            <Route
                path="/loans"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <LoansPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <HistoryPage />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" />} />
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