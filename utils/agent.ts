import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";


const llm = new ChatOpenAI({
  temperature: 0.7,
  model: "gpt-4o-mini",
});


export const agent = () => {
    const solanaAgent = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL,
        process.env.OPENAI_API_KEY!,
    );
      
    
      
    const tools = createSolanaTools(solanaAgent);
    const memory1 = new MemorySaver();
    return createReactAgent({
        llm,
        tools,
        checkpointSaver: memory1,
        messageModifier: `
            this is solana ai agent.
          `,
      });  
} 