# Design Brief

## Direction
Clean Medical — Professional medical learning platform for MBBS students with calm, clear visual hierarchy optimized for focus and information density.

## Tone
Clinical clarity without sterility. Cool, trustworthy blue primary with warm orange accents for encouragement and progress feedback. Minimal decoration maximizes content prominence.

## Differentiation
Medical subject progress rings paired with study streak counters create visual momentum while maintaining professional tone. Warm orange secondary accents reward learning milestones.

## Color Palette

| Token           | OKLCH           | Role                          |
| --------------- | --------------- | ----------------------------- |
| background      | 0.98 0.008 230  | Primary surface (cool off-white)          |
| foreground      | 0.18 0.015 230  | Body text (clinical dark)     |
| card            | 1.0 0.004 230   | Quiz/flashcard surfaces       |
| primary         | 0.45 0.16 240   | Medical blue (buttons, links) |
| secondary       | 0.65 0.17 70    | Warm orange (badges, progress)|
| muted           | 0.95 0.01 230   | Subtle backgrounds            |
| accent          | 0.65 0.17 70    | Interactive highlights        |
| destructive     | 0.55 0.22 25    | Error/negative states         |

## Typography
- Display: Space Grotesk — Modern, confident headings for subjects and topics
- Body: DM Sans — Clean, readable body text and quiz questions
- Mono: Geist Mono — Code snippets, formulas in biochemistry
- Scale: h1 `text-4xl md:text-5xl font-bold` | h2 `text-2xl font-bold` | label `text-xs font-semibold uppercase` | body `text-base`

## Elevation & Depth
Subtle layered surfaces with minimal shadows. Quiz cards and subject progress rings use `shadow-subtle`. Active sections emphasized via background color, not depth.

## Structural Zones

| Zone    | Background       | Border            | Notes                         |
| ------- | ---------------- | ----------------- | ----------------------------- |
| Header  | bg-card          | border-b          | Navigation, title             |
| Sidebar | bg-sidebar       | border-r          | Subject/topic navigation      |
| Content | bg-background    | —                 | Main quiz/flashcard area      |
| Card    | bg-card          | border rounded-md | Quiz options, flashcards      |

## Spacing & Rhythm
Generous breathing room between sections (gap-8) with compact micro-spacing within cards (p-4). Subject cards use equal padding for visual rhythm.

## Component Patterns
- Buttons: Solid primary blue for actions (rounded-md), secondary orange for "next" progression
- Cards: Rounded-md with subtle shadow, hover lift via `shadow-elevated`
- Progress Rings: Orange circular displays for subject completion percentage
- Badges: Orange background for streak/achievement counters

## Motion
- Entrance: Cards fade in staggered on page load (200ms delay)
- Hover: Button background shift + lift shadow (transition-smooth)
- Decorative: None—focus on content clarity

## Constraints
- No gradient backgrounds or decorative elements
- Information density over whitespace (medical content is dense)
- All interactive states use color only, no animation bloat
- High contrast (min 4.5:1) for WCAG AA+ compliance

## Signature Detail
Orange progress badges contrast sharply with cool blue palette, creating visual momentum for studying without sacrificing clinical credibility.
