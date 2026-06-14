import JSZip from 'jszip';

interface IntelligenceResult {
  minutes: string;
  tasks: Array<{
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    categoryId: string | null;
    dueDate: number | null;
  }>;
}

// 1. Extract raw text from slide XML files inside .pptx
export async function extractTextFromPptx(file: File): Promise<{ pptxText: string; pptxName: string }> {
  try {
    const zip = await JSZip.loadAsync(file);
    const slideTexts: string[] = [];

    // Filter slide XML files
    const slideFiles = Object.keys(zip.files).filter(
      (path) => path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
    );

    if (slideFiles.length === 0) {
      throw new Error('No slides found in the presentation file.');
    }

    // Sort slides numerically (slide1.xml, slide2.xml, slide10.xml...)
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

    const parser = new DOMParser();

    for (const slidePath of slideFiles) {
      const slideXml = await zip.files[slidePath].async('string');
      const xmlDoc = parser.parseFromString(slideXml, 'application/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      const slideWords: string[] = [];

      for (let i = 0; i < textNodes.length; i++) {
        if (textNodes[i].textContent) {
          slideWords.push(textNodes[i].textContent!.trim());
        }
      }

      if (slideWords.length > 0) {
        const slideIndex = slideTexts.length + 1;
        // Clean double spaces and merge
        const cleanedText = slideWords.filter(w => w.length > 0).join(' ');
        slideTexts.push(`--- Slide ${slideIndex} ---\n${cleanedText}`);
      }
    }

    return {
      pptxText: slideTexts.join('\n\n'),
      pptxName: file.name
    };
  } catch (error: any) {
    console.error('Error parsing PPTX file:', error);
    throw new Error(error.message || 'Could not parse presentation file. Make sure it is a valid .pptx file.');
  }
}

// Helper to generate a unique random ID
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// 2. Offline heuristic engine to parse slide texts into structured minutes/action items
export function generateLocalIntelligence(title: string, pptxText: string): IntelligenceResult {
  const lines = pptxText.split('\n');
  const slides: string[] = [];
  let currentSlide = '';
  
  lines.forEach((line) => {
    if (line.startsWith('--- Slide')) {
      if (currentSlide.trim()) {
        slides.push(currentSlide);
      }
      currentSlide = line + '\n';
    } else {
      currentSlide += line + '\n';
    }
  });
  if (currentSlide.trim()) {
    slides.push(currentSlide);
  }

  // Create Agenda & Minutes Overview
  let minutesMarkdown = `# Meeting Minutes: ${title}\n\n`;
  minutesMarkdown += `*Parsed via Offline Presentation Analyzer*\n\n`;
  minutesMarkdown += `## Executive Summary\n`;
  minutesMarkdown += `This meeting was compiled from slide notes containing **${slides.length} slides**.\n\n`;
  
  minutesMarkdown += `## Section Breakdowns\n`;
  const tasks: IntelligenceResult['tasks'] = [];
  
  // Action verbs list for parsing
  const actionVerbs = [
    'create', 'develop', 'build', 'design', 'update', 'fix', 'setup', 'prepare', 'test',
    'deploy', 'write', 'implement', 'analyze', 'review', 'research', 'launch', 'send',
    'contact', 'meet', 'integrate', 'schedule', 'optimize'
  ];

  slides.forEach((slide, idx) => {
    const slideLines = slide.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const header = slideLines[0] || `Slide ${idx + 1}`;
    
    // Attempt to parse slide title (usually first text lines)
    const contentLines = slideLines.slice(1);
    const titleCandidates = contentLines.slice(0, 2).filter(l => l.length > 2 && l.length < 50);
    const slideTitle = titleCandidates[0] || `Topic: Discussion ${idx + 1}`;
    
    minutesMarkdown += `### ${slideTitle}\n`;
    minutesMarkdown += `*(${header})*\n`;
    
    if (contentLines.length > 0) {
      minutesMarkdown += `${contentLines.slice(0, 4).join('  \n')}\n\n`;
    } else {
      minutesMarkdown += `*No text content found on this slide.*\n\n`;
    }

    // Heuristics to extract action tasks
    contentLines.forEach((line) => {
      // Look for checklist triggers or action verbs
      const cleanLine = line.toLowerCase();
      const hasActionTrigger = 
        cleanLine.includes('todo') || 
        cleanLine.includes('action item') || 
        cleanLine.includes('must do') || 
        cleanLine.includes('asap') ||
        actionVerbs.some(verb => cleanLine.startsWith(verb));

      // Limit length to avoid importing entire paragraphs
      if (hasActionTrigger && line.length > 5 && line.length < 100) {
        // Strip bullet points or indices
        let taskTitle = line.replace(/^[-*•\d\.\s]+/, '').trim();
        // Capitalize first letter
        taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

        // Heuristic priority
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (cleanLine.includes('critical') || cleanLine.includes('urgent') || cleanLine.includes('asap') || cleanLine.includes('high')) {
          priority = 'high';
        } else if (cleanLine.includes('optional') || cleanLine.includes('low') || cleanLine.includes('nice to have')) {
          priority = 'low';
        }

        // Avoid adding exact duplicate tasks
        if (!tasks.some(t => t.title.toLowerCase() === taskTitle.toLowerCase())) {
          tasks.push({
            id: `ext-${generateShortId()}`,
            title: taskTitle,
            priority,
            categoryId: null,
            dueDate: null
          });
        }
      }
    });
  });

  return {
    minutes: minutesMarkdown,
    tasks
  };
}

// 3. Main generation wrapper targeting Gemini 2.5 Flash API with local fallback
export async function generateMeetingIntelligence(
  title: string,
  pptxText: string,
  geminiKey?: string
): Promise<IntelligenceResult> {
  if (!geminiKey) {
    return generateLocalIntelligence(title, pptxText);
  }

  const systemPrompt = `You are a professional business scribe. Your job is to analyze presentation slides from a meeting titled "${title}" and extract details in a JSON structure.
You MUST output a valid JSON object matching this schema:
{
  "minutes": "A clean, beautifully structured Markdown summary of the meeting, including executive overview, agenda points derived from slides, discussion details, and conclusions.",
  "tasks": [
    {
      "title": "A short, clear, actionable item (maximum 80 characters)",
      "priority": "low" or "medium" or "high"
    }
  ]
}
Ensure all keys are formatted exactly. Do not output any markdown wrapper (\`\`\`json) or conversational text. Return only raw JSON string.`;

  const userContent = `Here are the slide text contents:
${pptxText}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: userContent }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const json = await response.json();
    const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textOutput) {
      throw new Error('Empty response from Gemini.');
    }

    const result = JSON.parse(textOutput);
    
    // Format tasks to include default fields
    const formattedTasks = (result.tasks || []).map((t: any) => ({
      id: `ext-${generateShortId()}`,
      title: t.title || 'Action item',
      priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
      categoryId: null,
      dueDate: null
    }));

    return {
      minutes: result.minutes || 'Could not generate structured minutes.',
      tasks: formattedTasks
    };

  } catch (error) {
    console.warn('Gemini intelligence failed, falling back to local extractor:', error);
    // Graceful fallback to offline rule extractor
    return generateLocalIntelligence(title, pptxText);
  }
}
