FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ ./dist/
COPY src/db/schema.sql ./src/db/
ENV NODE_ENV=production
VOLUME ["/app/data"]
CMD ["node", "dist/index.js"]
