
export function LogoWall() {
  const logos = [
    { name: 'Vercel', slug: 'vercel' },
    { name: 'Figma', slug: 'figma' },
    { name: 'Notion', slug: 'notion' },
    { name: 'Linear', slug: 'linear' },
    { name: 'GitHub', slug: 'github' },
    { name: 'Stripe', slug: 'stripe' },
    { name: 'Google', slug: 'google' },
    { name: 'Netflix', slug: 'netflix' },
    { name: 'Airbnb', slug: 'airbnb' },
    { name: 'Slack', slug: 'slack' },
  ];

  return (
    <div className="w-full py-8 border-y border-[var(--border-color)]/30 bg-[var(--card-bg)]/30 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-6">
          Loved by builders at high-growth teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {logos.map((logo) => (
            <div 
              key={logo.name} 
              className="logo-wall-item flex items-center justify-center w-28 h-8 opacity-55 hover:opacity-100 transition-opacity"
            >
              <img
                src={`https://cdn.simpleicons.org/${logo.slug}/86868b`}
                alt={`${logo.name} Logo`}
                className="max-h-5 object-contain select-none dark:invert-0 brightness-0 dark:brightness-100 dark:opacity-85"
                draggable="false"
                onError={(e) => {
                  // Fallback to text just in case simpleicons is blocked or offline
                  e.currentTarget.style.display = 'none';
                  const span = document.createElement('span');
                  span.className = 'text-sm font-semibold text-[var(--muted-text)] tracking-wider';
                  span.innerText = logo.name.toUpperCase();
                  e.currentTarget.parentNode?.appendChild(span);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
