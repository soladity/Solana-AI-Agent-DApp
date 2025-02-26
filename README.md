# Solana AI Agent for Asset management

This is a AI agents on Solana blockchain where users can interact with it to send, swap, mint, airdrop assets. 

## Setup

1. Clone this repository and open it in your terminal. 
```sh
git clone https://github.com/soladity/Solana-AI-Agent-DApp
```

2. Install the necessary dependencies with `npm`.
```sh
npm i 
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`
```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and interact with Agent!


