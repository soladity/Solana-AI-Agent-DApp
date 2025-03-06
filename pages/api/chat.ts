import type { NextApiRequest, NextApiResponse } from "next";

import { PrivyClient, AuthTokenClaims } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

import { getAgent } from "../../utils/agent";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, "");
    const cookieAuthToken = req.cookies["privy-token"];
  
    const authToken = cookieAuthToken || headerAuthToken;
    if (!authToken) return res.status(401).json({ error: "Missing auth token" });

    const claims = await client.verifyAuthToken(authToken);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    
    const body = req.body;
    const messages = body.messages ?? [];

    const agent = await getAgent(claims.userId);

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