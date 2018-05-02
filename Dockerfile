FROM node:9-alpine
MAINTAINER Fabio Pavesi <fabio@adamassoft.it>

COPY ./ /app

WORKDIR /app

RUN npm i -g nodemon
RUN npm i --silent
EXPOSE 3000

WORKDIR /app/src

CMD ["node", "index.js"]