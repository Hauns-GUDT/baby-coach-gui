import { useState } from 'react';

const DEFAULT_API_URL = 'http://localhost:8000/api/chat';

function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const backendAnswer = data.answer ?? data.message ?? JSON.stringify(data, null, 2);
      setAnswer(backendAnswer);
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong while contacting the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="layout">
      <section className="card">
        <h1>Baby Coach</h1>
        <p className="subtitle">
          Ask questions about feeding, sleep, diapers, routines, and receive guidance from your backend API.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="apiUrl">Backend API URL</label>
          <input
            id="apiUrl"
            value={apiUrl}
            onChange={(event) => setApiUrl(event.target.value)}
            placeholder="http://localhost:8000/api/chat"
          />

          <label htmlFor="prompt">Your Prompt</label>
          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: My baby is 5 months old and wakes up every hour. What can I try?"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Prompt'}
          </button>
        </form>

        {error && (
          <div className="status error" role="alert">
            {error}
          </div>
        )}

        {answer && (
          <article className="status success">
            <h2>Backend Answer</h2>
            <pre>{answer}</pre>
          </article>
        )}
      </section>
    </main>
  );
}

export default App;
