FROM node:18-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# NOTE: Since this is local dev, we run next dev
CMD ["npm", "run", "dev"]
