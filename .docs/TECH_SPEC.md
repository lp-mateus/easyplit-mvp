# TECH SPEC: EasySplit (MVP)

> Documento destinado a um **agente de codificação**. Siga-o literalmente. Onde houver ambiguidade, escolha a opção mais simples que respeite as regras e os critérios de aceite, sem acrescentar funcionalidades fora do escopo.

---

## 1. Visão geral e escopo

**EasySplit** é um web app para **rateio de custos de eventos** (ex.: "Casamento Tatiana & Mateus"), inspirado no SplitWise. Um evento tem N **pagadores** (ex.: "Pais da noiva", "Pais do noivo") e **despesas** (fornecedores). Cada despesa é um lançamento único, **paga** ou **pendente**, e é rateada **igualmente** entre os pagadores participantes escolhidos.

O objetivo central é mostrar a **visão completa do compromisso de cada parte**: como a maioria das despesas ainda não estará paga, o saldo da maioria dos pagadores será **negativo**, retratando quanto cada parte ainda deve ao evento (fornecedores).

### 1.1 Dentro do escopo (MVP)

- CRUD de Evento, Pagador e Despesa.
- Wizard de criação de evento (dados do evento → pagadores).
- Lista de eventos com busca/filtro e botão "Novo evento".
- Tela de detalhe do evento com resumo, pagadores, dashboard (cards numéricos) e despesas.
- Persistência em arquivos CSV locais.

### 1.2 Fora do escopo (NÃO implementar)

- Autenticação/autorização.
- Parcelas, pagamento parcial ou pagamento por mais de um pagador.
- Lista "quem deve quanto a quem" (transferências entre partes). **Removida do MVP.**
- Gráficos (apenas cards numéricos).
- Testes automatizados (unitários, integração ou e2e).
- Deploy, concorrência multiusuário, multi-moeda, i18n além de pt-BR.
- Pagadores externos que não participam do rateio.

---

## 2. Stack e decisões técnicas

| Item                  | Decisão                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Framework             | Next.js (versão estável mais recente) com **App Router**                                                                          |
| Linguagem             | TypeScript em modo `strict`                                                                                                       |
| UI                    | **Material UI** (`@mui/material`, `@mui/icons-material`), **tema padrão** (`createTheme()` sem customização, apenas locale pt-BR) |
| Integração MUI + Next | `@mui/material-nextjs` (`AppRouterCacheProvider`)                                                                                 |
| Mutações              | **Server Actions**                                                                                                                |
| Leitura               | Server Components chamando casos de uso diretamente                                                                               |
| Validação             | **Zod** (schemas nas fronteiras: Server Actions e casos de uso)                                                                   |
| Persistência          | **CSV local** em `./data` (configurável via `DATA_DIR`)                                                                           |
| CSV                   | `csv-parse` e `csv-stringify` (ou `papaparse`)                                                                                    |
| IDs                   | UUID v4 (`crypto.randomUUID()`)                                                                                                   |
| Idioma / moeda        | pt-BR / BRL                                                                                                                       |
| Execução              | Apenas local (`npm run dev` / `npm run build && npm start`)                                                                       |
| Testes                | **Nenhum**                                                                                                                        |

Princípios: **DDD, Clean Code, SOLID**, monolito modular, dependências apontando para dentro (presentation → application → domain; infrastructure implementa interfaces do domain).

---

## 3. Arquitetura

### 3.1 Camadas por módulo

- **domain:** entidades, value objects, invariantes, interfaces de repositório, erros de domínio, serviços de domínio. **Sem** imports de Next, React, MUI, Zod ou fs.
- **application:** casos de uso (um arquivo por caso de uso, uma classe com método `execute`), DTOs de entrada/saída. Depende apenas do domain (via interfaces).
- **infrastructure:** implementação dos repositórios em CSV.
- **presentation:** Server Actions, schemas Zod de formulário, componentes React/MUI e mappers para view models.

### 3.2 Módulos

| Módulo       | Responsabilidade                                                           |
| ------------ | -------------------------------------------------------------------------- |
| `events`     | Evento (dados, tipo, data, convidados), listagem, exclusão em cascata      |
| `payers`     | Pagadores do evento                                                        |
| `expenses`   | Despesas, status, participantes do rateio                                  |
| `settlement` | Cálculo do rateio e dos saldos de compromisso (dashboard). Somente leitura |

