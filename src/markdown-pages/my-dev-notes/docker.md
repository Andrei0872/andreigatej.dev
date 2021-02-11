---
title: "Docker Notes"
slug: /my-dev-notes/docker-notes
parent: "Dev Notes"
date: 2019-04-20
---

- [Concepts](#concepts)
  - [Container](#container)
  - [VM](#vm)
  - [Image](#image)
  - [OS kernel](#os-kernel)
  - [Useful Commands](#useful-commands)
    - [List names of all containers](#list-names-of-all-containers)

## Concepts

### Container

* an **isolated unit of software**(**code**, **libraries**, **services**, **dependencies**, **processes** - all **packaged up** together)

* virtualizes the OS

* is a **running instance** of an **image**

* more resources are shared between containers

### VM

* virtualizes the hardware

### Image 

* shareable chunk of functionality (server, db engine, Linux distribution)

### OS kernel

- **interacts** with the **hardware**

---

### Useful Commands

#### List names of all containers

```bash
docker ps -a --format="{{.Names}}"
```
