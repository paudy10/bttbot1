import { schedule } from "node-cron";
import Profit from "../../model/profit.js";

export default function scheduleProfit() {
  //min
  schedule(
    "* * * * *",
    async () => {
      const profit = await Profit.find();
      profit.map((user) => {
        if (user.userid) {
          ctx.telegram.sendMessage(
            user.userid,
            `+${user.amount}$ Daily Profit`
          );
        }
      });
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
}
