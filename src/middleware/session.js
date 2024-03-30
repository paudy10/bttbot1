export default SessionMiddleware = (ctx, next) => {
  if (!ctx.session.state) return next();
  const state = ctx.session.state;

  if (state === "EnterWithdrawAmount") {
    ctx.session.state = undefined;
    ctx.reply(`your amount to withdraw : ${ctx.message.text}`);
  }
};
