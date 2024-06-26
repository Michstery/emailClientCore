# Dockerfile
FROM node:18-alpine


# Create app directory
WORKDIR /appServer

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000



CMD [ "npm", "run", "dev" ]
