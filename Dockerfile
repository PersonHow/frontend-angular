FROM node:20-alpine as build-stage 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# (選用) 如果你有自定義 nginx.conf (例如處理 Vue/React 的 History Mode 路由)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 啟動 Nginx (預設就是 80 port)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
