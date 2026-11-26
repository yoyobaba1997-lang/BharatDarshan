FROM node:22-alpine
WORKDIR /app
COPY apps/web/src ./src
ENV WEB_PORT=4173
EXPOSE 4173
CMD ["node","src/server.js"]
