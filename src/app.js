const { Telegraf } = require('telegraf');
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu');
const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const googleApiKeysFileName = 'ma-ma-eat-demo-bot-8b2c5b4267c0.json';
const googleApiKeysFile = fs.readFileSync(path.join(__dirname, '..', 'config', googleApiKeysFileName));
const googleApiKeys = JSON.parse(googleApiKeysFile);
const client = new google.auth.JWT(googleApiKeys.client_email, googleApiKeysFile, googleApiKeys.private_key, ['https://www.googleapis.com/auth/drive']);
const spreadsheetId = '1d19_thdQLXBgABB7IbjnkVqe0e4FIUiUTxe8sno0fDE';
// replace the value below with the Telegram token you receive from @BotFather
const tgBotToken = '1259048585:AAGV-x9kiPSLQjsdOlfvMoBu7bjB2Itgglw';
// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(tgBotToken, { polling: true });
const bot = new Telegraf(tgBotToken);
const menuTemplate = new MenuTemplate('今日想食乜？😋');
const menuMiddleware = new MenuMiddleware('/', menuTemplate);
const store = {};

async function gsrun(cl) {
  const gsapi = google.sheets({
    version: 'v4',
    auth: cl
  });
  const opt = {
    spreadsheetId,
    range: 'Sheet1!A1:C4'
  };
  const sheetResponse = await gsapi.spreadsheets.values.get(opt);
  console.log(sheetResponse.data);
}
client.authorize((err, tokens) => {
  if (err) {
    console.log(err);
    return err;
  } else {
    console.log('Connected');
    gsrun(client);
  }
});
menuTemplate.interact('睇餐牌', 'read-food-menu', {
  do: async (ctx) => {
    ctx.reply('looking food menu');
    return false;
  }
});
menuTemplate.interact('落單', 'order', {
  do: async (ctx) => {
    ctx.reply('Welcome', {
      reply_markup: {
        keyboard: [['Sample text', 'Second sample'], ['Keyboard'], ['I\'m robot']],
        one_time_keyboard: true
      }
    });
    return false;
  }
});
// bot.command('start', ctx => menuMiddleware.replyToContext(ctx));
bot.command('start', (ctx) => {
  const userId = ctx.from.id + '';
  store[userId] = {};
  ctx.reply('今日想食乜？😋', {
    reply_markup: {
      keyboard: [
        ['睇餐牌'],
        ['落單']
      ],
      one_time_keyboard: true
    }
  });
});
bot.on('message', (ctx) => {
  const msg = ctx.message;
  const msgText = msg.text;
  console.log(msgText);
  switch (msgText) {
    case 'Sample text':
      ctx.reply('*電腦大爆炸*\n_香港九龍新界無得避_', {
        parse_mode: 'MarkdownV2'
      });
      break;
    default:
  }
});
bot.use(menuMiddleware);
bot.launch();
const port = process.env.PORT;
app.get('/', (req, res) => {
  res.send('cg-hello-tg-bot api');
});
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