### 3.3 Estrutura de pastas

```
easysplit/
├─ data/                          # criado em runtime (gitignore); *.csv
├─ src/
│  ├─ app/                        # rotas Next.js (App Router)
│  │  ├─ layout.tsx               # ThemeRegistry + AppBar (menu)
│  │  ├─ page.tsx                 # redirect -> /events
│  │  └─ events/
│  │     ├─ page.tsx              # lista de eventos
│  │     ├─ new/page.tsx          # wizard
│  │     └─ [eventId]/page.tsx    # detalhe do evento
│  ├─ modules/
│  │  ├─ events/
│  │  │  ├─ domain/ (Event.ts, EventType.ts, EventRepository.ts, errors.ts)
│  │  │  ├─ application/ (CreateEventWithPayers, UpdateEvent, DeleteEvent, ListEvents, GetEvent)
│  │  │  ├─ infrastructure/ (CsvEventRepository.ts)
│  │  │  └─ presentation/ (actions.ts, schemas.ts, components/)
│  │  ├─ payers/
│  │  │  ├─ domain/ (Payer.ts, PayerRepository.ts, errors.ts)
│  │  │  ├─ application/ (AddPayer, UpdatePayer, DeletePayer, ListPayersByEvent)
│  │  │  ├─ infrastructure/ (CsvPayerRepository.ts)
│  │  │  └─ presentation/
│  │  ├─ expenses/
│  │  │  ├─ domain/ (Expense.ts, ExpenseCategory.ts, ExpenseStatus.ts, ExpenseRepository.ts, ShareCalculator.ts, errors.ts)
│  │  │  ├─ application/ (CreateExpense, UpdateExpense, DeleteExpense, ListExpensesByEvent)
│  │  │  ├─ infrastructure/ (CsvExpenseRepository.ts)
│  │  │  └─ presentation/
│  │  └─ settlement/
│  │     ├─ domain/ (CommitmentCalculator.ts, types.ts)
│  │     ├─ application/ (GetEventDashboard.ts)
│  │     └─ presentation/ (DashboardCards.tsx)
│  ├─ shared/
│  │  ├─ domain/ (Money.ts, DomainError.ts, ids.ts)
│  │  ├─ infrastructure/csv/ (CsvFile.ts, FileMutex.ts)
│  │  └─ presentation/ (ActionResult.ts, formatters.ts, ConfirmDialog.tsx, ThemeRegistry.tsx)
│  └─ main/container.ts           # composition root (injeção de dependências manual)
├─ .env.example                   # DATA_DIR=./data
└─ package.json
```

### 3.4 Composition root

`src/main/container.ts` instancia repositórios CSV e casos de uso e os exporta. Server Components e Server Actions importam daqui (`import "server-only"`). Nenhuma camada interna conhece o container.

---

## 4. Modelo de domínio

### 4.1 Value Object `Money`

- Representa valor em **centavos inteiros** (`number`, inteiro, `>= 0`).
- Métodos: `fromCents`, `fromReais(string|number)` (parse de "1.234,56" no formulário), `toCents`, `add`, `subtract`, `format()` (`Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"})`).
- Saldos podem ser negativos: use `number` inteiro (centavos) nos DTOs de saldo.
- **Nunca** usar ponto flutuante em cálculos; converter para reais só na exibição.

### 4.2 Entidade `Event`

| Campo       | Tipo         | Regras                                             |
| ----------- | ------------ | -------------------------------------------------- |
| id          | UUID         | gerado                                             |
| title       | string       | obrigatório, 1–120                                 |
| type        | `EventType`  | enum fixo                                          |
| description | string       | opcional, até 500                                  |
| guestCount  | inteiro      | `>= 0` (0 permitido; custo por convidado vira "—") |
| eventDate   | `YYYY-MM-DD` | obrigatório                                        |
| createdAt   | ISO datetime | gerado                                             |

`EventType`: `CASAMENTO`, `ANIVERSARIO`, `FORMATURA`, `CORPORATIVO`, `CONFRATERNIZACAO`, `OUTRO`.
Rótulos pt-BR: Casamento, Aniversário, Formatura, Corporativo, Confraternização, Outro.

