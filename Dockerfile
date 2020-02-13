### Build
FROM node:12.14.1 as builder

# Prepare build environment
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install dependencies (with dev dependencies)
COPY package.json /usr/src/app/package.json
RUN npm install

# Copy source files and build project
COPY . /usr/src/app
RUN npm run build

### Production
FROM node:12.14.1

LABEL maintainer="Fabian Bäumer <fabian.baeumer@rub.de>"
ENV NODE_ENV=production

# Prepare production environment
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install dependencies (without dev dependencies)
COPY package.json /usr/src/app/package.json
RUN npm install

# Copy compiled typescript from builder
COPY --from=builder /usr/src/app/dist /usr/src/app

EXPOSE 3000
USER 999:999
ENTRYPOINT [ "node", "." ]
