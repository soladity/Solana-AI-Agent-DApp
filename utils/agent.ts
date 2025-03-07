import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import User from "../models/User";
import { connectDB } from "../lib/mongodb";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
const agents = new Map(); // Stores agents by privy id

export const getPrivateKeyFromPrivyId = async (privyId:string, twitterId:string, twitterUsername:string) =>  {
  try {
    await connectDB();
    const user = await User.find({privyId});

    if(user.length ==0) {
      const keypair = Keypair.generate();
      const privateKeyString:string = bs58.encode(keypair.secretKey)
      const newUser = new User();
      newUser.privyId = privyId;
      newUser.pKey = privateKeyString;
      newUser.twitterId = twitterId;
      newUser.twitterUsername = twitterUsername;
      await newUser.save();
      return privateKeyString;
    }
    return user[0].pKey;  
  } catch (error:any) {
    console.log("ERROR:", error.message);
  }
}

export const getAgent = async (privyId:string, twitterId:string, twitterUsername:string) => {
  if (agents.has(privyId)) {
    return agents.get(getPrivateKeyFromPrivyId); // Return existing agent
  }

  const privateKey = await getPrivateKeyFromPrivyId(privyId, twitterId, twitterUsername);
  // Create new SolanaAgentKit instance
  const solanaAgent = new SolanaAgentKit(
    privateKey,
    process.env.RPC_URL,
    process.env.OPENAI_API_KEY!
  );

  // Create new agent
  const tools = createSolanaTools(solanaAgent);
  const memory = new MemorySaver();
  const llm = new ChatOpenAI({ temperature: 0.7, model: "gpt-4o-mini"});

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `I am Maya and I work for SupplyNext`,
  });

  // Store and return the new agent
  agents.set(privyId, agent);
  return agent;
}
