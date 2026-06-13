import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Small progress is still progress.', author: 'Unknown' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'The best time to start was yesterday. The next best time is now.', author: 'Unknown' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'You don\'t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'The only bad workout is the one that didn\'t happen.', author: 'Unknown' },
  { text: 'Your future self will thank you for starting today.', author: 'Unknown' },
  { text: 'Every task completed is one step closer to your goal.', author: 'Unknown' },
];

export function MotivationalQuote() {
  const [index, setIndex] = useState(Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];

  return (
    <div className="text-center py-2 px-4 animate-fade-in">
      <div className="flex items-center justify-center gap-2 text-slate-400">
        <Sparkles size={14} className="text-yellow-500/70 flex-shrink-0" />
        <p className="text-xs italic">&ldquo;{quote.text}&rdquo;</p>
        <Sparkles size={14} className="text-yellow-500/70 flex-shrink-0" />
      </div>
      <p className="text-[10px] text-slate-600 mt-0.5">&mdash; {quote.author}</p>
    </div>
  );
}
