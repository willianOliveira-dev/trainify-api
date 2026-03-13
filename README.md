# Trainify API

<div align="center">
  <img src="https://trainify-api-mljg.onrender.com/static/logo/logo.png" alt="Trainify API Banner" width="100%"/>
  
  <br/>
  <img src="https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Fastify-5.x-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle"/>
  <img src="https://img.shields.io/badge/Google_AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google AI"/>
</div>

<br/>

Motor inteligente para geração e gestão de treinos personalizados. Uma API de alta performance que combina Type Safety, Integração com IA e Arquitetura Modular.

---

## Sobre o Projeto

A Trainify API é o coração do ecossistema Trainify. Diferente de soluções convencionais, nossa API vai além do CRUD tradicional ao integrar inteligência artificial generativa para criar planos de treino verdadeiramente personalizados.

### Diferenciais
- **Geração Inteligente**: Utiliza Google AI (Gemini) para criar planos adaptados ao perfil de cada usuário
- **Performance Extrema**: Construída com Fastify, um dos frameworks Node.js mais rápidos
- **Type-Safety**: TypeScript e Zod garantem consistência de tipos do banco à resposta da API
- **Arquitetura Modular**: Cada domínio encapsulado em seu próprio módulo

---

## Documentação da API

A API conta com documentação interativa Swagger disponível em **`/docs`**, gerada automaticamente a partir dos schemas Zod para garantir sincronia com a implementação.

---

## Tecnologias

| Categoria | Tecnologias |
|-----------|-------------|
| **Core** | Node.js 24, Fastify 5, TypeScript 5 |
| **Banco de Dados** | PostgreSQL (Neon), Drizzle ORM |
| **Autenticação** | Better Auth, Zod |
| **Integrações** | AI SDK, Google AI (Gemini) |
| **Qualidade** | Biome, Husky |

---

## Primeiros Passos

### Pré-requisitos
- Node.js 24.x (ou 22.x com suporte a `--env-file`)
- pnpm (recomendado)
- Conta no Neon (PostgreSQL serverless)
- Chave da API Google AI

### Instalação

```bash
git clone https://github.com/willianOliveira-dev/trainify-api.git
cd trainify-api
pnpm install
cp .env.example .env
```

Configure as variáveis no arquivo `.env`:
```env
DATABASE_URL=sua_url_do_neon
BETTER_AUTH_SECRET=seu_secret
BETTER_AUTH_URL=http://localhost:3333
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api
```

### Banco de Dados

```bash
pnpm drizzle:migrate    # Gerar e aplicar migrações
pnpm drizzle:studio      # Interface gráfica do banco
pnpm drizzle:seed        # Popular com dados de exemplo
```

### Execução

```bash
pnpm dev    # Modo desenvolvimento
pnpm build  # Build para produção
pnpm start  # Modo produção
```

---

## Módulos

- **Auth**: Gerenciamento de identidade com Better Auth
- **Workout Plans**: CRUD e lógica de planos de treino
- **Workout Sessions**: Acompanhamento de treinos em tempo real
- **IA**: Integração com Google AI para geração inteligente
- **Stats**: Agregação de métricas e desempenho

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor em desenvolvimento |
| `pnpm build` | Compila para produção |
| `pnpm start` | Inicia servidor em produção |
| `pnpm drizzle:migrate` | Aplica migrações |
| `pnpm drizzle:studio` | Abre interface do banco |
| `pnpm lint` | Verifica problemas de código |
| `pnpm format` | Formata código automaticamente |

---

## Integração com Frontend

A API foi projetada para funcionar com o [Trainify Frontend](https://github.com/willianOliveira-dev/trainify-frontend), um aplicativo Next.js que adiciona vídeos do YouTube para demonstração dos exercícios.

### Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/*` | Autenticação |
| GET | `/api/workout-plans` | Lista planos do usuário |
| POST | `/api/ia/generate-workout` | Gera treino com IA |
| POST | `/api/workout-sessions` | Inicia nova sessão |

---

## Estrutura do Projeto

```
src/
├── modules/           # Módulos funcionais
│   ├── auth/         # Autenticação
│   ├── ia/           # Integração com IA
│   ├── stats/        # Métricas
│   ├── workout-plans/ # Planos de treino
│   └── workout-sessions/ # Sessões ativas
├── db/               # Configuração do banco
├── lib/              # Utilitários
└── server.ts         # Entry point
```

---

## Aviso Legal

Este projeto foi desenvolvido exclusivamente para fins educacionais e como parte de portfólio pessoal.

- **Direitos Autorais**: A integração com a API do YouTube é utilizada apenas para busca de vídeos públicos. O Trainify não hospeda, reivindica autoria ou possui direitos sobre os vídeos exibidos.
- **Natureza do Projeto**: Este não é um produto comercial. Os planos gerados por IA são demonstrações e não substituem orientação profissional qualificada.
- **Uso do Código**: Sinta-se à vontade para explorar e usar como referência para seus próprios estudos.