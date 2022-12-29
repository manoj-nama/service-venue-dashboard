FROM node:16.19.0

ENV DB_HOST postgres
ENV APP_ENV Test
ENV TZ Australia/Sydney

COPY . /app
WORKDIR /app
CMD ["sh", "-c", "npm ci && npm test"]
