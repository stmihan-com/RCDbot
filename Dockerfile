FROM node:22-alpine AS build
WORKDIR /usr/app

COPY . .

RUN npm install
RUN npm run build
run npm run migrate

ENV NODE_ENV=production
CMD ["npm", "start"]