### 4.3 Entidade `Payer` (pertence a um Event)

| Campo       | Tipo         | Regras                                                       |
| ----------- | ------------ | ------------------------------------------------------------ |
| id          | UUID         | gerado                                                       |
| eventId     | UUID         | obrigatório                                                  |
| name        | string       | obrigatório, 1–80, único dentro do evento (case-insensitive) |
| description | string       | opcional, até 300                                            |
| contact     | string       | opcional, até 120 (texto livre: telefone/e-mail)             |
| createdAt   | ISO datetime | gerado (define a **ordem** dos pagadores)                    |

### 4.4 Entidade `Expense` (pertence a um Event)

| Campo          | Tipo                 | Regras                                                                                             |
| -------------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| id             | UUID                 | gerado                                                                                             |
| eventId        | UUID                 | obrigatório                                                                                        |
| name           | string               | obrigatório, 1–120                                                                                 |
| supplier       | string               | opcional, até 120                                                                                  |
| category       | `ExpenseCategory`    | enum fixo                                                                                          |
| amountCents    | inteiro              | `> 0`                                                                                              |
| notes          | string               | opcional, até 500                                                                                  |
| expenseDate    | `YYYY-MM-DD`         | obrigatório (data do lançamento/contratação)                                                       |
| status         | `PENDING` \| `PAID`  |                                                                                                    |
| payerId        | UUID \| null         | obrigatório se `PAID`; **null** se `PENDING`                                                       |
| paidAt         | `YYYY-MM-DD` \| null | obrigatório se `PAID`; **null** se `PENDING`                                                       |
| participantIds | UUID[]               | mínimo 1; todos devem ser pagadores do mesmo evento; ordenados pela ordem de criação dos pagadores |
| createdAt      | ISO datetime         | gerado                                                                                             |

`ExpenseCategory`: `ESPACO_LOCAL`, `BUFFET_ALIMENTACAO`, `BEBIDAS_BAR`, `DECORACAO`, `MUSICA_SOM`, `FOTO_VIDEO`, `CERIMONIAL_ASSESSORIA`, `CONVITES_PAPELARIA`, `TRANSPORTE`, `OUTROS`.
Rótulos: Espaço/Local, Buffet/Alimentação, Bebidas/Bar, Decoração, Música/Som, Foto/Vídeo, Cerimonial/Assessoria, Convites/Papelaria, Transporte, Outros.

### 4.5 Invariantes (validadas no domínio, não só no Zod)

1. `PAID` ⇒ `payerId` e `paidAt` preenchidos; `PENDING` ⇒ ambos `null`.
2. Se `PAID`, o `payerId` **deve** estar em `participantIds`.
3. `participantIds` não vazio, sem duplicatas, todos pertencentes ao evento da despesa.
4. `amountCents` inteiro positivo.
5. Um evento deve ter **no mínimo 2 pagadores**: o wizard exige 2+, e excluir um pagador que deixaria o evento com menos de 2 é **bloqueado**.

### 4.6 Regras de exclusão

| Ação                                                                        | Regra                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Excluir **pagador**                                                         | **Bloqueado** se participa de qualquer despesa (inclui ser o pagador de uma despesa paga, pois o pagador é sempre participante) ou se deixaria o evento com menos de 2 pagadores. Mensagem informa o motivo |
| Remover pagador dos **participantes** de uma despesa em que ele é o pagador | **Bloqueado** (trocar o pagador antes, ou voltar a despesa para pendente)                                                                                                                                   |
| Excluir **despesa**                                                         | Permitido, com diálogo de confirmação                                                                                                                                                                       |
| Excluir **evento**                                                          | Permitido, com confirmação; **cascata** (pagadores e despesas)                                                                                                                                              |

### 4.7 Novo pagador adicionado depois

Ao cadastrar um pagador em evento que já tem despesas, ele **não** entra automaticamente em despesas existentes (não altera o histórico). Ele é pré-selecionado por padrão apenas em **novas** despesas. Para incluí-lo em uma despesa existente, o usuário edita a despesa.

---

