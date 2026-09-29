# Lunarays Technologies website

## Luna local setup

Luna's server-side chat endpoint uses the Gemini API. Create a key in [Google AI Studio](https://aistudio.google.com/apikey), then add it to `.env.local` in this project root:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
```

Keep `.env.local` private. It is ignored by `.gitignore`; do not put the key in website JavaScript or commit it.

From the project root, start the Vercel local runtime:

```powershell
npx vercel dev --local --listen 127.0.0.1:3000 --yes
```

Open `http://127.0.0.1:3000` and send Luna a message. The runtime serves the website and `/api/chat` together. To stop it, press `Ctrl+C` in the terminal.

## Deploy to Vercel

1. In the Vercel dashboard, open the Lunarays project and go to **Settings → Environment Variables**.
2. Add `GEMINI_API_KEY` with the key from Google AI Studio. Select the environments you deploy to.
3. Save the variable. Do not add it to the Git repository.
4. Redeploy the project, or push the changes to the connected repository/branch to trigger a deployment.
5. Test Luna on the deployed site with a service question and a follow-up question.

The chat endpoint uses Google's `gemini-3.5-flash-lite` model and Gemini's `generateContent` API. Model availability, free-tier quotas, and pricing are controlled by Google and may change; check the [Gemini API pricing page](https://ai.google.dev/gemini-api/docs/pricing) for current limits.
