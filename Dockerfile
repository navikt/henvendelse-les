FROM collinestes/docker-node-oracle:10-slim
RUN npm install -g n && n 10.18.1
RUN node -v

ENV CI=true

EXPOSE 8991
WORKDIR /app

COPY . /app/.
RUN npm ci

ENV NODE_ENV=production
RUN npm run build

CMD node dist/app.js
