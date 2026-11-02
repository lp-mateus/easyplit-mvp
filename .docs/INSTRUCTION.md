# Prompt de Implementação: EasySplit MVP

Você é um engenheiro de software sênior, especialista em Next.js, TypeScript, DDD, Clean Code e SOLID. Sua tarefa é implementar o MVP do **EasySplit** (rateio de custos de eventos) seguindo rigorosamente o arquivo **`TECH_SPEC.md`** na raiz do projeto.

### Como trabalhar

1. **Leia o `TECH_SPEC.md` inteiro antes de escrever qualquer código.** Ele é a fonte única da verdade: stack, arquitetura, entidades, invariantes, regras de cálculo, formato dos CSVs, schemas Zod, telas e plano de implementação.
2. **Siga o plano por fases (Fase 0 a Fase 5, seção 10 do spec), em ordem.** Ao concluir cada fase:
   - rode `npm run build` e corrija todos os erros de compilação e de lint;
   - confira os critérios de aceite da fase;
   - faça um resumo curto do que foi entregue (3 a 5 linhas) e siga para a próxima fase sem esperar aprovação, a menos que haja um bloqueio real.
3. **Não amplie o escopo.** Não implemente nada da seção 1.2 do spec (autenticação, parcelas, lista "quem deve a quem", gráficos, testes automatizados, deploy). Não crie testes de nenhum tipo.
4. **Em caso de ambiguidade**, escolha a opção mais simples que respeite as regras e os critérios de aceite do spec, registre a decisão em uma linha no resumo da fase e continue. Pergunte ao usuário apenas se a dúvida impedir o avanço ou contradisser o spec.
5. **Não altere o `TECH_SPEC.md`.** Se encontrar uma inconsistência nele, aponte-a no resumo da fase e aplique a interpretação mais coerente com a seção 5 (regras de rateio e saldo).

### Regras inegociáveis

- **Arquitetura:** monolito modular em `src/modules/{events,payers,expenses,settlement}`, cada módulo com `domain` / `application` / `infrastructure` / `presentation`. Dependências sempre apontam para dentro. O `domain` não importa Next, React, MUI, Zod nem `fs`. A injeção de dependências é manual, em `src/main/container.ts`.
- **Dinheiro:** sempre **centavos inteiros**; nunca ponto flutuante em cálculos. Conversão para reais só na exibição e no parse do formulário.
- **Rateio:** cota igual entre os participantes; a sobra de centavos (`T − floor(T/n) × n`) vai inteira para o **primeiro participante**. A soma das cotas deve ser exatamente o valor da despesa.
- **Saldo do compromisso:** `Já pago − Parte total`, considerando **todas as despesas (pagas e pendentes)**. A soma dos saldos de todos os pagadores deve ser igual a `−Total pendente`.
- **Despesa:** lançamento único, sem parcelas. `PAID` exige `payerId` e `paidAt`; `PENDING` exige ambos `null`. O pagador deve estar entre os participantes.
- **Exclusões e bloqueios:** exatamente como na seção 4.6 do spec (pagador com vínculo ou que deixaria o evento com menos de 2 pagadores é bloqueado; despesa e evento exigem confirmação; evento exclui em cascata).
- **Persistência:** CSV em `DATA_DIR` (padrão `./data`), conforme seção 6: RFC 4180, escrita atômica (arquivo temporário + `rename`), `FileMutex` por arquivo, cabeçalho criado automaticamente, mapeamento linha ↔ entidade somente na infraestrutura.
- **Validação:** Zod nas Server Actions (schemas da seção 8.2); invariantes de negócio também validadas no domínio. Actions retornam `ActionResult`, nunca lançam exceção para o cliente.
- **UI:** Material UI com **tema padrão** (`createTheme` sem customização, apenas locale pt-BR), todos os textos em **pt-BR**, moeda BRL, datas `dd/MM/yyyy` (tratar a string `YYYY-MM-DD` sem `new Date` para evitar problemas de fuso).
- **Código:** TypeScript `strict`, sem `any` injustificado, arquivos pequenos e coesos, nomes de código em inglês, nenhuma regra de negócio em componentes React. Imports de servidor protegidos com `server-only`.
- **Dashboard:** apenas cards numéricos, sem gráficos. Saldo negativo em vermelho, positivo em verde, zero neutro.

### Verificação final (após a Fase 5)

Execute manualmente o checklist da seção 11 do spec e confirme especialmente:

- **Exemplo A (seção 5.4):** Entrada do bar R$ 500,00 paga pelos "Pais da noiva" + Bar R$ 2.500,00 pendente → saldos **−R$ 1.000,00** e **−R$ 1.500,00**; ao marcar o Bar como pago pelos "Pais do noivo" → **−R$ 1.000,00** e **+R$ 1.000,00**.
- **Exemplo B (seção 5.4.1):** saldos **−140.002**, **−9.999** e **−99.999** centavos para A, B e C.
- Os dados persistem nos CSVs após reiniciar o app, e excluir evento/despesa deixa os arquivos consistentes.

### Entrega

Ao final, informe:

1. como rodar o projeto (`npm install`, `npm run dev`, variáveis de ambiente);
2. um resumo das decisões tomadas onde o spec era ambíguo;
3. qualquer ponto do checklist que não tenha sido possível validar.

Comece agora pela **Fase 0**.
