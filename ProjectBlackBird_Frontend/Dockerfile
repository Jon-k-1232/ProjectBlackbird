# Dockerfile_App2_Frontend
# Pull official base image
FROM node:current-alpine3.15 as build

# Set the time zone
ENV TZ=America/Phoenix
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .
CMD ["npm", "run", "start"]
