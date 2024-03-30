export const JoinChannel = () => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "BABY DOGE AirDrop",
            url: process.env.CHANNEL_LINK,
          },
        ],
        [
          {
            text: "CHECK",
            url: process.env.STARTBOT,
          },
        ],
      ],
    },
  };
};
