export const JoinChannel = (id) => {
  return {
    resize_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "RVN Channel",
          url: process.env.CHANNEL_LINK,
        },
      ],
      [
        {
          text: "✅ | CHECK",
          url: `${process.env.STARTBOT}${id ? `=${id}` : ""}`,
        },
      ],
    ],
  };
};
