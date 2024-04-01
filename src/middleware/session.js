import { stat } from "fs";
import { ConfirmWithdraw } from "../telegram/actions/confirmWithdraw.js";

export default function Session(ctx, next) {
  if (!ctx.session.state) return next();
  const state = ctx.session.state;

  if (state === "EnterWithdrawAmount") {
    ctx.session.amount = parseInt(ctx.message.text);
    if (ctx.session.amount < process.env.MIN_WITHDRAW) {
      ctx.reply(
        `your amount : ${ctx.session.amount} \nminimum amount to withdraw : ${process.env.MIN_WITHDRAW}`
      );
      ctx.session.state = undefined;
    } else {
      ctx.session.state = "EnterWallet";
      ctx.reply(
        `your amount to withdraw : ${ctx.session.amount} \nSend Your Wallet Address !`
      );
    }
  }
  if (state === "EnterWallet") {
    ctx.session.state = undefined;
    ctx.session.wallet = ctx.message.text;
    ctx.session.username = ctx.message.from?.username;
    ctx.session.userid = ctx.message.from.id;
    ctx.reply(
      `your amount to withdraw : ${ctx.session.amount} \nyour wallet address : ${ctx.session.wallet} \nPress Confirm To withraw !`,
      ConfirmWithdraw()
    );
  }
}
