# Campus Party Hackathon

An instant messaging bot build on AI made to help people building their house in Mexico

## Setup

    npm install

## Start

    BOT_TOKEN=xxxxxx ./index.js

## Daemonize

    npm install -g pm2
    BOT_TOKEN=xxxxxx NODE_ENV=production pm2 start index.js --name "bot" -- --color
