FROM ubuntu:focal-20211006
ARG NODE_VERSION=22.13.1
ARG DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV ci
ENV TZ Europe/Brussels
ENV PATH $PATH:/usr/local/lib/nodejs/node-v${NODE_VERSION}-linux-x64/bin

RUN apt-get update \
  && apt-get install -y \
  # Install node dependency
  curl \
  # Install node-canvas dependencies
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  # Playwright dependency (avoids interactive mode)
  tzdata \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /usr/local/lib/nodejs \
  && curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz | tar -xJ -C /usr/local/lib/nodejs \
  && npm install -g yarn@1.22.17

WORKDIR /root

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY scripts scripts

RUN yarn install --frozen-lockfile \
  && yarn playwright install --with-deps chromium

COPY . .

RUN yarn build
