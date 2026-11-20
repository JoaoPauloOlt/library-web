const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

export const formatFineAmount = (amount) => currencyFormatter.format(Number(amount ?? 0));

export const fineStatusLabel = (status) => ({
    OPEN: "Em aberto",
    WAIVED: "Isenta"
}[status] ?? status ?? "Desconhecido");
