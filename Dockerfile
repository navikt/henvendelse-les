FROM collinestes/docker-node-oracle:10
RUN npm install -g n && n lts
RUN node -v

ENV CI=true

EXPOSE 8991
WORKDIR /app

COPY . /app/.
RUN npm ci

ENV NODE_ENV=production
RUN npm run build

RUN ls -R /dist

COPY /dist/. /app/dist/.
CMD node ./dist/app.js
