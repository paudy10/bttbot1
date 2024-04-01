// Use require instead of import because of the error "Cannot use import statement outside a module"
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ClaimCoin } from "./actions/claimCoin.js";
import { SOS } from "./actions/sos.js";
import User from "../model/user.js";
import connectDB from "../database/index.js";
import { JoinChannel } from "./actions/joinChannel.js";
import LocalSession from "telegraf-session-local";
import Session from "../middleware/session.js";

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
  bot.use(new LocalSession({ database: "session.json" }).middleware());
  bot.use(Session);
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
    const chat = await ctx.telegram.getChatMember(
      process.env.CHANNEL_ID,
      ctx.message.from.id
    );
    const starter = async (ctx) => {
      const userTel = ctx.message.from;
      let user = await User.findOne({ id: userTel.id });
      let parent;
      let parentUsername;
      const getparent = async () => {
        if (ctx.message.text.split("/start ")[1]) {
          let prnt = await User.findOne({
            id: ctx.message.text.split("/start ")[1],
          });
          parentUsername = prnt.username ? prnt.username : prnt.name;
          let balance = prnt.balance + parseInt(process.env.REF_PRIZE);
          let prnt1 = await User.findOneAndUpdate(
            { id: ctx.message.text.split("/start ")[1] },
            { balance },
            { upsert: true }
          );
          if (prnt) {
            ctx.telegram.sendMessage(
              ctx.message.text.split("/start ")[1],
              `you have a new referral : ${userTel.first_name}`
            );
          }
          return (parent = ctx.message.text.split("/start ")[1]);
        } else {
          return (parent = null);
        }
      };
      if (!user) {
        await getparent();
        user = new User({
          id: userTel.id,
          name: userTel.first_name,
          username: userTel.username ? userTel.username : "Unknown",
          balance: 0,
          parent: parent,
        });
        await user.save();

        ctx.telegram.sendMessage(
          process.env.GP_ID,
          `Join New User ! \n${userTel.id} || ${userTel.first_name} || @${userTel?.username} \nInvited by : @${parentUsername}`
        );
      } else {
        // ctx.reply("ghabln start zdi");
      }
      const mainButtons = {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [{ text: "Account" }],
            [{ text: "Referral" }, { text: "Claim Free BTT" }],
            [{ text: "Withdraw" }, { text: "Support" }, { text: "Deposit" }],
          ],
        },
      };
      ctx.reply(`Welcome To BTT Bot !`, mainButtons);
    };
    if (
      chat.status == "member" ||
      chat.status == "creator" ||
      chat.status == "administrator"
    ) {
      starter(ctx);
    } else {
      // console.log(chat);
      ctx.reply(
        `${ctx.update.message.from.first_name} ! Join this channel and press CHECK button`,
        JoinChannel(ctx.message.text.split("/start ")[1])
      );
    }

    console.log(ctx.update.message);
    next();
  });

  // Register a listener for the /help command, and reply with a message whenever it's used
  // bot.help(async (ctx, next) => {
  //   ctx.reply("Run the /start command to use our mini app");
  //   next();
  // });
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
    let myref = await User.find({ parent: userTel.id });
    ctx.reply(`Name : ${user.name} \nUsername : ${user.username} \nBalance : ${user.balance} $ \nReferral : ${myref.length}
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
    ctx.reply("Claim BTT Coin", ClaimCoin("BABYDOGE"));
    next();
  });
  bot.hears("Support", async (ctx, next) => {
    ctx.reply("ye matne englisi va tahesh id", SOS());
    next();
  });
  bot.hears("Withdraw", async (ctx, next) => {
    const userTel = ctx.message.from;
    let user = await User.findOne({ id: userTel.id });
    if (user.balance < process.env.MIN_WITHDRAW) {
      ctx.reply(
        `Your Balance : ${user.balance} \nMinimum BabyDoge to Withdraw : ${process.env.MIN_WITHDRAW} \nYou Can't Withdraw !`
      );
    } else {
      ctx.session.state = "EnterWithdrawAmount";
      ctx.reply(
        `Your Balance : ${user.balance} \nMinimum BabyDoge to Withdraw : ${process.env.MIN_WITHDRAW} \nEnter the amount of BabyDoge you want to withdraw !`
      );
    }
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
      if (callback_data === "ClaimBABYDOGE") {
        let id = ctx.update.callback_query.from.id;
        let user = await User.findOne({
          id: id,
        });
        let balance = user.balance + parseInt(process.env.CLAIM_PRIZE);
        let UpdUser = await User.findOneAndUpdate(
          { id: id },
          { balance },
          { upsert: true }
        );
        let messageID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        ctx.telegram.deleteMessage(chatID, messageID);
        ctx.reply(`Collect ${process.env.CLAIM_PRIZE} BABY DOGE !`);
      }
      if (callback_data === "ConfirmWithdraw") {
        ctx.session.state = undefined;
        ctx.telegram.sendMessage(
          process.env.GP_ID,
          `New Withdraw ! 
          \n----------
          \nAmount to withdraw : ${ctx.session.amount} 
          \nWallet address : ${ctx.session.wallet}
          \n----------
          \nUser ID : ${
            ctx.update.callback_query.message.from.id
          } || UserName : @${
            ctx.update.callback_query.message.from?.username || "UNknown"
          }
          `
        );
        ctx.reply(`withdraw successfull !`);
        let id = ctx.update.callback_query.from.id;
        let user = await User.findOne({
          id: id,
        });
        let balance = user.balance - ctx.session.amount;
        let UpdUser = await User.findOneAndUpdate(
          { id: id },
          { balance },
          { upsert: true }
        );
      }

      // console.log(ctx.update.callback_query.message.chat);
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
