import type { NextApiRequest, NextApiResponse } from "next";

import { agent } from "../../utils/agent";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    const body = req.body;
    const messages = body.messages ?? [];


      const eventStream = agent.streamEvents(
        {
          messages,
        },
        {
          version: "v2",
          configurable: {
            thread_id: "Solana Agent Kit!",
          },
        },
      );
  
      const textEncoder = new TextEncoder();
      for await (const { event, data } of eventStream) {
        if (event === "on_chat_model_stream" && data.chunk.content) {
          res.write(textEncoder.encode(data.chunk.content));
        }
      }
    
      return res.end();
  } catch (e:any) {
    return res.status(401).json({ error: e.message });
  }
}
export default handler;