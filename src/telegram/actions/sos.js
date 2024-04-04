export const SOS = () => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "📞 | Support",
            url: process.env.SUPPORTER,
          },
        ],
      ],
    },
  };
};
