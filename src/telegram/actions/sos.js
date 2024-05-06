import { SUPPORTER } from "../../../db";

export const SOS = () => {
  return {
    resize_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "📞 | Support",
          url: SUPPORTER,
        },
      ],
    ],
  };
};