## 5. Regras de rateio e saldo (núcleo do sistema)

Todos os valores em **centavos inteiros**. Cálculos ficam em serviços de domínio puros (`ShareCalculator`, `CommitmentCalculator`).

### 5.1 Cota de cada participante (`ShareCalculator`)

Para uma despesa com `amountCents = T` e `n` participantes (na ordem de `participantIds`):

- `base = floor(T / n)`
- `resto = T − base × n` (sempre `0 ≤ resto < n`)
- Cota do **primeiro participante** = `base + resto`; demais = `base`.
- A soma das cotas é **sempre exatamente T**.

Exemplos: R$ 100,00 ÷ 3 → 10000 centavos → base 3333, resto 1 → primeiro R$ 33,34, demais R$ 33,33. R$ 100,01 ÷ 3 → 10001 → base 3333, resto 2 → primeiro R$ 33,35, demais R$ 33,33.

### 5.2 Compromisso por pagador (`CommitmentCalculator`)

Considera **todas as despesas do evento, pagas e pendentes**. Para cada pagador `P`:

- **Parte total** = soma das cotas de `P` em todas as despesas em que participa.
- **Já pago** = soma de `amountCents` das despesas `PAID` com `payerId = P`.
- **Saldo do compromisso** = `Já pago − Parte total`.
  - **Negativo:** ainda deve ao evento (caso mais comum).
  - **Positivo:** pagou mais que sua parte (tem a receber das demais partes).
  - Zero: quitado.

Pagadores sem nenhuma despesa têm tudo zerado.

### 5.3 Totais do evento

- **Total de despesas** = soma de todas as despesas.
- **Total pago** = soma das `PAID`.
- **Total pendente** = soma das `PENDING`.
- **Custo por convidado** = `Total de despesas / guestCount`, arredondado ao centavo (`Math.round`); se `guestCount = 0`, exibir "—".
- **Propriedade de verificação:** `soma dos saldos de todos os pagadores = −Total pendente`. O agente deve garantir isso (pode usar `console.assert`/invariante interna no cálculo, sem testes).

### 5.4 Exemplo A (2 pagadores; dados do cliente)

A = Pais da noiva, B = Pais do noivo. Rateio igual, todos participam.

1. "Entrada do bar", R$ 500,00, **Paga por A** → cotas: A 250,00, B 250,00.
2. "Bar", R$ 2.500,00, **Pendente** → cotas: A 1.250,00, B 1.250,00.

|     | Parte total | Já pago   | Saldo            |
| --- | ----------- | --------- | ---------------- |
| A   | R$ 1.500,00 | R$ 500,00 | **−R$ 1.000,00** |
| B   | R$ 1.500,00 | R$ 0,00   | **−R$ 1.500,00** |

Total de despesas R$ 3.000,00 · Total pago R$ 500,00 · Total pendente R$ 2.500,00 · Soma dos saldos −R$ 2.500,00 ✔.
Se depois o Bar for marcado como **Pago por B**: A = −R$ 1.000,00 e B = +R$ 1.000,00 (soma 0, nada pendente).

### 5.4.1 Exemplo B (3 pagadores, restos e participação parcial)

Pagadores A, B, C (nessa ordem).

1. Entrada do bar, 50.000 centavos, paga por A, participam A, B, C → base 16666, resto 2 → A 16668, B 16666, C 16666.
2. Bar, 250.000, pendente, participam A, B, C → base 83333, resto 1 → A 83334, B 83333, C 83333.
3. Fotógrafo, 180.000, pago por B, participam **A e B** → 90000 cada.

|     | Parte total (centavos) | Já pago | Saldo                   |
| --- | ---------------------- | ------- | ----------------------- |
| A   | 190.002                | 50.000  | −140.002 (−R$ 1.400,02) |
| B   | 189.999                | 180.000 | −9.999 (−R$ 99,99)      |
| C   | 99.999                 | 0       | −99.999 (−R$ 999,99)    |

Total de despesas 480.000 · pago 230.000 · pendente 250.000 · soma dos saldos −250.000 ✔.

---

## 6. Persistência CSV

### 6.1 Convenções

