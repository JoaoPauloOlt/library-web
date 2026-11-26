export const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

function parseApiDateTime(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value !== "string") return null;

    // API LocalDateTime fields represent UTC but do not include an offset.
    // Treat offset-less values as UTC instead of browser-local time.
    const hasOffset = /(?:Z|[+-]\\d{2}:?\\d{2})$/i.test(value);
    const date = new Date(hasOffset ? value : `${value}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatApiDate(value) {
    const date = parseApiDateTime(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: BUSINESS_TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export function formatApiDateTime(value) {
    const date = parseApiDateTime(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: BUSINESS_TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(date);
}

export function getSaoPauloMonthRange(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: BUSINESS_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
    }).formatToParts(now);
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const month = Number(parts.find((part) => part.type === "month")?.value);

    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
    return { from, to };
}
