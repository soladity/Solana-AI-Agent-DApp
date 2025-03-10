import type { NextApiResponse } from "next";
import { TwitterApi, TwitterApiTokens } from "twitter-api-v2";

import { getAgentFromTwitterId } from "../../utils/agent";
import { connectDB } from "../../lib/mongodb";
import Reply from "../../models/Reply";

// Initialize Twitter Client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
} as TwitterApiTokens);

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN as string);


const getUserIdFromTweet = async (tweetId:string) => {
  try {
    const tweet = await client.v2.singleTweet(tweetId, { "tweet.fields": "author_id" });
    //console.log("User ID:", tweet.data);
    return tweet.data.author_id;
  } catch (error) {
    console.error("Error fetching tweet:", error);
  }
}

const checkIfReplied = async (tweetId:string) => {
  try {
    const reply = await Reply.find({mentionId: tweetId});
    if(reply.length==0) return false;
    return true;
  } catch (error) {
    console.log("ERROR", error);
  }
}


async function handler(
  //req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await connectDB();
    const { data } = await twitterClient.v2.search("@Maya_Supply", {max_results: 10});
    for (const mention of data.data) {
      const tweetId = mention.id;
      let tweetText = mention.text.replace("@Maya_Supply", "");

      const replied = await checkIfReplied(tweetId);
      console.log({replied}, {tweetText})
      if(!replied) {
        const userId = await getUserIdFromTweet(tweetId);
        if(userId == "1896959302344286208") return;
        const agent = await getAgentFromTwitterId(userId as string);
        const eventStream = agent.streamEvents(
          {
            messages: tweetText,
          },
          {
            version: "v2",
            configurable: {
              thread_id: "Supply Next",
            },
          }
        );
        
        let replyText = "";
        for await (const { event, data } of eventStream) {
          if (event === "on_chat_model_stream" && data.chunk.content) {
            replyText += data.chunk.content; // Collect chunks
          }
        }
        
        console.log({replyText})
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
    }
    
    return res.status(200).json({ message: "Great"});
  } catch (e:any) {
    return res.status(401).json({ error: e.message });
  }
}
export default handler;