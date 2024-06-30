#!/bin/bash

PROJECT_NAME=Guessify
PM2_NAME=guessify.me
discord_url=https://discordapp.com/api/webhooks/676356429208092672/TM49ti4Q7nl6kJKVS9hwIIp1rC7Fk1046yUeizGRX4NaO3CS0QeCn_CDK7rT-qg2Iaqd
curl -X POST -H "Content-Type: multipart/form-data" -F "content=$PROJECT_NAME - Deploy starting, app will be restarted" "$discord_url"
curl -X POST -H "Content-Type: multipart/form-data" -F "content=$PROJECT_NAME - Step 1/4 - git pull" "$discord_url"
git pull
curl -X POST -H "Content-Type: multipart/form-data" -F "content=$PROJECT_NAME - Step 2/4 - Refreshing NPM modules" "$discord_url"
npm install
curl -X POST -H "Content-Type: multipart/form-data" -F "content=$PROJECT_NAME - Step 3/4 - Rebuilding React" "$discord_url"
npm run build
curl -X POST -H "Content-Type: multipart/form-data" -F "content=$PROJECT_NAME - Step 4/4 - Reloading instance" "$discord_url"
pm2 reload $PM2_NAME --update-env
curl -X POST -H "Content-Type: multipart/form-data" -F "content=$PROJECT_NAME - Deploy finished @everyone Guessify.me restarted" "$discord_url"
