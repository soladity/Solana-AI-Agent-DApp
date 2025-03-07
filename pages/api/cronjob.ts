import type { NextApiRequest, NextApiResponse } from "next";
import { TwitterApi } from "twitter-api-v2";

import { getAgent } from "../../utils/agent";
import { connectDB } from "../../lib/mongodb";
import Reply from "../../models/Reply";

// Initialize Twitter Client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});


async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();

    const { data } = await twitterClient.v2.search("@Maya_Supply", {max_results: 10});
    for (const mention of data.data) {
      const tweetId = mention.id;
      let tweetText = mention.text.replace("@Maya_Supply", "");

      const replyText = `You said: "${tweetText}"`;
      await twitterClient.v2.reply(replyText, tweetId);

      const repliesFromDB = await Reply.find({mentionId: mention.id})
      if(repliesFromDB.length == 0) {
        const replyRec = new Reply();
        replyRec.mentionId = tweetId;
        replyRec.mentionText = tweetText;
        replyRec.replyText = replyText;
        await replyRec.save();
      }
      console.log(`✅ Replied`);
    }
    
    return res.end();
  } catch (e:any) {
    return res.status(401).json({ error: e.message });
  }
}
export default handler;