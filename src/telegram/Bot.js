// Use require instead of import because of the error "Cannot use import statement outside a module"
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ClaimCoin } from "./actions/claimCoin.js";
import { SOS } from "./actions/sos.js";
import User from "../model/user.js";
import Withdraw from "../model/withdraw.js";
import Profit from "../model/profit.js";
import connectDB from "../database/index.js";
import { JoinChannel } from "./actions/joinChannel.js";
import LocalSession from "telegraf-session-local";
import Session from "../middleware/session.js";
import keep_alive from "../http/keep_alive.js";
import { schedule } from "node-cron";
import scheduleProfit from "./actions/ScheduleProfit.js";

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
  keep_alive();

  scheduleProfit(bot);

  // Launch the bot
  await bot
    .launch(() => console.log("bot launched"))
    .catch((err) => {
      console.log(err);
    });

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
        resize_keyboard: true,
        keyboard: [
          [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
          [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
          [
            { text: "Bonus | 🎁" },
            { text: "Support | ☎" },
            { text: "More income | 💰" },
          ],
        ],
      };

      ctx.replyWithPhoto(
        "AgACAgQAAx0Cez-BrgACAcpmEOElhXoau9JL2xGxoZbG_VAOWgACNsIxGzp9iFDY5N5Ciaja7AEAAwIAA3gAAzQE",
        {
          reply_markup: mainButtons,
          caption: `Welcome To RVN Bot ! 🔥`,
        }
      );
    };
    if (
      chat.status == "member" ||
      chat.status == "creator" ||
      chat.status == "administrator"
    ) {
      starter(ctx);
    } else {
      // console.log(chat);
      ctx.replyWithPhoto(
        "AgACAgQAAx0Cez-BrgACAb5mEOEFhAV_EtjcMyyafhQQfxvGMgACMMIxGzp9iFDTM6t8WJk8vgEAAwIAA3gAAzQE",
        {
          reply_markup: JoinChannel(ctx.message.text.split("/start ")[1]),
          caption: `${ctx.update.message.from.first_name} ! Join This Channel And Press CHECK Button ✨`,
        }
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
  bot.hears("Cancel", async (ctx, next) => {
    const mainButtons = {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
          [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
          [
            { text: "Bonus | 🎁" },
            { text: "Support | ☎" },
            { text: "More income | 💰" },
          ],
        ],
      },
    };
    ctx.session.state = undefined;
    ctx.reply("Main Menu !", mainButtons);
  });
  bot.hears("Account | 📋", async (ctx, next) => {
    ctx.session.state = undefined;
    const userTel = ctx.message.from;
    let user = await User.findOne({ id: userTel.id });
    let myref = await User.find({ parent: userTel.id });
    ctx.replyWithPhoto(
      "AgACAgQAAx0Cez-BrgACAchmEOEjx4W-Y2HMbnyisQgBtNtN9AACNcIxGzp9iFAPkVnhL0tSJwEAAwIAA3gAAzQE",
      {
        caption: `Name : <b>${user.name}</b> \nUsername : <b>${user.username}</b> \nBalance : <b>${user.balance}</b> $ \nReferral : <b>${myref.length}</b>`,
        parse_mode: "html",
      }
    );

    next();
  });
  bot.hears("Referral | 👥", async (ctx, next) => {
    ctx.session.state = undefined;
    ctx.replyWithPhoto(
      "AgACAgQAAx0Cez-BrgACAcBmEOETr8GeD_Mad3wyYPfdmDlO-AACMcIxGzp9iFBwtaUg-x8pOgEAAwIAA3gAAzQE",
      {
        caption: `<b>👥 | Your Referral Link</b> : \nhttps://t.me/EarnRvnBot?start=${ctx.update.message.from.id}`,
        parse_mode: "html",
      }
    );

    next();
  });
  bot.hears("Bonus | 🎁", async (ctx, next) => {
    ctx.session.state = undefined;
    function getDateTime() {
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth() + 1;
      var day = now.getDate();
      var hour = now.getHours();
      var minute = now.getMinutes();
      var second = now.getSeconds();
      if (month.toString().length == 1) {
        month = "0" + month;
      }
      if (day.toString().length == 1) {
        day = "0" + day;
      }
      if (hour.toString().length == 1) {
        hour = "0" + hour;
      }
      if (minute.toString().length == 1) {
        minute = "0" + minute;
      }
      if (second.toString().length == 1) {
        second = "0" + second;
      }
      var dateTime =
        year +
        "/" +
        month +
        "/" +
        day +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second;
      return dateTime;
    }
    if (ctx.session.claimDate) {
      const date = ctx.session.claimDate.split(" ")[0];
      const hour = ctx.session.claimDate.split(" ")[1];
      const t = getDateTime();
      const tdate = t.split(" ")[0];
      const thour = t.split(" ")[1];
      if (date !== tdate) {
        ctx.session.claimDate = getDateTime();
        ctx.replyWithPhoto(
          "AgACAgQAAx0Cez-BrgACAcZmEOEfx9_9agH9_12-HaEXhGlzgwACNMIxGzp9iFDq76KE88GtkAEAAwIAA3gAAzQE",
          {
            reply_markup: ClaimCoin("RVN"),
            caption: `Claim <b>RVN</b> Coin\n\n${ctx.session.claimDate}`,
            parse_mode: "html",
          }
        );
      }
      if (date === tdate) {
        if (hour.split(":")[0] === thour.split(":")[0]) {
          ctx.reply(
            `⚠ Please try again after ${
              59 -
              (thour.split(":")[1].split(":")[0] -
                hour.split(":")[1].split(":")[0])
            }' Minute`
          );
        } else {
          ctx.session.claimDate = getDateTime();
          ctx.replyWithPhoto(
            "AgACAgQAAx0Cez-BrgACAcZmEOEfx9_9agH9_12-HaEXhGlzgwACNMIxGzp9iFDq76KE88GtkAEAAwIAA3gAAzQE",
            {
              reply_markup: ClaimCoin("RVN"),
              caption: `Claim <b>RVN</b> Coin\n\n${ctx.session.claimDate}`,
              parse_mode: "html",
            }
          );
        }
      }
    } else {
      ctx.session.claimDate = getDateTime();
      ctx.replyWithPhoto(
        "AgACAgQAAx0Cez-BrgACAcZmEOEfx9_9agH9_12-HaEXhGlzgwACNMIxGzp9iFDq76KE88GtkAEAAwIAA3gAAzQE",
        {
          reply_markup: ClaimCoin("RVN"),
          caption: `Claim <b>RVN</b> Coin\n\n${ctx.session.claimDate}`,
          parse_mode: "html",
        }
      );
    }

    next();
  });
  bot.hears("Support | ☎", async (ctx, next) => {
    ctx.session.state = undefined;

    ctx.replyWithPhoto(
      "AgACAgQAAx0Cez-BrgACAcJmEOEYKsOrgECywBDdSjnUgyJ3bwACMsIxGzp9iFBsiRfr32Y42AEAAwIAA3gAAzQE",
      {
        reply_markup: SOS(),
        caption: `Hi ${ctx.message.from.first_name} 👋 \nIf you are facing any issues related to this bots . \nWe are here to help you ❤️.`,
        parse_mode: "html",
      }
    );
    next();
  });

  bot.hears("More income | 💰", async (ctx, next) => {
    ctx.session.state = undefined;

    ctx.replyWithPhoto(
      "AgACAgQAAx0Cez-BrgACAb5mEOEFhAV_EtjcMyyafhQQfxvGMgACMMIxGzp9iFDTM6t8WJk8vgEAAwIAA3gAAzQE",
      {
        reply_markup: SOS(),
        caption: `<b>Earn more from the robot ✨</b> \n\n⚜ This section is useful for people who have one or more pages full of audience in social software . \n\n🔰 You can earn money through : \n  stories on <b>Instagram</b> \n  making videos on <b>YouTube</b> \n  advertising on <b>Telegram channels</b> \n  tweeting on <b>Twitter</b> and <b>Facebook</b> etc. \ndepending on the number of views. \n\nTake a screenshot at the moment of the advertisement and 24 hours after it and send it to us ❤\n`,
        parse_mode: "html",
      }
    );
    next();
  });
  bot.hears("Withdraw | 💵", async (ctx, next) => {
    const userTel = ctx.message.from;
    const mainButtons = {
      resize_keyboard: true,
      keyboard: [[{ text: "Cancel" }]],
    };
    const mainButton = {
      resize_keyboard: true,
      keyboard: [
        [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
        [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
        [
          { text: "Bonus | 🎁" },
          { text: "Support | ☎" },
          { text: "More income | 💰" },
        ],
      ],
    };
    let user = await User.findOne({ id: userTel.id });
    // ctx.reply("Withdraw", mainButtons);
    if (user.balance < process.env.MIN_WITHDRAW) {
      ctx.replyWithPhoto(
        "AgACAgQAAx0Cez-BrgACAdJmEOEyYCVwwEtjpjVsxPFCJuEwIAACOsIxGzp9iFATyttAilRylQEAAwIAA3gAAzQE",
        {
          caption: `<b>🔰 Your Balance</b> : ${user.balance} \n<b>❕ Minimum RVN to Withdraw</b> : ${process.env.MIN_WITHDRAW} \n<b>❌ You Can't Withdraw !</b>`,
          parse_mode: "html",
          reply_markup: mainButton,
        }
      );
    } else {
      ctx.session.state = "EnterWithdrawAmount";
      ctx.replyWithPhoto(
        "AgACAgQAAx0Cez-BrgACAc5mEOEtZaK_leK54gsaqDZpuRxbXwACOMIxGzp9iFCCrItbJ2ID2QEAAwIAA3gAAzQE",
        {
          caption: `<b>🔰 Your Balance</b> : ${user.balance} \n<b>❕ Minimum RVN to Withdraw</b> : ${process.env.MIN_WITHDRAW} \n<b>✅ Enter the amount of RVN you want to withdraw !</b>`,
          parse_mode: "html",
          reply_markup: {
            resize_keyboard: true,
            keyboard: [[{ text: "Cancel" }]],
          },
        }
      );
    }
    next();
  });
  bot.hears("Deposit | 💸", async (ctx, next) => {
    ctx.session.state = "EnterDepositAmount";
    const mainButtons = {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [[{ text: "Cancel" }]],
      },
    };
    ctx.replyWithPhoto(
      "AgACAgQAAx0Cez-BrgACAcxmEOEoZ0QvlW4kqwS-Ccf8zYlufwACN8IxGzp9iFC8MYIrCAZpcAEAAwIAA3gAAzQE",
      {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [[{ text: "Cancel" }]],
        },
        caption: `⚜ Here you can get daily profit by investing! \n\n🔰 Daily profit starting from 4% \n1️⃣ : 48 to 588 RVN daily profit 4% \n2️⃣ : 589 to 2888 RVN daily profit 8% \n3️⃣ : 2888 and above, daily profit of 12% \n\n📛 Minimum deposit 48 RVN \n⚠ Minimum withdrawal of 48 RVN \n⚠ Number of withdrawals once a day \n\nEnter the amount of RVN you want to Deposit !`,
        parse_mode: "html",
      }
    );

    next();
  });

  // Listen to messages with the type 'sticker' and reply whenever you receive them
  bot.on(message("text"), async (ctx, next) => {
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
        ctx.telegram
          .sendMessage(id, `${text}`, { parse_mode: "html" })
          .then(function (resp) {
            // ...snip...
          })
          .catch(function (error) {
            if (error.response && error.response.statusCode === 403) {
              next();
            }
          });
      }
      // if (ctx.message.text.match("/senddm2")) {
      //   const id = ctx.message.text.split("/senddm2 ")[1].split(" text:")[0];
      //   const text = ctx.message.text.split("text:")[1].split(" pic:")[0];
      //   const pic = ctx.message.text.split("pic:")[1];
      //   ctx.telegram
      //     .sendPhoto(id, (photo = `${pic}`), (caption = text))
      //     .then(function (resp) {
      //       // ...snip...
      //     })
      //     .catch(function (error) {
      //       if (error.response && error.response.statusCode === 403) {
      //         next();
      //       }
      //     });
      // }
      if (ctx.message.text.match("/sendtoall")) {
        const alluser = await User.find();
        const text = ctx.message.text.split("text:")[1];
        alluser.map((user) =>
          ctx.telegram
            .sendMessage(user.id, `${text}`, { parse_mode: "html" })
            .then(function (resp) {
              // ...snip...
            })
            .catch(function (error) {
              if (error.response && error.response.statusCode === 403) {
                next();
              }
            })
        );
      }
      // if (ctx.message.text.match("/sendtoall2")) {
      //   const alluser = await User.find();
      //   const text = ctx.message.text.split("text: ")[1].split(" pic:")[0];
      //   const pic = ctx.message.text.split("pic:")[1];

      //   alluser.map((user) =>
      //     ctx.telegram
      //       .sendPhoto(user.id, `${pic}`, { caption: text, parse_mode: "html" })
      //       .then(function (resp) {
      //         // ...snip...
      //       })
      //       .catch(function (error) {
      //         if (error.response && error.response.statusCode === 403) {
      //           next();
      //         }
      //       })
      //   );
      // }
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
      if (ctx.message.text.match("/profit")) {
        const id = ctx.message.text.split("/profit ")[1].split(" amount:")[0];
        const amount = ctx.message.text.split("amount:")[1].split(" daily:")[0];
        const daily = ctx.message.text.split("daily:")[1];
        const user = await User.findOne({ id });
        let profit = new Profit({
          userid: id,
          username: user?.username ? user.username : "Unknown",
          amount,
          daily,
        });

        await profit.save();
        ctx.reply(
          `${user.id} || ${user.name} || @${user.username} \nAmount : <b>${amount} $</b> \nDaily Profit : <b>${daily}</b>`,
          { parse_mode: "html" }
        );
        ctx.telegram.sendMessage(
          id,
          `<b>Hi ${user.name} 👋</b> \n\n💵 Your Deposit Amount : <b>${amount} $</b> \n📈 Profit Daily : <b>${daily}%</b>`,
          { parse_mode: "html" }
        );
      }
    }
    next();
  });

  // Listen to messages with the type 'sticker' and reply whenever you receive them
  // bot.on(message("sticker"), async (ctx) => {
  //   ctx.reply("I like your sticker! 🔥");
  // });
  bot.on(message("photo"), async (ctx) => {
    if (parseInt(ctx.message.chat.id) === parseInt(process.env.GP_ID)) {
      await ctx.telegram
        .sendChatAction(ctx.message.chat.id, "upload_photo")
        .then()
        .catch((err) => {
          console.log(err);
        });
      ctx.replyWithPhoto(ctx.message.photo[2].file_id, {
        caption: `url : \n ${ctx.message.photo[2].file_id}`,
      });
      console.log(ctx.message);
    }
  });
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
      if (callback_data === "ClaimRVN") {
        let id = ctx.update.callback_query.from.id;
        let user = await User.findOne({
          id: id,
        });
        let balance = user.balance + parseFloat(process.env.CLAIM_PRIZE);
        let UpdUser = await User.findOneAndUpdate(
          { id: id },
          { balance },
          { upsert: true }
        );
        let messageID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        ctx.telegram.deleteMessage(chatID, messageID);
        ctx.replyWithPhoto(
          "AgACAgQAAx0Cez-BrgACAdBmEOEvwp5jNWEBNrMm4loMGrmqEQACOcIxGzp9iFBicefl2PJQgQEAAwIAA3gAAzQE",
          {
            caption: `✅ Collect <b>${balance - user.balance}</b> RVN !`,
            parse_mode: "html",
          }
        );
      }
      if (callback_data === "SendRVN") {
        let messageID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        ctx.telegram.deleteMessage(chatID, messageID);
        ctx.session.send = "Raven";
        ctx.session.state = "EnterHash";
        ctx.reply(
          `<b>💵 Your amount to Deposit</b> : ${ctx.session.Damount} \nSend to this wallet address : \n${process.env.RVNWALLET}  \n\nEnter Transaction HASH  !`,
          { parse_mode: "html" }
        );
      }
      if (callback_data === "SendTether") {
        let messageID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        ctx.telegram.deleteMessage(chatID, messageID);
        ctx.session.state = "EnterHash";
        ctx.session.send = "Tether";
        ctx.reply(
          `<b>💵 Your amount to Deposit</b> : ${ctx.session.Damount} \nSend to this Tether Wallet Address : \n${process.env.TETHERWALLET}  \n\nEnter Transaction HASH  !`,
          { parse_mode: "html" }
        );
      }
      if (callback_data === "ConfirmWithdraw") {
        ctx.session.state = undefined;
        let messageID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        ctx.telegram.deleteMessage(chatID, messageID);
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
        const mainButtons = {
          resize_keyboard: true,
          keyboard: [
            [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
            [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
            [
              { text: "Bonus | 🎁" },
              { text: "Support | ☎" },
              { text: "More income | 💰" },
            ],
          ],
        };
        ctx.replyWithPhoto(
          "AgACAgQAAx0Cez-BrgACAdBmEOEvwp5jNWEBNrMm4loMGrmqEQACOcIxGzp9iFBicefl2PJQgQEAAwIAA3gAAzQE",
          {
            caption: `✅ withdraw successfull ! \nYour withdrawal will be checked by the supporter and will be deposited automatically after confirmation`,
            parse_mode: "html",
            reply_markup: mainButtons,
          }
        );

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
