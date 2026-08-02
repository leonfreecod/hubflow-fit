FROM node:25-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig*.json vite.config.ts ./
COPY src ./src

ARG VITE_API_URL=/api
ARG VITE_DATA_SOURCE=api
ARG VITE_DEMO_MODE=false
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DATA_SOURCE=${VITE_DATA_SOURCE}
ENV VITE_DEMO_MODE=${VITE_DEMO_MODE}

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 8080
