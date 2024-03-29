export const JoinChannel = () => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "BTT AirDrop",
            url: `https://t.me/+Ur2fhOdkrMYyMDQ8`,
          },
          {
            text: "CHECK",
            url: `t.me/btt_bbot?start`,
          },
        ],
      ],
    },
  };
};
