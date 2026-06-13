import { useState, useEffect } from 'react';

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Small progress is still progress.', author: 'Unknown' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'The best time to start was yesterday. The next best time is now.', author: 'Unknown' },
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'You don\'t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Your future self will thank you for starting today.', author: 'Unknown' },
];

export function MotivationalQuote() {
  const [index, setIndex] = useState(Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % QUOTES.length), 15000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];

  return (
    <div className="text-center py-1.5 px-4 animate-fade-in max-w-xl mx-auto">
      <p className="text-[13px] italic font-normal text-[var(--muted-text)] leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
      <span className="inline-block text-[10px] uppercase tracking-wider text-[var(--muted-text)]/50 mt-1">&mdash; {quote.author}</span>
    </div>
  );
}
