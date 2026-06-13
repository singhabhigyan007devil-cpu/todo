import { useState } from 'react';
import { Plus, Trash2, Image, Palette, Quote, Link as LinkIcon, Check, ExternalLink } from 'lucide-react';
import type { Inspiration, Todo } from '../types/todo';

interface CreativeWorkspaceProps {
  inspirations: Inspiration[];
  todos: Todo[];
  onAddInspiration: (title: string, type: 'image' | 'color' | 'quote' | 'link', content: string, notes: string, linkedTodoId: string | null) => void;
  onDeleteInspiration: (id: string) => void;
}

export function CreativeWorkspace({
  inspirations,
  todos,
  onAddInspiration,
  onDeleteInspiration,
}: CreativeWorkspaceProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'image' | 'color' | 'quote' | 'link'>('image');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [linkedTodoId, setLinkedTodoId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddInspiration(
      title.trim(),
      type,
      content.trim(),
      notes.trim(),
      linkedTodoId || null
    );

    // Reset form
    setTitle('');
    setContent('');
    setNotes('');
    setLinkedTodoId('');
    setIsAdding(false);
  };

  const handleCopyColor = (colorHex: string, id: string) => {
    navigator.clipboard.writeText(colorHex).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-4">
        <div>
          <h2 className="text-[17px] font-bold text-[var(--foreground)]">Inspiration Moodboard</h2>
          <p className="text-[12px] text-[var(--muted-text)]">
            Collect visual concepts, color schemes, key quotes, and links to guide your creative sprints.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-full transition-all btn-pressable cursor-pointer"
        >
          <Plus size={13} />
          <span>Add Inspiration</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 border border-[var(--border-color)]/60 rounded-[18px] bg-[var(--card-bg)] space-y-4 max-w-xl animate-slide-in"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
            New Inspiration Element
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hero image ref, primary swatches..."
                className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--background)]/40 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as any);
                  setContent('');
                }}
                className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--background)]/40 text-[var(--foreground)] focus:outline-none cursor-pointer"
              >
                <option value="image">Image (URL)</option>
                <option value="color">Color Swatch (Hex Code)</option>
                <option value="quote">Styled Quote</option>
                <option value="link">Reference Link (URL)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">
              {type === 'image' && 'Image URL'}
              {type === 'color' && 'Hex Color Code (e.g. #2997ff)'}
              {type === 'quote' && 'Quote text'}
              {type === 'link' && 'Web Link URL'}
            </label>
            <input
              type="text"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'image'
                  ? 'https://images.unsplash.com/photo...'
                  : type === 'color'
                  ? '#2997ff'
                  : type === 'quote'
                  ? 'Form follows function...'
                  : 'https://news.ycombinator.com...'
              }
              className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--background)]/40 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Description or context details..."
                className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--background)]/40 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Link to Task</label>
              <select
                value={linkedTodoId}
                onChange={(e) => setLinkedTodoId(e.target.value)}
                className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--background)]/40 text-[var(--foreground)] focus:outline-none cursor-pointer"
              >
                <option value="">No linked task</option>
                {todos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-lg transition-colors cursor-pointer"
            >
              Add to Board
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 py-2 text-xs font-semibold text-[var(--foreground)] bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {inspirations.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--background)] mb-4">
            <Palette size={22} className="text-[var(--muted-text)]" />
          </div>
          <h3 className="text-[17px] font-semibold tracking-tight-display text-[var(--foreground)] mb-1">
            Moodboard is empty
          </h3>
          <p className="text-[14px] text-[var(--muted-text)] max-w-sm mx-auto">
            Click the button above to pin reference images, color palettes, or bookmarks to your workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspirations.map((item) => {
            const linkedTodo = todos.find((t) => t.id === item.linkedTodoId);
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden border border-[var(--border-color)]/60 rounded-[20px] bg-[var(--card-bg)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/55 apple-product-shadow card-3d"
              >
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)]/20">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {item.type === 'image' && <Image size={14} className="text-blue-400 flex-shrink-0" />}
                    {item.type === 'color' && <Palette size={14} className="text-purple-400 flex-shrink-0" />}
                    {item.type === 'quote' && <Quote size={14} className="text-amber-400 flex-shrink-0" />}
                    {item.type === 'link' && <LinkIcon size={14} className="text-green-400 flex-shrink-0" />}
                    <span className="text-[12px] font-bold text-[var(--foreground)] truncate">
                      {item.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteInspiration(item.id)}
                    className="p-1 rounded-full text-[var(--muted-text)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Content Renderers */}
                <div className="flex-1">
                  {item.type === 'image' && (
                    <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                      <img
                        src={item.content}
                        alt={item.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                  )}

                  {item.type === 'color' && (
                    <div className="p-4 space-y-3">
                      <div
                        className="h-20 w-full rounded-xl border border-black/10 dark:border-white/10 shadow-inner flex items-end justify-end p-2"
                        style={{ backgroundColor: item.content }}
                      >
                        <button
                          onClick={() => handleCopyColor(item.content, item.id)}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer flex items-center gap-1 font-mono text-[9px] uppercase font-bold"
                          title="Copy Hex to Clipboard"
                        >
                          {copiedId === item.id ? <Check size={10} className="text-green-400" /> : <Palette size={10} />}
                          <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-[var(--foreground)] select-all">
                          {item.content}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.type === 'quote' && (
                    <div className="p-5 flex flex-col justify-center min-h-[100px] border-l-2 border-amber-500/40 bg-[var(--background)]/20 font-serif">
                      <span className="text-[13px] leading-relaxed text-[var(--foreground)] font-medium italic">
                        "{item.content}"
                      </span>
                    </div>
                  )}

                  {item.type === 'link' && (
                    <div className="p-4">
                      <a
                        href={item.content}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 border border-[var(--border-color)]/60 rounded-xl bg-[var(--background)]/35 text-[var(--foreground)] hover:border-[var(--accent)] transition-all group/link cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate group-hover/link:text-[var(--accent)]">
                            {item.content}
                          </p>
                          <p className="text-[9px] text-[var(--muted-text)] font-semibold uppercase tracking-wider mt-0.5">
                            Visit Site
                          </p>
                        </div>
                        <ExternalLink size={12} className="text-[var(--muted-text)] group-hover/link:text-[var(--accent)] transition-colors flex-shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Note Area */}
                  {item.notes && (
                    <div className="px-4 pb-3 pt-1">
                      <p className="text-[11px] text-[var(--muted-text)] leading-relaxed italic">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer linked todo */}
                {linkedTodo && (
                  <div className="px-4 py-2 bg-[var(--background)]/40 border-t border-[var(--border-color)]/20 flex items-center gap-1.5">
                    <LinkIcon size={10} className="text-[var(--muted-text)] flex-shrink-0" />
                    <span className="text-[9px] font-bold text-[var(--muted-text)] uppercase tracking-wider truncate">
                      Linked: {linkedTodo.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
