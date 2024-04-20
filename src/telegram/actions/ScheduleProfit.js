import { schedule } from "node-cron";
import Profit from "../../model/profit.js";

export default function scheduleProfit() {
  //min
  schedule(
    "* * * * *",
    async () => {
      const profit = await Profit.find();
      if (profit.length > 0) {
        profit.map((user) => {
          ctx.telegram.sendMessage(
            user.userid,
            `+${user.amount}$ Daily Profit`
          );
        });
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
}
