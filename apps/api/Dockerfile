FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/catalog ./packages/catalog
COPY packages/adapters ./packages/adapters
COPY apps/api/src ./apps/api/src
ENV PORT=3000
EXPOSE 3000
CMD ["node","apps/api/src/server.js"]
