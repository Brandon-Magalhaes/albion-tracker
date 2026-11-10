# Albion Tracker

Aplicação web em **Next.js** para consultar dados públicos de **Albion Online**: busca de jogadores, feed global de eventos PvP e detalhe de cada evento.

**Demo:** https://albion-tracker.vercel.app

## Funcionalidades

- Busca de jogadores por nome, com os dados públicos do jogo.
- Feed global de eventos PvP.
- Página de detalhe do evento: participantes, builds, armas e zonas.
- Rotas de API próprias que encapsulam a API pública do jogo — o front não fala direto com o serviço externo.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · date-fns · lucide-react

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

O script `dev` usa **webpack** para contornar um problema observado com o Turbopack neste ambiente Windows.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `app/api/albion/search/route.ts` | busca de jogadores |
| `app/api/albion/events/route.ts` | eventos recentes |
| `app/api/albion/events/global/route.ts` | feed global de eventos PvP |
| `app/api/albion/event/[id]/route.ts` | detalhe de um evento |
| `app/event/[id]` | página do evento |
| `.data/albion-history.json` | histórico local usado para comparação |

## Observações

- Os dados vêm da API pública do Albion Online. Projeto não afiliado à Sandbox Interactive GmbH.
- Não há testes automatizados.
