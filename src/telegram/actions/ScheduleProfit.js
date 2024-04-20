import { schedule } from "node-cron";
import Profit from "../../model/profit.js";
import User from "../../model/user.js";

export default function scheduleProfit(bot) {
  //min
  schedule(
    "* * * * *",
    async () => {
      const profit = await Profit.find();

      profit.map(async (user) => {
        if (user.userid) {
          const prevuser = await User.findOne({ id: user.userid });
          bot.telegram.sendMessage(
            user.userid,
            `+${(user.amount * user.daily) / 100}$ Daily Profit`
          );
          let newbalance = prevuser.balance + (user.amount * user.daily) / 100;
          let UpdUser = await User.findOneAndUpdate(
            { id: user.userid },
            { balance: newbalance },
            { upsert: true }
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
