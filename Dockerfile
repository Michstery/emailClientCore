# Dockerfile
FROM node:14


# Create app directory
WORKDIR /appServer

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000



CMD [ "node", "appServer.js" ]
