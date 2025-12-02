server {
    if ($host = crm.5lb.pro) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name crm.5lb.pro;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;


}

server {
    listen 443 ssl http2;
    server_name crm.5lb.pro;

    # SSL Certificates - managed by Certbot
    ssl_certificate /etc/letsencrypt/live/crm.5lb.pro/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/crm.5lb.pro/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_trusted_certificate /etc/letsencrypt/live/crm.5lb.pro/chain.pem;

    # Пока сертификатов нет, можно использовать самоподписанные или закомментировать 443 блок и проверить на 80 порту без редиректа
    # Но для продакшена нужен HTTPS.

    root /var/www/5lb-crm;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    # Frontend отправляет запросы на /crm-api/..., а бэкенд ждет /api/...
    location /crm-api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    client_max_body_size 10M;
    access_log /var/log/nginx/crm-5lb.access.log;
    error_log /var/log/nginx/crm-5lb.error.log;

}
