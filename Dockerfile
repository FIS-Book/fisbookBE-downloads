FROM node:20-alpine
     
WORKDIR /app
     
COPY package.json .
COPY package-lock.json .
     
RUN npm install

COPY authentication/ ./authentication
COPY bin/ ./bin
COPY models/ ./models
COPY public/ ./public
COPY routes/ ./routes
COPY app.js .
     
EXPOSE 2000

CMD npm start