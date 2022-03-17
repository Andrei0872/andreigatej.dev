# andreigatej.dev

- [andreigatej.dev](#andreigatejdev)
  - [Deploying with one command](#deploying-with-one-command)
  - [Setting up the SSH keys](#setting-up-the-ssh-keys)

## Deploying with one command

1. Somewhere on a VPS, I create a bare **git repo**

```bash
git init --bare
```

2. Create a post-receive hook

```bash
cd hooks/ && vim post-receive
```

Which would have this content

```bash
#!/bin/bash

cd /path/to/andrei-website/app

git --git-dir=/path/to/andrei-website/andrei-website.git --work-tree=/path/to/andrei-website/app checkout master -f

# In case you're using `nvm`, you'll have to explicitly define the
# path where `npm` can be found.
export PATH=$PATH:/home/$USER/.nvm/versions/node/v16.14.0/bin

npm install && npm run build
```

One last step would be to make this file executable:

```bash
sudo chmod +x post-receive
```

3. Configure NGINX

```bash
cd /etc/nginx/conf.d
touch andreigatej.dev.conf && vim $_
server {
  listen 80;
  listen [::]:80;
  server_name andreigatej.dev www.andreigatej.dev;

  root /var/www/andreigatej.dev/public;
  index index.html;
}
```

4. Create a symlink from `/var/www`

```bash
cd /var/www

sudo ln -s /path/to/andrei-website/app/ andreigatej.dev
```

That way, every time we deploy, NGINX will automatically pick up the updated contents.

5. Add a new remote from the local computer

```bash
git remote add prod ssh://username@YOURID/path/to/andrei-website/andrei-website.git
```

6. Deploy

```bash
# assuming I'm on the local machine

# push to Github repo - won't deploy the app
git push

# push to the bare repo - deploy
git push prod master
```

---

## Setting up the SSH keys


1. Create a pair of keys(public and private)

```bash
ssh-keygen -b 4096 -t rsa
```

2. Add the public key to the remote host

```bash
# Optionally, you can use `ssh-copy-id -n username@andreigatej.dev`
# to just print the key what would be added to the remote host.
ssh-copy-id username@andreigatej.dev
```

3. Try logging into the remote machine

```bash
ssh username@andreigatej.dev
```