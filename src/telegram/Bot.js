// Use require instead of import because of the error "Cannot use import statement outside a module"
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

/**
 * Creates and launches Telegram bot, and assigns all the required listeners
 *
 * @param token HTTP API token received from @BotFather(https://t.me/BotFather) after creating a bot
 *
 * @remarks
 * Make sure to save the token in a safe and secure place. Anyone with the access can control your bot.
 *
 */
export function launchBot(token) {
  // Create a bot using the token received from @BotFather(https://t.me/BotFather)
  const bot = new Telegraf(token);
  // Assign bot listeners
  listenToCommands(bot);
  listenToMessages(bot);
  listenToQueries(bot);

  // Launch the bot
  bot.launch().then(() => console.log("bot launched"));

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
  bot.start(async (ctx) => {
    const mainButtons = {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [{ text: "Account" }],
          [{ text: "Referral" }, { text: "Clam Free BTT" }],
          [{ text: "Withdraw" }, { text: "SOS" }, { text: "Deposit" }],
        ],
      },
    };
    ctx.reply(`Welcome To BTT Bot !`, mainButtons);
    console.log(ctx.update.message);
  });

  // Register a listener for the /help command, and reply with a message whenever it's used
  bot.help(async (ctx) => {
    ctx.reply("Run the /start command to use our mini app");
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
  bot.hears("Account", async (ctx) => {
    ctx.reply(`Name : ${ctx.update.message.from.first_name}
    Username : ${ctx.update.message.from.username}
    Balance : 0 $
    `);
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
  bot.on("callback_query", async (ctx) => {
    // Explicit usage
    await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

    // Using context shortcut
    await ctx.answerCbQuery();
  });

  bot.on("inline_query", async (ctx) => {
    const result = [];
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

    // Using context shortcut
    await ctx.answerInlineQuery(result);
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