- Pasta: `process.env.DATA_DIR ?? "./data"`; criada automaticamente. Arquivos criados com cabeçalho se não existirem.
- UTF-8, separador vírgula, aspas duplas conforme **RFC 4180** (campos com vírgula, aspas ou quebra de linha são escapados).
- Datas: `YYYY-MM-DD`; timestamps: ISO 8601; valores monetários: **centavos inteiros**; vazio = `null`.
- IDs UUID v4.
- **Escrita atômica:** gravar em arquivo temporário na mesma pasta e `rename` sobre o original.
- **Mutex em processo** (`FileMutex`) serializando read-modify-write por arquivo (single-user, mas evita corrida entre Server Actions simultâneas).
- Repositórios leem o arquivo inteiro a cada operação (volume pequeno); sem cache entre requisições. As páginas usam `export const dynamic = "force-dynamic"`.
- Mapeamento linha ↔ entidade fica **somente** na infraestrutura.

### 6.2 Arquivos e colunas

**`events.csv`**
`id,title,type,description,guest_count,event_date,created_at`

**`payers.csv`**
`id,event_id,name,description,contact,created_at`

**`expenses.csv`**
`id,event_id,name,supplier,category,amount_cents,notes,expense_date,status,payer_id,paid_at,created_at`

**`expense_participants.csv`**
`expense_id,payer_id,position`
(`position` guarda a ordem para o critério da sobra de centavos; a ordem deve coincidir com a ordem de criação dos pagadores.)

### 6.3 Cascata e consistência

- `DeleteEvent`: remove, na ordem, participantes das despesas do evento → despesas → pagadores → evento.
- `DeleteExpense`: remove participantes → despesa.
- `Expense` e participantes são gravados juntos pelo `ExpenseRepository` (`save(expense)` substitui as linhas de participantes da despesa).

---

## 7. Contratos de domínio e casos de uso

### 7.1 Interfaces de repositório (no domain de cada módulo)

```ts
interface EventRepository {
  findAll(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  save(event: Event): Promise<void>; // insert ou update
  delete(id: string): Promise<void>;
}
interface PayerRepository {
  findByEventId(eventId: string): Promise<Payer[]>; // ordenados por createdAt
  findById(id: string): Promise<Payer | null>;
  save(payer: Payer): Promise<void>;
  saveMany(payers: Payer[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
}
interface ExpenseRepository {
  findByEventId(eventId: string): Promise<Expense[]>; // com participantIds
  findById(id: string): Promise<Expense | null>;
  existsWithParticipant(payerId: string): Promise<boolean>;
  save(expense: Expense): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
}
```

### 7.2 Casos de uso

| Módulo     | Caso de uso                                  | Regras principais                                                                                                |
| ---------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| events     | `ListEvents({ search?, type? })`             | Filtro por título (contém, case-insensitive) e tipo; ordenar por `eventDate` desc                                |
| events     | `GetEvent(id)`                               | `NotFoundError` se não existir                                                                                   |
| events     | `CreateEventWithPayers({ event, payers[] })` | Mínimo 2 pagadores com nomes únicos; grava evento e pagadores; retorna `eventId`                                 |
| events     | `UpdateEvent`                                | Edita título, tipo, descrição, convidados, data                                                                  |
| events     | `DeleteEvent`                                | Cascata (seção 6.3)                                                                                              |
| payers     | `ListPayersByEvent`                          | Ordenado por criação                                                                                             |
| payers     | `AddPayer`                                   | Nome único no evento                                                                                             |
| payers     | `UpdatePayer`                                | Nome único no evento                                                                                             |
| payers     | `DeletePayer`                                | Regras da seção 4.6                                                                                              |
| expenses   | `ListExpensesByEvent`                        | Ordenar por `expenseDate` desc, depois `createdAt` desc                                                          |
| expenses   | `CreateExpense`                              | Invariantes 4.5; participantes padrão = todos os pagadores do evento (o formulário envia a lista)                |
| expenses   | `UpdateExpense`                              | Mesmas invariantes; bloqueia remover dos participantes quem é o pagador (resolvido pela invariante 2)            |
| expenses   | `DeleteExpense`                              | Remove despesa e participantes                                                                                   |
| settlement | `GetEventDashboard(eventId)`                 | Retorna totais do evento + array por pagador (`payerId`, `name`, `totalShareCents`, `paidCents`, `balanceCents`) |

