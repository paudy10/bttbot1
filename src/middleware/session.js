import { stat } from "fs";
import { ConfirmWithdraw } from "../telegram/actions/confirmWithdraw.js";
import { GP_ID, MIN_WITHDRAW } from "../../db.js";

export default function Session(ctx, next) {
  if (!ctx.session?.state) return next();
  const state = ctx.session?.state;
  if (ctx?.message?.text === "Cancel") {
    const mainButtons = {
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
          [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
          [
            { text: "Bonus | 🎁" },
            { text: "Support | ☎" },
            { text: "More | 💰" },
          ],
        ],
      },
    };
    ctx.session.state = undefined;
    ctx.reply("Main Menu !", mainButtons);
  }
  if (state === "EnterWithdrawAmount" && ctx.message.text !== "Cancel") {
    ctx.session.amount = parseInt(ctx.message.text);

    if (ctx.session.amount < MIN_WITHDRAW) {
      const mainButtons = {
        resize_keyboard: true,
        keyboard: [
          [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
          [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
          [
            { text: "Bonus | 🎁" },
            { text: "Support | ☎" },
            { text: "More | 💰" },
          ],
        ],
      };
      ctx.reply(
        `<b>💵 Your amount</b> : ${ctx.session.amount} \n<b>⚠ Minimum amount to withdraw</b> : ${MIN_WITHDRAW}`,
        { parse_mode: "html", reply_markup: mainButtons }
      );
      ctx.session.state = undefined;
    } else {
      ctx.session.state = "EnterWallet";
      ctx.reply(
        `<b>💵 Your amount to withdraw</b> : ${ctx.session.amount} \nSend Your Wallet Address !`,
        { parse_mode: "html" }
      );
    }
  }
  if (state === "EnterDepositAmount" && ctx.message.text !== "Cancel") {
    ctx.session.Damount = parseInt(ctx.message.text);
    ctx.session.state = undefined;
    ctx.reply(
      `<b>💵 Your amount to Deposit</b> : ${ctx.session.Damount} $  \n\nSelect the Your currency for transfer  !`,
      {
        parse_mode: "html",
        reply_markup: {
          resize_keyboard: true,
          inline_keyboard: [
            [
              {
                text: "1️⃣ | Raven Address",
                callback_data: `SendRVN`,
              },
            ],
            [
              {
                text: "2️⃣ | Tether Address",
                callback_data: `SendTether`,
              },
            ],
          ],
        },
      }
    );
  }
  if (state === "EnterHash" && ctx.message.text !== "Cancel") {
    ctx.session.hash = ctx.message.text;
    ctx.session.dusername = ctx.message.from?.username;
    ctx.session.duserid = ctx.message.from.id;
    ctx.session.state = undefined;
    const mainButtons = {
      resize_keyboard: true,
      keyboard: [
        [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
        [{ text: "Withdraw | 💵" }, { text: "Deposit | 💸" }],
        [
          { text: "Bonus | 🎁" },
          { text: "Support | ☎" },
          { text: "More | 💰" },
        ],
      ],
    };
    ctx.replyWithPhoto(
      "AgACAgQAAx0Cez-BrgACAcRmEOEdvkDOM9WJ-gtzmLynNIsarwACM8IxGzp9iFBeDK4AAauXcFsBAAMCAAN4AAM0BA",
      {
        caption: `<b>Pending...</b> \n<b>💵 Your amount to Deposit</b> : ${ctx.session.Damount} ${ctx.session.send} \n<b>Your Transaction HASH</b> : \n${ctx.session.hash} \n\n⚠ Your payment will be checked by the admin and will be automatically added to your account after confirmation !`,
        parse_mode: "html",
        reply_markup: mainButtons,
      }
    );
    ctx.telegram.sendMessage(
      GP_ID,
      `New Deposit ! \n----------\nAmount to Deposit : ${
        ctx.session.Damount
      } \nHash address : ${ctx.session.hash}\n----------\nUser ID : ${
        ctx.session.duserid
      } || UserName : @${ctx.session?.dusername || "UNknown"}
        `
    );
  }
  if (state === "EnterWallet" && ctx.message.text !== "Cancel") {
    ctx.session.state = undefined;
    ctx.session.wallet = ctx.message.text;
    ctx.session.username = ctx.message.from?.username;
    ctx.session.userid = ctx.message.from.id;
    ctx.reply(
      `💵 Your amount to withdraw : ${ctx.session.amount} \n💳 Your wallet address : ${ctx.session.wallet} \n\n✅ Press Confirm To withraw !`,
      ConfirmWithdraw()
    );
  }
}
