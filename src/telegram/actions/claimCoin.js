export const ClaimCoin = (COIN) => {
  return {
    resize_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "✅ | Claim",
          callback_data: `Claim${COIN}`,
        },
      ],
    ],
  };
};
