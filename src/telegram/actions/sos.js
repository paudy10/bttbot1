export const SOS = () => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            te: "Support",
            url: `t.me/im_jude`,
          },
        ],
      ],
    },
  };
};
