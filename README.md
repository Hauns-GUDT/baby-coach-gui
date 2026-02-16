# Baby Coach GUI

A very basic React + Vite frontend for your baby coach backend API.

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the app in your browser and set the backend API URL if needed.

## Expected backend contract

The UI sends a JSON payload:

```json
{
  "prompt": "Your question here"
}
```

to your configured API URL using `POST`.

The UI displays `answer`, `message`, or the full JSON response from your backend.