### 7.3 Erros

`DomainError` (base) com `code` e `message` em **pt-BR**. Subtipos: `ValidationError`, `NotFoundError`, `BusinessRuleError`. Exemplos de mensagens:

- "Informe ao menos 2 pagadores."
- "Já existe um pagador com este nome neste evento."
- "Não é possível excluir o pagador: ele participa de despesas."
- "O pagador da despesa deve ser um dos participantes do rateio."
- "Despesa paga exige pagador e data de pagamento."

---

## 8. Camada de apresentação

### 8.1 Server Actions e `ActionResult`

Todas as actions ficam em `presentation/actions.ts` de cada módulo, com `"use server"`. Fluxo: `safeParse` do Zod → caso de uso → `revalidatePath` → retorno.

```ts
type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; fieldErrors?: Record<string, string[]> };
    };
```

Nenhuma action deve lançar exceção para o cliente: capturar `DomainError` e converter; erros inesperados viram "Erro inesperado. Tente novamente." (logar no servidor).

Actions: `createEventWithPayersAction`, `updateEventAction`, `deleteEventAction`, `addPayerAction`, `updatePayerAction`, `deletePayerAction`, `createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction`.

### 8.2 Schemas Zod (presentation/schemas.ts)

```ts
const eventTypeEnum = z.enum([
  "CASAMENTO",
  "ANIVERSARIO",
  "FORMATURA",
  "CORPORATIVO",
  "CONFRATERNIZACAO",
  "OUTRO",
]);
const categoryEnum = z.enum([
  "ESPACO_LOCAL",
  "BUFFET_ALIMENTACAO",
  "BEBIDAS_BAR",
  "DECORACAO",
  "MUSICA_SOM",
  "FOTO_VIDEO",
  "CERIMONIAL_ASSESSORIA",
  "CONVITES_PAPELARIA",
  "TRANSPORTE",
  "OUTROS",
]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

const eventSchema = z.object({
  title: z.string().trim().min(1, "Informe o título").max(120),
  type: eventTypeEnum,
  description: z.string().trim().max(500).optional().default(""),
  guestCount: z.coerce.number().int().min(0, "Número inválido"),
  eventDate: isoDate,
});

const payerSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80),
  description: z.string().trim().max(300).optional().default(""),
  contact: z.string().trim().max(120).optional().default(""),
});

const createEventWithPayersSchema = z.object({
  event: eventSchema,
  payers: z.array(payerSchema).min(2, "Informe ao menos 2 pagadores"),
});

const expenseSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome").max(120),
    supplier: z.string().trim().max(120).optional().default(""),
    category: categoryEnum,
    amountCents: z.number().int().positive("Informe um valor maior que zero"),
    notes: z.string().trim().max(500).optional().default(""),
    expenseDate: isoDate,
    status: z.enum(["PENDING", "PAID"]),
    payerId: z.string().uuid().nullable(),
    paidAt: isoDate.nullable(),
    participantIds: z
      .array(z.string().uuid())
      .min(1, "Selecione ao menos um participante"),
  })
  .superRefine((v, ctx) => {
    if (v.status === "PAID") {
      if (!v.payerId)
        ctx.addIssue({
          code: "custom",
          path: ["payerId"],
          message: "Informe quem pagou",
        });
      if (!v.paidAt)
        ctx.addIssue({
          code: "custom",
          path: ["paidAt"],
          message: "Informe a data do pagamento",
        });
      if (v.payerId && !v.participantIds.includes(v.payerId))
        ctx.addIssue({
          code: "custom",
          path: ["payerId"],
          message: "O pagador deve participar do rateio",
        });
    }
  });
```

O formulário trabalha o valor como texto ("1.234,56") e converte para centavos via `Money.fromReais` antes de enviar. Se o status for `PENDING`, o cliente envia `payerId: null` e `paidAt: null`.

### 8.3 Navegação (menu)

`AppBar` fixa no topo com o nome "EasySplit" e link "Eventos" (`/events`). Sem autenticação.

### 8.4 Telas

**Lista de eventos (`/events`)**

