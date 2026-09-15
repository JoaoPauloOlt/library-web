import { Component } from "react";

export default class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Keep unexpected UI failures isolated from the rest of the application.
        console.error("Unhandled UI error", error, info);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <main className="app-error" role="alert">
                <div className="app-error-card">
                    <span className="eyebrow">ERRO INESPERADO</span>
                    <h1>Não foi possível carregar esta área.</h1>
                    <p>Recarregue a página para tentar novamente.</p>
                    <button className="btn-primary" type="button" onClick={this.handleReload}>
                        Recarregar página
                    </button>
                </div>
            </main>
        );
    }
}
