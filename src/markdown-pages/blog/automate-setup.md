---
title: Automating my set-up on a fresh Ubuntu by using a bash script
publication: null
date: 2020-09-24
published: true
slug: /blog/automate-setup
tags: ["automation"]
---

*The Github repository can be found [here](https://github.com/Andrei0872/automate-setup-on-fresh-ubuntu)*.

It usually takes me around 30 minutes - 1 hour to set up everything I need in order to start working on a new OS(in this case, Ubuntu). So I figured it would be worth the time spent on building a script that would automate all of this. Moreover, bash scripting has always been something cryptic to me, so I thought this was a good opportunity to get comfortable with writing such scripts.  

## Usage

Open your terminal in your preferred location and create a file that will eventually be invoked in order to install the programs you'd need.

```bash
# `vim` could be replaced with your text editor of choice(e.g `gedit`)
touch setup && vim $_
```

Paste the content of the [`setup.sh` file](https://github.com/Andrei0872/automate-setup-on-fresh-ubuntu/blob/master/setup.sh) into the newly created file.

Run the script with:

```bash
sudo bash setup $HOME
```

We need `sudo` privileges because the script will install new programs on the OS and `$HOME` in order to properly place `ZSH` and to determine the user so we can add it to the `docker` group.

---

## How it works

The [file](https://github.com/Andrei0872/automate-setup-on-fresh-ubuntu/blob/master/setup.sh) comprises functions that will install the needed programs. Each function follows this pattern: `function installProgramToBeInstalled { }`.

For example:

```bash
# ...

function installGit {
  format_output "installing git"

  sudo apt install -y git

  echo
}

function installDocker {
  format_output "installing docker"

  curl -s https://get.docker.com/ | bash

  usermod -aG docker $user

  su - $user

  echo
}
# ...
```

Then, in order to invoke all the functions, I've used this logic:

```bash
functions="$(cat $0 | egrep -o install[A-Z]+[A-Za-z]+)"
for f in $functions; do $f;done
```

`$0` refers to the current file. With `egrep -o install[A-Z]+[A-Za-z]+)` we get all the *install* functions. Lastly, we loop through each function and invoke it.
