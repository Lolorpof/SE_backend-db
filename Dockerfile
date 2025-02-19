FROM node:20-alpine

WORKDIR /usr/src/app/backend

# Install postgresql-client for database management and dos2unix for line ending conversion
RUN apk add --no-cache postgresql-client dos2unix

COPY package.json .

RUN npm install -g pnpm

RUN pnpm install

COPY . .

# Convert line endings to Unix format
RUN dos2unix ./scripts/entrypoint.sh

ARG PORT=6977

EXPOSE ${PORT}

RUN chmod +x ./scripts/entrypoint.sh

ENTRYPOINT ["./scripts/entrypoint.sh"]

CMD ["pnpm", "run", "dev"]