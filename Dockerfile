FROM node:20-alpine

WORKDIR /usr/src/app/backend

# Install postgresql-client for database management
RUN apk add --no-cache postgresql-client

COPY package.json .

RUN npm install -g pnpm

RUN pnpm install

COPY . .

ARG PORT=6977

EXPOSE ${PORT}

RUN chmod +x ./scripts/entrypoint.sh

ENTRYPOINT ["./scripts/entrypoint.sh"]

CMD ["pnpm", "run", "dev"]