FROM node:20-alpine
     
WORKDIR /app
     
COPY package.json .
COPY package-lock.json .
     
RUN npm install

COPY authentication/ ./authentication
COPY bin/ ./bin
COPY models/ ./models
COPY routes/ ./routes
COPY app.js .
COPY db.js .
     
EXPOSE 2000

CMD npm start