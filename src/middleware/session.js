import { stat } from "fs";
import { ConfirmWithdraw } from "../telegram/actions/confirmWithdraw.js";

export default function Session(ctx, next) {
  if (ctx.message.chat.id !== parseInt(process.env.GP_ID)) {
    if (!ctx.session.state) return next();
    const state = ctx.session.state;
    if (ctx.message.text === "Cancel") {
      const mainButtons = {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [{ text: "Account | 📋" }, { text: "Referral | 👥" }],
            [{ text: "Withdraw | 💵" }, { text: "Claim Free RVN | 💰" }],
            [{ text: "Support | ☎" }, { text: "Deposit | 💸" }],
          ],
        },
      };
      ctx.session.state = undefined;
      ctx.reply("Main Menu !", mainButtons);
    }
    if (state === "EnterWithdrawAmount" && ctx.message.text !== "Cancel") {
      ctx.session.amount = parseInt(ctx.message.text);

      if (ctx.session.amount < process.env.MIN_WITHDRAW) {
        ctx.reply(
          `<b>💵 Your amount</b> : ${ctx.session.amount} \n<b>⚠ Minimum amount to withdraw</b> : ${process.env.MIN_WITHDRAW}`,
          { parse_mode: "html" }
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
      ctx.session.state = "EnterHash";
      ctx.reply(
        `<b>💵 Your amount to Deposit</b> : ${ctx.session.Damount} \nSend to this wallet address : \n${process.env.WALLET} \n\nEnter Transaction HASH !`,
        { parse_mode: "html" }
      );
    }
    if (state === "EnterHash" && ctx.message.text !== "Cancel") {
      ctx.session.hash = ctx.message.text;
      ctx.session.dusername = ctx.message.from?.username;
      ctx.session.duserid = ctx.message.from.id;
      ctx.session.state = undefined;
      ctx.reply(
        `<b>Pending...</b> \n<b>💵 Your amount to Deposit</b> : ${ctx.session.Damount} \n<b>Your Transaction HASH</b> : \n${ctx.session.hash} \n\n⚠ Your payment will be checked by the admin and will be automatically added to your account after confirmation !`,
        { parse_mode: "html" }
      );
      ctx.telegram.sendMessage(
        process.env.GP_ID,
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
}
