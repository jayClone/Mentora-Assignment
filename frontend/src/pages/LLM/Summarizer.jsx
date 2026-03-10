import { useState } from 'react';
import toast from 'react-hot-toast';
import { summarizeText } from '../../services/llm';
import { MdAutoAwesome } from 'react-icons/md';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedText = text.trim();
  const charCount = trimmedText.length;
  const isValid = charCount >= 50 && charCount <= 10000;

  const handleSummarize = async (e) => {
    e.preventDefault();

    if (charCount < 50) {
      toast.error('Please write at least 50 characters');
      return;
    }

    if (charCount > 10000) {
      toast.error('Text is too long (max 10,000 characters)');
      return;
    }

    setLoading(true);
    try {
      const result = await summarizeText({ text: trimmedText });
      setSummary(result.summary);
      toast.success('Text summarized successfully!');
    } catch (error) {
      console.error('Summarize error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to summarize text';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div>
        <h1 className="text-4xl font-bold text-forest-700 flex items-center gap-3">
          <MdAutoAwesome className="text-sage-600" /> AI Text Summarizer
        </h1>
        
      </div>

      <div className="mt-8 max-w-4xl">
        <form onSubmit={handleSummarize} className="bg-white rounded-xl shadow-md p-8 mb-8 border-2 border-sage-200">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-forest-700">
                Text to Summarize
              </label>
              <span className={`text-sm font-medium ${charCount >= 50 && charCount <= 10000 ? 'text-sage-600' : charCount > 10000 ? 'text-red-600' : 'text-orange-600'}`}>
                {charCount}/10,000
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to summarize (50-10,000 characters)..."
              className="w-full h-64 px-4 py-3 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent resize-none"
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm text-sage-600">
                {charCount < 50
                  ? `Write at least ${50 - charCount} more characters`
                  : charCount > 10000
                  ? 'Text exceeds maximum length'
                  : '✓ Ready to summarize'}
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="mt-6 w-full bg-forest-600 text-cream-50 py-3 rounded-lg hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition flex items-center justify-center gap-2"
          >
            <MdAutoAwesome className="w-5 h-5" />
            {loading ? 'Summarizing...' : 'Summarize Text'}
          </button>
        </form>

        {summary && (
          <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-sage-600">
            <h2 className="text-2xl font-bold text-forest-700 mb-4 flex items-center gap-2">
              <MdAutoAwesome className="text-sage-600" /> Summary
            </h2>
            <div className="bg-cream-50 rounded-lg p-4 border border-sage-200">
              <p className="text-forest-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
            <p className="text-sm text-sage-500 mt-4">
              Generated using Gemini 2.5 Flash • {charCount} characters summarized
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
