export function getErrorMessage(err) {
    const data = err.response?.data;

    if (!data) return "Erro inesperado";

    return data.detail || data.title || "Erro na requisição";
}