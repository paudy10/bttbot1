export const ConfirmWithdraw = () => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "Confirm",
            callback_data: `ConfirmWithdraw`,
          },
        ],
      ],
    },
  };
};
