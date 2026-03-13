# Trainify API

Uma API de alta performance e type-safe que serve como motor do ecossistema Trainify. Projetada com foco em experiência do desenvolvedor, escalabilidade e integração com IA.

## A Solução

A Trainify API fornece uma infraestrutura robusta para gerenciamento de treinos, acompanhamento e planejamento personalizado de exercícios. A solução vai além de operações CRUD simples ao integrar capacidades avançadas de IA para auxiliar usuários na otimização de seus regimes de treinamento.

### Pilares Fundamentais
- **Type-Safety First**: Utilização de TypeScript e Zod para garantir type safety de ponta a ponta, do esquema do banco de dados à resposta da API.
- **Arquitetura Moderna**: Construída sobre Fastify para performance líder do mercado e design modular baseado em plugins.
- **Integração com IA**: Integração nativa com AI SDKs para fornecer insights inteligentes sobre treinamento.
- **Foco no Desenvolvedor**: Documentação automática da API com Swagger/Scalar e manipulação eficiente de dados com Drizzle ORM.

## Tecnologias

- **Runtime**: Node.js 24+ (ESM)
- **Framework**: Fastify
- **Banco de Dados**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Autenticação**: Better Auth
- **Validação**: Zod
- **IA**: AI SDK (Google)
- **Ferramentas**: Biome para linting/formatting, tsx para desenvolvimento.

## Módulos Principais

O sistema é organizado em módulos autocontidos em `src/modules`:
- `auth`: Gerenciamento seguro de identidade.
- `workout-plans`: Lógica principal para criação e gerenciamento de programas de treino.
- `workout-sessions`: Acompanhamento do progresso ativo durante os treinos.
- `ia`: Geração de exercícios e insights assistidos por IA.
- `stats`: Agregação de dados para acompanhamento de performance.

## Primeiros Passos

### Pré-requisitos
- Node.js 24 (ou 22 com suporte a `--env-file`)
- Pnpm (recomendado)

### Instalação
```bash
pnpm install
```

### Configuração de Ambiente
Copie `.env.example` para `.env` e preencha suas credenciais:
```bash
cp .env.example .env
```

### Desenvolvimento
```bash
pnpm dev
```

### Gerenciamento de Banco de Dados
- **Gerar Migrações**: `pnpm drizzle:migrate`
- **Studio (GUI)**: `pnpm drizzle:studio`
- **Seed**: `pnpm drizzle:seed`

## Filosofia da Arquitetura

O projeto segue uma estrutura modular onde cada funcionalidade encapsula suas próprias rotas, lógica de serviço e esquemas. Esta abordagem garante alta capacidade de manutenção e clara separação de responsabilidades à medida que a plataforma escala.

---
*Desenvolvido para performance em treinamento de alto nível.*