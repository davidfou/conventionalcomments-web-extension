FROM node:14.16.0-buster
ARG DEBIAN_FRONTEND noninteractive
ENV NODE_ENV ci

WORKDIR /app

RUN apt-get update && apt-get install -y \
  dbus \
  libdbus-glib-1-2 \
  packagekit-gtk3-module \
  xvfb \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY scripts scripts

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
