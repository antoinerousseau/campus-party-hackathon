#!/usr/bin/env node

'use strict'

const https = require('https')
const Telegraf = require('telegraf')
const TelegrafRecast = require('telegraf-recast')

const telegrafOptions = {
  telegram: {
    agent: new https.Agent({
      keepAlive: true, // ✨ Magic here!
      keepAliveMsecs: 5000,
    }),
  },
}

const telegraf = new Telegraf(process.env.BOT_TOKEN, telegrafOptions)
telegraf.use(Telegraf.memorySession())

const recast = new TelegrafRecast(process.env.RECAST_TOKEN)
telegraf.use(recast.middleware())

// respond to "I want the weather in Paris."
recast.onIntent('weather', function * () {
  const location = this.state.recast.firstEntity('location')
  this.reply('Sunny in ' + location.raw)
})

telegraf.startPolling()