- Campo de busca por título e filtro (Select) por tipo, via query string (`?q=&type=`), processados no servidor.
- Botão **"Novo evento"** → `/events/new`.
- Cards ou tabela MUI: Título, Tipo, Data, Nº de convidados; clique leva a `/events/[eventId]`.
- Estado vazio: mensagem "Nenhum evento cadastrado" + botão "Novo evento".

**Wizard (`/events/new`)** (MUI `Stepper`, estado no cliente)

- Passo 1 "Evento": Título, Tipo (Select), Descrição (multiline), Nº de convidados, Data do evento.
- Passo 2 "Pagadores": lista dinâmica de pagadores (Nome, Descrição, Contato), iniciando com 2 linhas vazias; botões "Adicionar pagador" e remover (não permite menos de 2 linhas).
- Botões "Voltar", "Avançar", "Concluir". Ao concluir chama `createEventWithPayersAction` (grava tudo de uma vez) e redireciona para `/events/[eventId]`.
- Erros de campo exibidos nos inputs (`error` + `helperText`).

**Detalhe do evento (`/events/[eventId]`)** (Server Component; seções em ordem)

1. **Resumo:** Título, Tipo, Descrição, Nº de convidados, Data. Botão "Editar" abre `Dialog` com o formulário. Botão "Excluir evento" com `ConfirmDialog` (avisa a cascata) e redireciona para `/events`.
2. **Pagadores:** lista (Nome, Descrição, Contato) com ações editar/excluir e botão "Novo pagador" (`Dialog`). Falha de exclusão exibe a mensagem em `Snackbar`/`Alert`.
3. **Dashboard (cards numéricos, sem gráficos):**
   - Cards do evento: **Total de despesas**, **Total pago**, **Total pendente**, **Custo por convidado**.
   - Por pagador, um card com: **Parte total**, **Já pago**, **Saldo do compromisso**. Saldo negativo em vermelho (`error.main`), positivo em verde (`success.main`), zero em neutro. Rótulo auxiliar: negativo = "A pagar", positivo = "A receber".
   - Texto explicativo curto: "Saldo = Já pago − Parte total. Negativo indica o quanto ainda falta pagar aos fornecedores."
   - **Não** exibir lista de transferências "quem deve a quem".
4. **Despesas:** tabela MUI com Nome, Fornecedor, Categoria, Valor, Data, Status (`Chip`: Pendente em warning / Paga em success), Pagador, ações editar/excluir. Botão "Nova despesa" abre `Dialog`.
   - **Formulário de despesa:** Nome, Fornecedor, Categoria (Select), Valor (máscara BRL), Data da despesa, Observações, Status (Switch ou Select "Pendente/Paga"), e, **somente se Paga**, Pagador (Select, restrito aos participantes) e Data do pagamento. **Ratear entre:** checkboxes de todos os pagadores do evento, todos marcados por padrão, com texto "Divisão igual entre os selecionados" e prévia da cota por participante (calculada pelo `ShareCalculator`, apenas exibição).
   - Ao alternar para Pendente, limpar `payerId` e `paidAt`.
   - Para quitar uma despesa pendente: editar, definir status Paga, pagador e data.

### 8.5 Formatação

Helpers em `shared/presentation/formatters.ts`: `formatCurrency(cents)`, `formatDate("YYYY-MM-DD")` → `dd/MM/yyyy` (sem converter fuso: tratar string, não `new Date`), `eventTypeLabel`, `categoryLabel`.

---

## 9. Requisitos não funcionais

- `strict: true`; sem `any` injustificado; sem lógica de negócio em componentes React.
- Arquivos pequenos e coesos; nomes em inglês no código (entidades, métodos) e textos de UI em pt-BR.
- Imports de `fs` e repositórios apenas em código de servidor (`server-only`).
- Layout responsivo básico (MUI `Container`, `Grid`/`Stack`).
- Acessibilidade básica: labels nos inputs, `aria-label` nos ícones de ação.
- `.gitignore` inclui `data/`. `.env.example` com `DATA_DIR=./data`.

---

## 10. Plano de implementação (fases e tarefas)

Execute em ordem; ao final de cada fase o app deve compilar (`npm run build`) e a fase deve atender seus critérios.

