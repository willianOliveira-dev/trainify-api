# ------ Base Stage ------
FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Ativa o corepack para usar o pnpm sem instalação extra
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /app

# Copia arquivos de configuração de pacotes
COPY package.json pnpm-lock.yaml ./

# ------ Dependencies Stage ------
FROM base AS deps

# Configura o pnpm para criar um node_modules "flat" ou tradicional se necessário, 
# ou apenas garante que ele instale tudo. Para tsc no Docker, node-linker=hoisted 
# pode ser mais seguro se houver problemas de symlink, mas o padrão deve funcionar se não copiarmos o node_modules do host.
RUN pnpm install --frozen-lockfile

# ------ Build Stage ------
FROM deps AS build

# Copia o restante do código fonte (agora respeitando o .dockerignore)
COPY . .

# Executa o build (compilação TS + resolução de aliases + cópia de assets estáticos)
RUN pnpm run build

# ------ Production Stage ------
FROM base AS production

# Define o ambiente como produção
ENV NODE_ENV=production

# Instala apenas as dependências de produção
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copia o resultado do build
COPY --from=build /app/dist ./dist

# Expõe a porta definida no seu app
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
