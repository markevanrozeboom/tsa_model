# LLM Integration Guide for TSA Financial Model

This guide explains how to add LLM (Large Language Model) integration to the TSA Financial Scenario Model for Q&A functionality.

## Overview

You can integrate an LLM to allow users to ask questions about the financial model, get explanations of assumptions, and receive insights about the projections. This can be done using various LLM APIs.

## Option 1: OpenAI API Integration (Recommended)

### Setup

1. **Get an API Key**
   - Sign up at https://platform.openai.com/
   - Generate an API key from your account settings
   - Store it securely (never commit to git)

2. **Add the Integration to `index.html`**

Add this code before the closing `</script>` tag in index.html:

```javascript
// LLM Integration Component
function LLMChat() {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiKey, setApiKey] = React.useState(localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = React.useState(!apiKey);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get current model state for context
      const modelContext = `
Current Model State:
- Scenario: ${activeScenario}
- Year 10 Students: ${formatNumber(model.summary.totalStudents)}
- Year 10 Revenue: ${formatCurrency(model.summary.totalRevenue)}
- Year 10 EBITDA: ${formatCurrency(model.summary.totalEBITDA)}
- Terminal Value: ${formatCurrency(model.summary.terminalValue)}
- Peak Funding: ${formatCurrency(model.summary.peakFunding)}

Parameters:
- Virtual Growth: ${(params.virtualGrowthMult * 100).toFixed(0)}%
- Micro Growth: ${(params.microGrowthMult * 100).toFixed(0)}%
- Mid-Sized Growth: ${(params.midSizedGrowthMult * 100).toFixed(0)}%
- Cost Inflation: ${(params.costInflation * 100).toFixed(0)}%
- EBITDA Multiple: ${params.ebitdaMultiple.toFixed(1)}x
      `;

      const systemPrompt = `You are a financial analyst assistant helping with TSA (The Strata Academy) financial modeling. 
The model projects 10 years across 4 tiers: Virtual Schools, Microschools, Mid-Sized Schools, and Flagship Campuses.
Answer questions about the model, assumptions, and projections. Be concise and data-driven.

Base Assumptions:
- Virtual: $10,474 tuition, $2,000 timeback (19.1%), target 100K students
- Micro: $15,000 tuition, $3,000 timeback (20%), 25 students/school, target 4,000 schools
- Mid-Sized: $25,000 tuition, $5,000 timeback (20%), 400-1000 students, renovated or ground-up
- Flagship: $50,000 tuition, $10,000 timeback (20%), 1,500 students, 4 campuses

${modelContext}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10), // Last 10 messages for context
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key and try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowSettings(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Icon name="message-circle" size={20} />
          Ask Questions About the Model
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          <Icon name="settings" size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={saveApiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally in your browser and never sent to our servers.
          </p>
        </div>
      )}

      <div className="mb-4 max-h-96 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">Try asking:</p>
            <ul className="text-sm space-y-1">
              <li>"What happens if mid-sized school growth is 50% lower?"</li>
              <li>"Explain the breakeven calculation"</li>
              <li>"What drives the terminal value?"</li>
              <li>"How sensitive is EBITDA to cost inflation?"</li>
            </ul>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-50 ml-8'
                : 'bg-gray-50 mr-8'
            }`}
          >
            <p className="text-sm font-medium mb-1">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">
            <Icon name="loader" size={20} className="animate-spin inline-block" />
            <p className="text-sm mt-2">Thinking...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question about the model..."
          disabled={!apiKey || isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          onClick={sendMessage}
          disabled={!apiKey || !input.trim() || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

3. **Add the LLM Chat Component to the UI**

In the main `TSAScenarioModel` component, add the `<LLMChat />` component right after the key metrics section:

```javascript
{/* Key Metrics */}
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
  {/* ... existing metric cards ... */}
</div>

{/* Add LLM Chat here */}
<LLMChat />

{/* Tabs */}
<div className="bg-white rounded-xl shadow-sm border mb-6">
```

## Option 2: Anthropic Claude API

Similar to OpenAI, but use Claude's API:

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: systemPrompt + '\n\n' + input }
    ]
  })
});
```

## Option 3: Local LLM (Ollama)

For a completely free, privacy-focused solution:

1. Install Ollama from https://ollama.ai/
2. Run a model: `ollama run llama2`
3. Use the local API:

```javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama2',
    prompt: systemPrompt + '\n\nUser: ' + input + '\n\nAssistant:',
    stream: false
  })
});
```

## Option 4: Simple FAQ Without LLM

If you want a simpler solution without API calls:

```javascript
function FAQAssistant() {
  const faqs = [
    {
      question: "What is Terminal Value?",
      answer: "Terminal Value is the estimated business value at the end of 10 years, calculated as (Final Year EBITDA × EBITDA Multiple) + (80% of Cumulative CapEx as property value)."
    },
    {
      question: "What does Timeback mean?",
      answer: "Timeback is the financial benefit returned to families, effectively reducing the net tuition cost. It's calculated as a percentage of tuition revenue shared back with families."
    },
    // Add more FAQs...
  ];

  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
      <input
        type="text"
        placeholder="Search FAQs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
      />
      <div className="space-y-4">
        {filteredFAQs.map((faq, idx) => (
          <div key={idx} className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
            <p className="text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Security Considerations

1. **Never hardcode API keys** in the source code
2. **Use localStorage** to store keys client-side (or prompt user each time)
3. **Consider rate limiting** to prevent excessive API usage
4. **Validate inputs** before sending to LLM
5. **Add error handling** for network failures
6. **Consider costs** - OpenAI GPT-4 costs ~$0.03 per 1K input tokens

## Cost Estimates

- **OpenAI GPT-4**: ~$0.10-0.30 per conversation (10-20 messages)
- **OpenAI GPT-3.5-Turbo**: ~$0.002 per conversation (much cheaper)
- **Anthropic Claude**: Similar to GPT-4
- **Local LLM (Ollama)**: Free, but requires local compute

## Testing

After implementation:
1. Enter your API key in settings
2. Ask: "What is the current terminal value?"
3. Ask: "How would increasing mid-sized growth to 120% affect revenue?"
4. Ask: "Explain the difference between the three scenarios"

## Alternative: ChatGPT Integration

If you don't want to build it yourself, you can:
1. Add a link to ChatGPT with pre-filled context
2. Users can paste current model parameters
3. ChatGPT can answer questions based on the context

Example link button:
```javascript
<a
  href="https://chat.openai.com/?q=I'm+using+the+TSA+Financial+Model..."
  target="_blank"
  className="btn"
>
  Ask ChatGPT
</a>
```

---

**Recommendation**: Start with Option 4 (Simple FAQ) for immediate value, then add Option 1 (OpenAI) or Option 3 (Ollama) if you want dynamic Q&A.
