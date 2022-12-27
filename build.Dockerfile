FROM docker-env.artifacts.tabdigital.com.au/tabcorp-node:16

ENV DB_HOST postgres
ENV APP_ENV Test
ENV TZ Australia/Sydney

RUN apk update
RUN apk add --update postgresql python3 make g++

COPY . /app
WORKDIR /app
CMD ["sh", "-c", "npm ci && npm test"]
