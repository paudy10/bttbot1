// Use require instead of import because of the error "Cannot use import statement outside a module"
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ClaimCoin } from "./actions/claimCoin.js";
import { SOS } from "./actions/sos.js";
import User from "../model/user.js";
import connectDB from "../database/index.js";

/**
 * Creates and launches Telegram bot, and assigns all the required listeners
 *
 * @param token HTTP API token received from @BotFather(https://t.me/BotFather) after creating a bot
 *
 * @remarks
 * Make sure to save the token in a safe and secure place. Anyone with the access can control your bot.
 *
 */
export async function launchBot(token) {
  // Create a bot using the token received from @BotFather(https://t.me/BotFather)
  const bot = new Telegraf(token);
  // Assign bot listeners
  listenToCommands(bot);
  listenToMessages(bot);
  listenToQueries(bot);
  connectDB();
  // Launch the bot
  await bot.launch(() => console.log("bot launched"));

  // Handle stop events
  enableGracefulStop(bot);

  return bot;
}

/**
 * Assigns command listeners such as /start and /help
 *
 * @param bot Telegraf bot instance
 *
 */
function listenToCommands(bot) {
  // Register a listener for the /start command, and reply with a message whenever it's used
  bot.start(async (ctx, next) => {
    const userTel = ctx.message.from;
    let user = await User.findOne({ id: userTel.id });
    let parent;
    const getparent = () => {
      if (ctx.message.text.split("/start ")[1]) {
        return (parent = ctx.message.text.split("/start ")[1]);
      } else {
        return (parent = null);
      }
    };
    if (!user) {
      getparent();
      user = new User({
        id: userTel.id,
        name: userTel.first_name,
        username: userTel.username,
        balance: 0,
        referral: 0,
        parent: parent,
      });
      user.save();
      ctx.reply("add User in db");
    } else {
      ctx.reply("ghabln start zdi");
    }
    const mainButtons = {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [{ text: "Account" }],
          [{ text: "Referral" }, { text: "Claim Free BTT" }],
          [{ text: "Withdraw" }, { text: "SOS" }, { text: "Deposit" }],
        ],
      },
    };
    ctx.reply(`Welcome To BTT Bot !`, mainButtons);
    console.log(ctx.update.message);
    next();
  });

  // Register a listener for the /help command, and reply with a message whenever it's used
  bot.help(async (ctx, next) => {
    ctx.reply("Run the /start command to use our mini app");
    next();
  });
}

/**
 * Assigns message listeners such as text and stickers
 *
 * @param bot Telegraf bot instance
 *
 */
function listenToMessages(bot) {
  // Listen to messages and reply with something when ever you receive them
  bot.hears("Account", async (ctx, next) => {
    const userTel = ctx.message.from;
    let user = await User.findOne({ id: userTel.id });
    ctx.reply(`Name : ${user.name} \nUsername : ${user.username} \nBalance : ${user.balance} $ \nReferral : ${user.referral}
    `);
    next();
  });
  bot.hears("Referral", async (ctx, next) => {
    ctx.reply(
      `Your Referral Link : \nhttps://t.me/BTT_BBOT?start=${ctx.update.message.from.id}`
    );
    next();
  });
  bot.hears("Claim Free BTT", async (ctx, next) => {
    ctx.reply("Claim BTT Coin", ClaimCoin("BTT"));
    next();
  });
  bot.hears("SOS", async (ctx, next) => {
    ctx.reply("ye matne englisi va tahesh id", SOS());
    next();
  });

  // Listen to messages with the type 'sticker' and reply whenever you receive them
  // bot.on(message("text"), async (ctx) => {
  //   ctx.reply("I don't understand text but I like stickers, send me some!");
  //   ctx.reply("Or you can send me one of these commands \n/start\n/help");
  // });

  // Listen to messages with the type 'sticker' and reply whenever you receive them
  // bot.on(message("sticker"), async (ctx) => {
  //   ctx.reply("I like your sticker! 🔥");
  // });
}

/**
 * Assigns query listeners such inlines and callbacks
 *
 * @param bot Telegraf bot instance
 *
 */
function listenToQueries(bot) {
  bot.on("callback_query", async (ctx, next) => {
    // Explicit usage
    await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
    if (!ctx.update.callback_query) return next();
    const callback_data = ctx.update.callback_query.data;
    if (callback_data) {
      ctx.reply(callback_data);
      console.log(callback_data);
    }
    // Using context shortcut
    await ctx.answerCbQuery();
    next();
  });

  bot.on("inline_query", async (ctx, next) => {
    const result = [];
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

    // Using context shortcut
    await ctx.answerInlineQuery(result);
    next();
  });
}

/**
 * Listens to process stop events and performs a graceful bot stop
 *
 * @param bot Telegraf bot instance
 *
 */
function enableGracefulStop(bot) {
  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
