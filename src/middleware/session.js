import { stat } from "fs";
import { ConfirmWithdraw } from "../telegram/actions/confirmWithdraw.js";

export default function Session(ctx, next) {
  if (!ctx.session.state) return next();
  const state = ctx.session.state;

  if (state === "EnterWithdrawAmount") {
    if (!ctx.message.text) {
      ctx.session.state = undefined;
    } else {
      ctx.session.state = "EnterWallet";
      ctx.session.amount = ctx.message.text;
      ctx.reply(
        `your amount to withdraw : ${ctx.message.text} \nSend Your Wallet Address !`
      );
    }
  }
  if (state === "EnterWallet") {
    if (!ctx.message.text) {
      ctx.session.state = undefined;
    } else {
      ctx.session.wallet = ctx.message.text;
      ctx.reply(
        `your amount to withdraw : ${ctx.message.amount} \nyour wallet address : ${ctx.message.wallet} \nPress Confirm To withraw !`,
        ConfirmWithdraw()
      );
    }
  }
  if (state === "ConfirmWithdraw") {
    ctx.session.state = undefined;
    ctx.telegram.sendMessage(
      process.env.GP_ID,
      `New Withdraw ! \n Amount to withdraw : ${ctx.message.amount} \nWallet address : ${ctx.message.wallet}`
    );
    ctx.reply(`withdraw successfull !`);
  }
}
