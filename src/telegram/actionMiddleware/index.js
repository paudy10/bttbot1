export default ActionMiddleware = (ctx, next) => {
  if (!ctx.update.callback_query) return next();
  const callback_data = ctx.update.callback_query.data;
  if (callback_data) {
    ctx.reply(callback_data);
  }
};
