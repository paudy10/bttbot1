// Use require instead of import because of the error "Cannot use import statement outside a module"
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ClaimCoin } from "./actions/claimCoin.js";
import { SOS } from "./actions/sos.js";
import User from "../model/user.js";
import Withdraw from "../model/withdraw.js";
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
              `You Have a New Referral : ${userTel.first_name}`
            );
          }
          return (parent = ctx.message.text.split("/start ")[1]);
        } else {
          return (parent = null);
        }
      };
      if (!user) {
        await getparent();
        let user1 = new User({
          id: userTel.id,
          name: userTel.first_name,
          username: userTel.username ? userTel.username : "Unknown",
          balance: 0,
          parent: parent,
        });
        await user1.save();

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
            [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
            [{ text: "Withdraw | 💵" }, { text: "Claim Free BTT | 💰" }],
            [{ text: "Support | ☎" }, { text: "Deposit | 💸" }],
          ],
        },
      };
      ctx.reply(`Welcome To BTT Bot ! 🔥`, mainButtons);
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
        `${ctx.update.message.from.first_name} ! Join This Channel And Press CHECK Button ✨`,
        JoinChannel(ctx.message.text.split("/start ")[1])
      );
    }

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
  bot.hears("Account | 📋", async (ctx, next) => {
    ctx.session.state = undefined;
    const userTel = ctx.message.from;
    let user = await User.findOne({ id: userTel.id });
    let myref = await User.find({ parent: userTel.id });
    ctx.reply(
      `Name : <b>${user.name}</b> \nUsername : <b>${user.username}</b> \nBalance : <b>${user.balance}</b> $ \nReferral : <b>${myref.length}</b>
    `,
      { parse_mode: "html" }
    );
    next();
  });
  bot.hears("Referral | 👥", async (ctx, next) => {
    ctx.session.state = undefined;
    ctx.reply(
      `<b>👥 | Your Referral Link</b> : \nhttps://t.me/BTT_BBOT?start=${ctx.update.message.from.id}`,
      { parse_mode: "html" }
    );
    next();
  });
  bot.hears("Claim Free BTT | 💰", async (ctx, next) => {
    ctx.session.state = undefined;
    ctx.reply("Claim BTT Coin", ClaimCoin("BABYDOGE"));
    next();
  });
  bot.hears("Support | ☎", async (ctx, next) => {
    ctx.session.state = undefined;
    ctx.reply(
      `Hi ${ctx.message.from.first_name} 👋 \nIf you are facing any issues related to this bots . \nWe are here to help you ❤️.`,
      SOS()
    );
    next();
  });
  bot.hears("Withdraw | 💵", async (ctx, next) => {
    const userTel = ctx.message.from;
    let user = await User.findOne({ id: userTel.id });
    if (user.balance < process.env.MIN_WITHDRAW) {
      ctx.reply(
        `<b>🔰 Your Balance</b> : ${user.balance} \n<b>❕ Minimum BabyDoge to Withdraw</b> : ${process.env.MIN_WITHDRAW} \n<b>❌ You Can't Withdraw !</b>`,
        { parse_mode: "html" }
      );
    } else {
      ctx.session.state = "EnterWithdrawAmount";
      ctx.reply(
        `Your Balance : ${user.balance} \nMinimum BabyDoge to Withdraw : ${process.env.MIN_WITHDRAW} \nEnter the amount of BabyDoge you want to withdraw !`
      );
    }
    next();
  });
  bot.hears("Deposit | 💸", async (ctx, next) => {
    ctx.session.state = "EnterDepositAmount";
    ctx.reply(
      `matne englisi tozihate deposit \nEnter the amount of BabyDoge you want to Deposit !`
    );
    next();
  });

  // Listen to messages with the type 'sticker' and reply whenever you receive them
  bot.on(message("text"), async (ctx) => {
    if (parseInt(ctx.message.chat.id) === parseInt(process.env.GP_ID)) {
      if (ctx.message.text.match("/alluser")) {
        const alluser = await User.find();
        ctx.reply(
          `User List \n${alluser
            .map(
              (user, index) =>
                `${index + 1}- ${user.id}  |  @${user.username} | ${
                  user.balance
                } $  \n`
            )
            .join("")}`
        );
      }
      if (ctx.message.text.match("/user")) {
        const id = ctx.message.text.split("/user ")[1];
        const user = await User.findOne({ id });
        const t = await Withdraw.find({ userid: id });
        ctx.reply(
          `id : ${user.id} \nname : ${user.name} \nusername : @${user.username} \nbalance : ${user.balance}`
        );
        if (t.length > 0) {
          ctx.reply(
            `withdraw request \n${t
              .map(
                (user, index) =>
                  `${index + 1}- ${user.userid}  |  @${user.username} \n${
                    user.amount
                  } $ | ${user.wallet}  \n`
              )
              .join("")}`
          );
        }
      }
      if (ctx.message.text.match("/senddm")) {
        const id = ctx.message.text.split("/senddm ")[1].split(" text:")[0];
        const text = ctx.message.text.split("text:")[1];
        ctx.telegram.sendMessage(id, `${text}`, { parse_mode: "html" });
      }
      if (ctx.message.text.match("/sendtoall")) {
        const alluser = await User.find();
        const text = ctx.message.text.split("text:")[1];
        alluser.map((user) =>
          ctx.telegram.sendMessage(user.id, `${text}`, { parse_mode: "html" })
        );
      }
      if (ctx.message.text.match("/balance")) {
        const id = ctx.message.text.split("/balance ")[1].split(" new:")[0];
        const balance = ctx.message.text.split("new:")[1];
        let UpdUser = await User.findOneAndUpdate(
          { id },
          { balance },
          { upsert: true }
        );
        ctx.reply(`${UpdUser.name} => balance : ${balance} $`);
      }
    }
  });

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
          `New Withdraw ! \n----------\nAmount to withdraw : ${
            ctx.session.amount
          } \nWallet address : ${ctx.session.wallet}\n----------\nUser ID : ${
            ctx.session.userid
          } || UserName : @${ctx.session?.username || "UNknown"}
          `
        );
        let withdraw = new Withdraw({
          userid: ctx.session?.userid,
          username: ctx.session?.username || "UNknown",
          amount: ctx.session?.amount,
          wallet: ctx.session?.wallet,
          date: new Date(),
        });
        await withdraw.save();
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
