ARG PORT

FROM node:current-alpine3.21 AS builder

WORKDIR /usr/src/testify-backend

COPY package*.json .

RUN npm i

COPY . .

RUN npm run build

FROM node:current-alpine3.21

WORKDIR /usr/src/testify-backend

COPY --from=builder /usr/src/testify-backend/dist ./dist
COPY --from=builder /usr/src/testify-backend/node_modules ./node_modules

EXPOSE $PORT

ENTRYPOINT [ "node", "dist/src/main.js" ]



