import { stat } from "fs";
import { ConfirmWithdraw } from "../telegram/actions/confirmWithdraw.js";

export default function Session(ctx, next) {
  if (!ctx.session.state) return next();
  const state = ctx.session.state;

  if (state === "EnterWithdrawAmount") {
    ctx.session.state = "EnterWallet";
    ctx.session.amount = ctx.message.text;
    ctx.reply(
      `your amount to withdraw : ${ctx.session.amount} \nSend Your Wallet Address !`
    );
  }
  if (state === "EnterWallet") {
    ctx.session.state = undefined;
    ctx.session.wallet = ctx.message.text;
    ctx.reply(
      `your amount to withdraw : ${ctx.session.amount} \nyour wallet address : ${ctx.session.wallet} \nPress Confirm To withraw !`,
      ConfirmWithdraw()
    );
  }
  //   if (state === "ConfirmWithdraw") {
  //     ctx.session.state = undefined;
  //     ctx.telegram.sendMessage(
  //       process.env.GP_ID,
  //       `New Withdraw ! \n Amount to withdraw : ${ctx.session.amount} \nWallet address : ${ctx.session.wallet}`
  //     );
  //     ctx.reply(`withdraw successfull !`);
  //   }
}
