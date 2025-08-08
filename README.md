# Mini E-commerce Catalog — Smart NLP Search

## What this project does
A small catalog (10 static products) plus a Smart Product Search (Option A) where users can search using natural language. The server uses OpenAI to convert the NL query into structured JSON filters, then filters the local JSON catalog and returns results.

## Files
- server/
  - index.js
  - package.json
  - data/products.json
  - .env (contains OPENAI_API_KEY)
- client/
  - (create-react-app) - replace src/App.js with the provided file

## How to run (dev)
1. Clone or copy files into `server` and `client` folders.
2. In `server/`:
   ```bash
   cd server
   npm install
   # create .env with OPENAI_API_KEY=sk-...
   npm run dev
   ```
3. In client/:

```bash
cd client
npm install

# optionally add "proxy": "http://localhost:4000" to client/package.json
npm start
```
4. Open http://localhost:3000 and try queries like:

* running shoes under $100 with good reviews

* show me electronics below $50

* yoga or fitness items rating 4.5+

---

## Which AI feature
- Smart Product Search (NLP) using OpenAI Chat Completion (model: gpt-4o-mini or similar).

- The server sends the user query and a system prompt asking the model to return ONLY a JSON object describing max_price, min_price, category, min_rating, and keywords.

---

## Tools / libraries used
Node.js, Express

- node-fetch (for OpenAI REST call)

- React (create-react-app)

- OpenAI API (Chat completions)

---

## Notable assumptions
- Small static catalog (no DB).

- The model returns valid JSON; server tries to robustly parse the first JSON block.

- The app trusts the model’s category normalization (if model returns category that doesn't match product categories it will return no results; you can augment prompt to map synonyms).

- For production, you'd validate model output more thoroughly and/or use embeddings / vector search.

---

## Possible improvements
- Use embeddings + semantic search for better matching.

- Add user session to build recommendations and context-aware search (RAG).

- Add caching for model outputs and rate-limiting.

---

# 5) Video walkthrough script (2–3 minutes)
Record this while screen-sharing the local app.

**Script (about 2 minutes):**
1. Intro (10s): “Hi — this is a 2-3 minute walkthrough of the Mini E-commerce Catalog with Smart NLP Search. I’ll show the UI, how natural-language queries work, and the architecture.”
2. UI demo (45s): Open the app, show the static catalog, then type:  
   - “running shoes under $100 with good reviews” → press Search → show parsed filters and results.  
   - Try one more: “electronics under $50” → show results or empty set.
3. Explain backend (30s): “The frontend sends the user query to `/api/search`. The Express server sends a prompt to OpenAI asking it to return a JSON object with `max_price`, `min_price`, `category`, `min_rating`, `keywords`. Server applies the filters on `products.json` and returns matches.”
4. Quick notes (25s): mention environment variable `OPENAI_API_KEY`, how to run locally, and limitations (small catalog, model might sometimes output unexpected JSON — we parse robustly but production hardening needed).
5. End (10s): “Thanks — code and README are included. Happy to extend with embeddings, recommendations, or dynamic pricing.”

---

# 6) Bonus — blockchain integration (2–3 sentences)
You can token-gate special pricing or discounts by issuing NFTs or on-chain tokens: for example, a smart contract could verify ownership of a loyalty NFT before applying a discounted price returned by the dynamic pricing engine. Also, on-chain user preferences (opt-in) could be stored hashed in a smart contract so decentralized apps can read user-preferences for personalized recommendations while maintaining auditability via the blockchain.

---
