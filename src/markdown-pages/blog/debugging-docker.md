---
slug: /blog/debugging-docker-source-code
title: "Debugging Docker's source code"
tags: ["docker"]
published: false
date: 2020-08-30
---

some intro

* debugging with the help of containers will also ensure that the docker daemon is created with _root privileges_

## Docker CLI

**docker-compose.yml**

```dockerfile
version: '3'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.debug
    volumes:
    - /path/to/current/dir/:/go/src/github.com/docker/cli
    ports: 
    - "2345:2345"
```

**Dockerfile.debug**

```dockerfile
ARG GO_VERSION=1.13.12
# :${GO_VERSION}-alpine

FROM golang
WORKDIR /go/src/github.com/docker/cli
EXPOSE 2345

RUN go get github.com/derekparker/delve/cmd/dlv

ENV     CGO_ENABLED=0 \
  DISABLE_WARN_OUTSIDE_CONTAINER=0

CMD ["dlv", "debug", "/go/src/github.com/docker/cli/cmd/docker", "--headless", "--listen=:2345", "--api-version=2", "--log", "--", "run", "test"]
```

**launch.json**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug into Docker",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "remotePath": "/go/src/github.com/docker/cli/",
      "port": 2345,
      "host": "127.0.0.1",
      "showLog": true,
    }
  ]
}
```

steps:

* `docker-compose up --build`
* press `F5`, after you see something like `app_1  | API server listening at: [::]:2345` printed in the terminal

---

## Docker Engine

make sure you run `make build` so the `bundles/` directory is created

**docker-compose.yml**

```dockerfile
version: '3'

services: 
  app:
    tty: true
    cap_add: 
      - NET_ADMIN
    build:
      context: .
      dockerfile: Dockerfile.debug
    volumes: 
    - /path/to/current/dir/:/go/src/github.com/docker/docker
    ports: 
    - "2345:2345"
```

**Dockerfile.debug**

```dockerfile
FROM golang
WORKDIR /go/src/github.com/docker/docker
EXPOSE 2345

RUN go get github.com/derekparker/delve/cmd/dlv

RUN apt-get update && apt-get install -y --no-install-recommends \
  binutils-mingw-w64 \
  g++-mingw-w64-x86-64 \
  libapparmor-dev \
  libbtrfs-dev \
  libdevmapper-dev \
  libseccomp-dev \
  libsystemd-dev \
  libudev-dev

RUN apt-get update && apt-get install -y --no-install-recommends \
            apparmor \
            aufs-tools \
            bash-completion \
            bzip2 \
            iptables \
            jq \
            libcap2-bin \
            libnet1 \
            libnl-3-200 \
            libprotobuf-c1 \
            net-tools \
            pigz \
            python3-pip \
            python3-setuptools \
            python3-wheel \
            sudo \
            thin-provisioning-tools \
            uidmap \
            vim \
            vim-common \
            xfsprogs \
            xz-utils \
            zip

COPY ./bundles/binary-daemon/* /usr/local/bin/

# bundles/binary-daemon/dockerd
# COPY . /go/src/github.com/docker/docker

CMD ["dlv", "debug", "github.com/docker/docker/cmd/dockerd/", "--headless", "--listen=:2345", "--api-version=2", "--log"]

# dlv debug github.com/docker/docker/cmd/dockerd/ --headless --listen=:2345 --api-version=2 --log
```

**launch.json**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug into Docker",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "remotePath": "/go/src/github.com/docker/docker/",
      "port": 2345,
      "host": "127.0.0.1",
      "showLog": true
    }
  ]
}
```

steps:

* `docker ps` - get the id of the running container
* `docker exec -it <ID> bash` - enter into the running container
* `curl --unix-socket /var/run/docker.sock http://localhost/_ping` - test the API
