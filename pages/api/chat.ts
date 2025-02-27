import type { NextApiRequest, NextApiResponse } from "next";

import { agent } from "../../utils/agent";



// export async function POST(req: NextApiRequest) {
//   try {
//     const body = await req.body;
//     const messages = body.messages ?? [];

//       const eventStream = agent.streamEvents(
//         {
//           messages,
//         },
//         {
//           version: "v2",
//           configurable: {
//             thread_id: "Solana Agent Kit!",
//           },
//         },
//       );
  
//       const textEncoder = new TextEncoder();
//       const transformStream = new ReadableStream({
//         async start(controller) {
//           for await (const { event, data } of eventStream) {
//             if (event === "on_chat_model_stream") {
//               if (data.chunk.content) {
//                 controller.enqueue(textEncoder.encode(data.chunk.content));
//               }
//             }
//           }
//           controller.close();
//         },
//       });
  
//       return new Response(transformStream);
    
//   } catch (e: any) {
//     return NextApiResponse.json({ error: e.message }, { status: e.status ?? 500 });
//   }
// }



async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {


  try {
    const body = req.body;
    const messages = body.messages ?? [];

    return res.status(200).json({ sss: process.env.RPC_URL });

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
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              if (data.chunk.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });
  
  } catch (e:any) {
    return res.status(401).json({ error: e.message });
  }





















  // const headerAuthToken = req.headers.authorization?.replace(/^Bearer /, "");
  // const cookieAuthToken = req.cookies["privy-token"];

  // const authToken = cookieAuthToken || headerAuthToken;
  // if (!authToken) return res.status(401).json({ error: "Missing auth token" });

  // try {
  //   const claims = await client.verifyAuthToken(authToken);
  //   return res.status(200).json({ claims });
  // } catch (e: any) {
  //   return res.status(401).json({ error: e.message });
  // }



}

export default handler;