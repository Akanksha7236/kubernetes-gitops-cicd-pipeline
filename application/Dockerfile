# In production, pin by digest: docker inspect --format='{{index .RepoDigests 0}}' node:20-alpine
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN npm install --omit=dev

FROM base AS release
RUN apk add --no-cache curl
ENV NODE_ENV=production
#COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/health >/dev/null || exit 1
CMD ["node", "server.js"]
