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
  if (state === "EnterDepositAmount") {
    ctx.session.Damount = parseInt(ctx.message.text);
    ctx.session.state = "EnterHash";
    ctx.reply(
      `your amount to Deposit : ${ctx.session.Damount} \nSend to this wallet address : \n${process.env.WALLET} \n\nEnter Transaction HASH !`
    );
  }
  if (state === "EnterHash") {
    ctx.session.hash = ctx.message.text;
    ctx.session.dusername = ctx.message.from?.username;
    ctx.session.duserid = ctx.message.from.id;
    ctx.session.state = undefined;
    ctx.reply(
      `your amount to Deposit : ${ctx.session.Damount} \nYour Transaction HASH : \n${ctx.session.hash} \nadmin barresi mikone bade tayid be balance ezafe mishe !`
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
