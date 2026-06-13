import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Presentation, Maximize2 } from 'lucide-react';
import type { Todo } from '../types/todo';
import { cn } from '../lib/utils';

interface PresentationExporterProps {
  todos: Todo[];
  meetingTitle?: string;
  meetingNotes?: string;
  onClose: () => void;
}

interface SlideData {
  title: string;
  subtitle: string;
  content: string[];
  type: 'welcome' | 'list' | 'conclusion';
}

export function PresentationExporter({ todos, meetingTitle = "TaskFlow Agenda", meetingNotes = "", onClose }: PresentationExporterProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compile Slides based on todos or meeting notes
  const [slides, setSlides] = useState<SlideData[]>([]);

  useEffect(() => {
    const compiledSlides: SlideData[] = [];

    // Slide 1: Welcome
    compiledSlides.push({
      title: meetingTitle,
      subtitle: "Sprint Planning & Backlog Synchronization Agenda",
      content: [
        "TaskFlow automated presentation slide deck.",
        "Facilitating productive reviews, sprint gates, and action alignments.",
        `Date: ${new Date().toLocaleDateString()} | Compiled automatically`
      ],
      type: 'welcome'
    });

    // Extract action items from meeting notes if notes are present
    const meetingActionItems: string[] = [];
    if (meetingNotes) {
      const lines = meetingNotes.split('\n');
      lines.forEach((line) => {
        const match = line.match(/^-\s*\[\s*\]\s*(.*)$/);
        if (match && match[1]) {
          meetingActionItems.push(match[1].trim());
        }
      });
    }

    if (meetingActionItems.length > 0) {
      // Slide 2: Meeting Action Items
      compiledSlides.push({
        title: "Meeting Actions & Tasks",
        subtitle: "Key deliverables compiled from current notes",
        content: meetingActionItems.slice(0, 5),
        type: 'list'
      });
    }

    // Slide 3: Active High Priority Issues
    const highPriorityTodos = todos.filter((t) => !t.completed && t.priority === 'high');
    if (highPriorityTodos.length > 0) {
      compiledSlides.push({
        title: "Critical Path Deliverables",
        subtitle: "High priority active tasks requiring instant alignment",
        content: highPriorityTodos.map((t) => t.title).slice(0, 5),
        type: 'list'
      });
    }

    // Slide 4: Roadmap Planning Progress
    const q1Tasks = todos.filter((t) => t.roadmapPhase === 'q1');
    const q2Tasks = todos.filter((t) => t.roadmapPhase === 'q2');
    const q3Tasks = todos.filter((t) => t.roadmapPhase === 'q3');
    const q4Tasks = todos.filter((t) => t.roadmapPhase === 'q4');
    
    if (q1Tasks.length > 0 || q2Tasks.length > 0 || q3Tasks.length > 0 || q4Tasks.length > 0) {
      const roadmapItems: string[] = [];
      if (q1Tasks.length > 0) roadmapItems.push(`Q1 Strategy: ${q1Tasks.length} tasks scheduled (${Math.round((q1Tasks.filter((t) => t.completed).length / q1Tasks.length) * 100)}% complete)`);
      if (q2Tasks.length > 0) roadmapItems.push(`Q2 Prototype: ${q2Tasks.length} tasks scheduled (${Math.round((q2Tasks.filter((t) => t.completed).length / q2Tasks.length) * 100)}% complete)`);
      if (q3Tasks.length > 0) roadmapItems.push(`Q3 Dev Sprints: ${q3Tasks.length} tasks scheduled (${Math.round((q3Tasks.filter((t) => t.completed).length / q3Tasks.length) * 100)}% complete)`);
      if (q4Tasks.length > 0) roadmapItems.push(`Q4 Launch Gate: ${q4Tasks.length} tasks scheduled (${Math.round((q4Tasks.filter((t) => t.completed).length / q4Tasks.length) * 100)}% complete)`);
      
      compiledSlides.push({
        title: "Quarterly Roadmap Milestones",
        subtitle: "Active roadmap phases and overall progress tracks",
        content: roadmapItems,
        type: 'list'
      });
    }

    // Slide 5: Conclusion
    compiledSlides.push({
      title: "Align & Execute",
      subtitle: "TaskFlow Productivity Engine",
      content: [
        "Time-boxed sprints boost completion rate by 40%.",
        "Action tracking eliminates decision backlog.",
        "Let's align deliverables and launch sprint."
      ],
      type: 'conclusion'
    });

    setSlides(compiledSlides);
  }, [todos, meetingTitle, meetingNotes]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadDeck = () => {
    // Compile Slide HTML elements
    const slidesHtml = slides.map((s, idx) => `
      <div class="slide ${idx === 0 ? 'active' : ''}" id="slide-${idx}">
        <h1>${s.title}</h1>
        <h2>${s.subtitle}</h2>
        ${s.type === 'list' 
          ? `<ul>${s.content.map(item => `<li>${item}</li>`).join('')}</ul>`
          : `<div class="welcome-content">${s.content.map(p => `<p>${p}</p>`).join('')}</div>`
        }
      </div>
    `).join('\n');

    // Build complete file content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meetingTitle} - Slide Deck</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      background: #000000;
      color: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .slide {
      display: none;
      width: 85%;
      max-width: 950px;
      text-align: center;
      animation: slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .slide.active {
      display: block;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 30%, #a1a1a6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h2 {
      font-size: 1.6rem;
      font-weight: 600;
      color: #2997ff;
      margin-top: 0;
      margin-bottom: 2.5rem;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 1.25rem;
      color: #86868b;
      margin-bottom: 1.2rem;
      line-height: 1.6;
    }
    ul {
      text-align: left;
      margin: 2rem auto;
      max-width: 650px;
      font-size: 1.35rem;
      line-height: 1.8;
      color: #e5e5e7;
      list-style-type: none;
      padding-left: 0;
    }
    li {
      margin-bottom: 1rem;
      padding-left: 1.8rem;
      position: relative;
    }
    li::before {
      content: "—";
      position: absolute;
      left: 0;
      color: #2997ff;
    }
    .controls {
      position: absolute;
      bottom: 3rem;
      display: flex;
      gap: 1.5rem;
      align-items: center;
      z-index: 100;
    }
    button {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: #ffffff;
      padding: 0.7rem 1.4rem;
      border-radius: 99px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    button:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.3);
    }
    .progress {
      font-size: 0.95rem;
      color: #86868b;
      font-weight: 600;
      min-width: 60px;
      text-align: center;
    }
    @keyframes slideFade {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  ${slidesHtml}

  <div class="controls">
    <button onclick="prevSlide()">Previous</button>
    <span class="progress" id="progress-indicator">1 / ${slides.length}</span>
    <button onclick="nextSlide()">Next</button>
  </div>

  <script>
    let current = 0;
    const total = ${slides.length};

    function showSlide(index) {
      document.querySelectorAll('.slide').forEach((el) => el.classList.remove('active'));
      document.getElementById('slide-' + index).classList.add('active');
      document.getElementById('progress-indicator').innerText = (index + 1) + ' / ' + total;
    }

    function nextSlide() {
      if (current < total - 1) {
        current++;
        showSlide(current);
      }
    }

    function prevSlide() {
      if (current > 0) {
        current--;
        showSlide(current);
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meetingTitle.toLowerCase().replace(/\s+/g, '_')}_presentation.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (slides.length === 0) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 transition-all duration-300 animate-fade-in",
      isFullscreen ? "p-12" : "p-6"
    )}>
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Presentation size={18} className="text-[var(--accent)]" />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Interactive Slide Deck Exporter</h4>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-full transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Download Slide Deck</span>
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="Toggle fullscreen preview"
          >
            <Maximize2 size={15} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Slide Panel */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full text-center px-4">
        <div key={currentSlide} className="space-y-6 animate-slide-in">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight-hero leading-tight text-white bg-gradient-to-r from-white to-white/70 bg-clip-text">
            {currentSlideData.title}
          </h1>
          <h2 className="text-md md:text-xl font-medium text-[var(--accent)]">
            {currentSlideData.subtitle}
          </h2>
          
          {currentSlideData.type === 'list' ? (
            <ul className="text-left max-w-xl mx-auto space-y-3 pt-4 font-normal text-white/90 text-sm md:text-lg">
              {currentSlideData.content.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[var(--accent)] font-bold">—</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 pt-4 text-white/70 text-xs md:text-[15px] font-normal leading-relaxed">
              {currentSlideData.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Nav Controls */}
      <div className="flex justify-center items-center gap-6 border-t border-white/10 pt-4 pb-2">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>
        <span className="text-xs font-bold text-white/50">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
