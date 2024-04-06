export const SOS = () => {
  return {
    resize_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "📞 | Support",
          url: process.env.SUPPORTER,
        },
      ],
    ],
  };
};
