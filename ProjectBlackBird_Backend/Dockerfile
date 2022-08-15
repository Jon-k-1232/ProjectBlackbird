FROM node:current-alpine3.15

WORKDIR /app
COPY ./package.json ./
RUN npm i --force
COPY . .
CMD ["npm", "start"]
