export const JoinChannel = () => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "BTT AirDrop",
            url: `t.me/free_bttairdrop`,
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
