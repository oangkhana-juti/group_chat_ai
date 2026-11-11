# Stage 1: build React
FROM node:20-alpine AS client
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client .
RUN npm run build

# Stage 2: Express เสิร์ฟทั้ง API และ React ที่ build แล้ว
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server .
COPY --from=client /client/dist ./public
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "index.js"]