### Fase 0: Setup

- Criar projeto Next.js (App Router, TypeScript, ESLint, `src/` dir).
- Instalar: `@mui/material @mui/icons-material @emotion/react @emotion/styled @mui/material-nextjs zod csv-parse csv-stringify server-only`.
- Configurar `ThemeRegistry` (AppRouterCacheProvider + ThemeProvider com `createTheme({}, ptBR)` + `CssBaseline`), `AppBar` no layout, `redirect("/events")` na raiz.
- Criar a estrutura de pastas da seção 3.3 e `.env.example`, `.gitignore`.
- **Aceite:** app sobe, mostra a AppBar e redireciona para `/events`.

### Fase 1: Shared kernel e persistência

- `Money`, `DomainError` e subtipos, `ids`.
- `CsvFile` (leitura/escrita atômica, cabeçalho automático, escape RFC 4180) e `FileMutex`.
- `ActionResult`, `formatters`, `ConfirmDialog`.
- **Aceite:** gravar/ler um CSV de exemplo preservando vírgulas, aspas e acentos.

### Fase 2: Módulos events e payers

- Domain, repositórios CSV, casos de uso, schemas, actions.
- `container.ts` com events e payers.
- Lista de eventos (busca/filtro), wizard de 2 passos, detalhe com seções Resumo e Pagadores (editar, adicionar, excluir com regras 4.6).
- **Aceite:** criar evento com 2+ pagadores pelo wizard; editar evento; adicionar/editar pagador; bloquear exclusão que deixaria < 2 pagadores; excluir evento remove suas linhas dos CSVs.

### Fase 3: Módulo expenses

- Domain (`Expense`, invariantes, enums, `ShareCalculator`), repositório CSV (despesa + participantes), casos de uso, schemas, actions.
- Tabela de despesas e formulário em `Dialog` conforme 8.4; exclusão com confirmação.
- Bloquear exclusão de pagador com participação em despesa; bloquear remoção do pagador da lista de participantes.
- **Aceite:** reproduzir os dois lançamentos do Exemplo A (Entrada do bar paga por A; Bar pendente) e editar o Bar para pago por B; validações de status/pagador/data funcionando.

### Fase 4: Módulo settlement (dashboard)

- `CommitmentCalculator`, `GetEventDashboard`, `DashboardCards`.
- Integrar o dashboard na tela de detalhe.
- **Aceite:** Exemplo A e Exemplo B (seção 5) produzem **exatamente** os valores documentados; soma dos saldos = −Total pendente; cores dos saldos corretas; custo por convidado "—" quando convidados = 0.

### Fase 5: Acabamento

- Estados vazios, `Snackbar` de sucesso/erro, loading nos botões durante a action, `loading.tsx`/`error.tsx`/`not-found.tsx` (evento inexistente → 404).
- Revisão final de SOLID/Clean Code (sem lógica de negócio na presentation, dependências apontando para dentro).
- **Aceite:** percorrer manualmente todo o fluxo da seção 11.

---

## 11. Checklist de aceite do MVP

1. Criar o evento "Casamento Tatiana & Mateus" (tipo Casamento, com data e nº de convidados) e os pagadores "Pais da noiva" e "Pais do noivo" pelo wizard.
2. Lançar "Entrada do bar" R$ 500,00, **Paga** por "Pais da noiva", ratear entre todos.
3. Lançar "Bar" R$ 2.500,00, **Pendente**, ratear entre todos.
4. Dashboard mostra: Total R$ 3.000,00; pago R$ 500,00; pendente R$ 2.500,00; Pais da noiva saldo −R$ 1.000,00; Pais do noivo saldo −R$ 1.500,00.
5. Editar o Bar para **Paga** por "Pais do noivo": saldos passam a −R$ 1.000,00 e +R$ 1.000,00.
6. Criar despesa com apenas um participante e verificar cota e saldo.
7. Tentar excluir pagador com despesas → bloqueado com mensagem. Tentar tirar o pagador dos participantes da própria despesa → bloqueado.
8. Excluir despesa e excluir evento (com confirmação) e conferir que os CSVs ficam consistentes.
9. Fechar e reabrir o app: os dados persistem nos arquivos de `./data`.
