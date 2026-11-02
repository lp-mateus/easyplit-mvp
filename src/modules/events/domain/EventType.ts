export const EVENT_TYPES = [
  "CASAMENTO",
  "ANIVERSARIO",
  "FORMATURA",
  "CORPORATIVO",
  "CONFRATERNIZACAO",
  "OUTRO",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
