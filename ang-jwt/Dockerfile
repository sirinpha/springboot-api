# Stage 1: Build Angular app
FROM node:latest AS builder

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps
RUN npm run build --prod


FROM nginx:alpine

COPY src/nginx/etc/conf.d/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/ang-jwt/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
