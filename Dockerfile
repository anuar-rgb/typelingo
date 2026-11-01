FROM nginx:alpine
COPY site/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=8080
