# spatialmeetings

Spatial meetings web application.
Try it using Firefox browser on [www.spatialmeetings.live](https://www.spatialmeetings.live), until 9/12/2020 when our DigitalOcean free credit expires.

This project doesn't work on Chrome and Chromium based browsers because of [this Chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?can=2&q=121673&colspec=ID%20Pri%20M%20Iteration%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified&id=121673)

_____________________________

## Requirements

This project runs on Linux systems, you need:

* Node version >= v10.0.0, to install LTS:
```bash 
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash - sudo apt-get install -y nodejs

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs
```

* Make, to install it:
```bash
sudo apt-get install build-essential
```
* Angular, to install it:
```bash
npm install -g @angular/cli
```
* Python 2 or 3

## Installation

1. Clone the project

```bash
git clone https://github.com/Shawarma-ASSD/spatialmeetings.git
cd spatialmeetings
```

2. Install dependencies on server and client:
    
```bash
cd app
sudo npm install
cd ../server
# This step takes a while
npm install 
```

## Run it locally

1. Change the IP on the [server/config.js](server/config.js) file to [your Private IP](https://tecadmin.net/check-ip-address-ubuntu-18-04-desktop/)
2. Build the angular project:

```bash
cd app
# This step takes about a minute
sudo npm run build
```

3. Run the server, from the root directory:
```bash
# Needs sudo to access the SSL certificates
sudo npm start
```

4. Open Firefox and go to https://localhost:8080 on different tabs, you need to login with different email addresses. 

5. Voilá

