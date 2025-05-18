FROM node:latest AS builder
RUN mkdir -p /app

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps
RUN npm run build --prod

#CMD ["npm","start"]

FROM nginx:alpine
COPY src/nginx/etc/conf.d/default.conf /etc/conf.d/default.conf
COPY --from=builder app/dist/ang-jwt /usr/share/nginx/html

