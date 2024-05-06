import { CHANNEL_LINK, STARTBOT } from "../../../db";

export const JoinChannel = (id) => {
  return {
    resize_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "RVN Channel",
          url: CHANNEL_LINK,
        },
      ],
      [
        {
          text: "✅ | CHECK",
          url: `${STARTBOT}${id ? `=${id}` : ""}`,
        },
      ],
    ],
  };
};
