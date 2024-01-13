# pull the base image
FROM node:14.5.0-alpine

# set the working direction
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./

COPY package-lock.json ./

RUN npm install -g npm@8.5.0

RUN npm install

# add app
COPY . ./
EXPOSE 3002
# start app
CMD ["npm", "start"]