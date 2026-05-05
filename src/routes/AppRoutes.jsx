import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AuthorsPage from "../pages/authors/AuthorsPage";
import AuthorFormPage from "../pages/authors/AuthorFormPage.jsx";
import BooksPage from "../pages/books/BooksPage";
import BookFormPage from "../pages/books/BookFormPage.jsx";
import LoansPage from "../pages/loans/LoansPage";
import HistoryPage from "../pages/loans/HistoryPage";
import ProtectedRoute from "../routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/new" element={<BookFormPage />} />

                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/authors/new" element={<AuthorFormPage />} />

                <Route path="/loans" element={
                    <ProtectedRoute><LoansPage /></ProtectedRoute>
                } />

                <Route path="/history" element={
                    <ProtectedRoute><HistoryPage /></ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;