# 階段 1: 建置階段
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 執行 package.json 中的 build 指令
RUN npm run build

# 階段 2: 伺服器階段
FROM nginx:alpine
# 注意：Angular 17+ 的產出路徑通常在 dist/frontend-angular/browser
COPY --from=build-stage /app/dist/frontend-angular/browser /usr/share/nginx/html
# 複製您的 nginx.conf 以支援 Angular 路由
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
