import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";

const llm = new ChatOpenAI({
  temperature: 0.7,
  model: "gpt-4o-mini",
});

const solanaAgent1 = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL,
  process.env.OPENAI_API_KEY!,
);

const solanaAgent2 = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY2!,
  process.env.RPC_URL,
  process.env.OPENAI_API_KEY!,
);



const tools = createSolanaTools(solanaAgent1);
const tools2 = createSolanaTools(solanaAgent2);
const memory1 = new MemorySaver();
const memory2 = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools,
  checkpointSaver: memory1,
  messageModifier: `
      this is solana ai agent.
    `,
});

const agent2 = createReactAgent({
  llm,
  tools:tools2,
  checkpointSaver: memory2,
  messageModifier: `
      this is second solana ai agent.
    `,
});

let count = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    if(count % 2 ==0) {
      count++;
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
  
      return new Response(transformStream);
    } else {
      count++;
      const eventStream = agent2.streamEvents(
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
  
      return new Response(transformStream);
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
