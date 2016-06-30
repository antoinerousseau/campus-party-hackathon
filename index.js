#!/usr/bin/env node

'use strict'

const Telegraf = require('telegraf')

const telegraf = new Telegraf(process.env.BOT_TOKEN)

//TODO: AI

telegraf.startPolling()
