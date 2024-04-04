export const ClaimCoin = (COIN) => {
  return {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: [
        [
          {
            text: "✅ | Claim",
            callback_data: `Claim${COIN}`,
          },
        ],
      ],
    },
  };
};
