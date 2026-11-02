export function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(reais);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const parts = dateString.trim().split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  if (!year || !month || !day) return dateString;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CASAMENTO: "Casamento",
  ANIVERSARIO: "Aniversário",
  FORMATURA: "Formatura",
  CORPORATIVO: "Corporativo",
  CONFRATERNIZACAO: "Confraternização",
  OUTRO: "Outro",
};

export function eventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  ESPACO_LOCAL: "Espaço/Local",
  BUFFET_ALIMENTACAO: "Buffet/Alimentação",
  BEBIDAS_BAR: "Bebidas/Bar",
  DECORACAO: "Decoração",
  MUSICA_SOM: "Música/Som",
  FOTO_VIDEO: "Foto/Vídeo",
  CERIMONIAL_ASSESSORIA: "Cerimonial/Assessoria",
  CONVITES_PAPELARIA: "Convites/Papelaria",
  TRANSPORTE: "Transporte",
  OUTROS: "Outros",
};

export function categoryLabel(category: string): string {
  return EXPENSE_CATEGORY_LABELS[category] ?? category;
}
