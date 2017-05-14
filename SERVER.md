# Setting up OVH server to host the app

* set up DNS entries for IPv4 and IPv6 at hover
* set up reverse DNS for IPs at OVH
* change /etc/hostname
* change root password

# sshd

* change the following settings, and `service ssh restart`

```
Port 22001
LoginGraceTime 30
PermitRootLogin no
```

# regular user setup

```
# interactive user setup
adduser andy

# andy can sudo, read logs
usermod -G adm,sudo -a andy

# from a local machine
ssh-copy-id -i ~/.ssh/id_ecdsa andy@hostname
```

# useful packages

```
apt-get install aptitude

# in aptitude update everything, and reboot
```

# need dns

Installing unbound just worked...

Didn't need to muck with /etc/network/interface settings

# packages to install

## done

```
unbound
molly-guard
iptables-persistent
nginx
letsencrypt
git # already, apparently
sqlite3
```

## not done

```
etckeeper
daily log summary thing - logwatch
email sender thing
```

# iptables

saved some rules to /etc/iptables/rules.v4

maybe `ufw` is a better way to manage this

# ipv6

will this ever work?

# nginx with letsencrypt

https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04

Instead of xenial letsencrypt, use certbot:

https://certbot.eff.org/#ubuntuxenial-nginx

```
sudo cp cron/letsencrypt-renew /etc/cron.d
```

History for initial cert & renewal:

```
letsencrypt certonly -a webroot --webroot-path=/var/www/html -d HOSTNAME
```

Same as what's in the cron/letsencrypt-renew script
```
/usr/bin/certbot renew --webroot --webroot-path=/var/www/html --pre-hook "service nginx stop" --post-hook "service nginx start"
```

# node

https://nvm.sh - want node >=7.6.0

nvm install v7.7.1
npm install -g yarn

https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
