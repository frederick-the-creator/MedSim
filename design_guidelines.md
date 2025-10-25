# Medical Simulation App - Design Guidelines

## Design Approach

**Selected Approach**: Design System - Material Design with Healthcare Application Focus

**Justification**: This medical education platform prioritizes clarity, professionalism, and efficient information delivery. Material Design provides excellent patterns for information-dense applications while maintaining visual hierarchy and usability. The approach emphasizes trust, readability, and task completion over visual flair.

**Key Design Principles**:
- Professional credibility through clean, structured layouts
- Information clarity with strong typographic hierarchy
- Efficient task completion with clear navigation and actions
- Accessible design for medical professionals in various contexts

---

## Core Design Elements

### A. Typography

**Primary Font**: Inter (Google Fonts)
- Excellent readability for medical terminology
- Professional appearance
- Wide range of weights for hierarchy

**Secondary Font**: JetBrains Mono (for medical codes/references)
- Use sparingly for technical notations

**Typography Scale**:
- Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Case Titles: text-xl font-semibold (20px)
- Body Text: text-base (16px) - default weight 400
- Medical Data/Findings: text-sm font-medium (14px)
- Labels/Captions: text-xs font-medium (12px)
- Line height: leading-relaxed (1.625) for body text, leading-tight for headings

---

### B. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (elements within components): p-2, gap-2, space-y-2
- Component internal spacing: p-4, p-6, gap-4
- Section spacing: py-8, py-12, gap-8
- Major layout divisions: py-16, gap-16

**Container Strategy**:
- Main content: max-w-7xl mx-auto px-4
- Case details panels: max-w-4xl
- Chat interface: max-w-3xl
- Cards grid: grid with appropriate gutters

**Grid Layouts**:
- Case library: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Two-column case view: grid-cols-1 lg:grid-cols-3 (2:1 ratio for brief:chat)

---

### C. Component Library

#### Navigation
- **Top Navigation Bar**: Fixed header with logo, minimal menu
- Height: h-16
- Padding: px-6
- Elements: Logo (left), Navigation links (right), "Back to Cases" link
- Border: border-b with subtle divider

#### Case Library Cards
- **Card Structure**: Bordered containers with hover elevation
- Padding: p-6
- Border radius: rounded-lg
- Border: border-2 with default subtle border
- Hover state: Lift effect with shadow-lg transition
- Content: Patient name (text-xl font-semibold), Age/gender (text-sm), Clinic type badge, Task description (text-sm leading-relaxed), "Start Simulation" button
- Spacing: space-y-4 internally

#### Case Brief Panel
- **Info Card Design**: Structured data presentation
- Background: Subtle surface treatment
- Padding: p-6
- Border radius: rounded-lg
- Sections with clear headers
- Medical findings in definition list format (term: value pairs)
- Key findings with bullet points, proper spacing between items

#### Chat Interface
- **Message Bubbles**:
  - User messages: Aligned right, max-w-xl, rounded-2xl, rounded-tr-sm, p-4
  - AI/Patient messages: Aligned left, max-w-xl, rounded-2xl, rounded-tl-sm, p-4
  - Spacing: space-y-4 between messages
  - Typography: text-base leading-relaxed
- **Input Area**:
  - Fixed bottom position
  - Padding: p-4
  - Border: border-t divider
  - Input field: Full-width textarea, rounded-lg, p-4, border
  - Send button: Icon button, absolute positioned right

#### Instruction Panels
- **Step Indicators**: Numbered circles with connecting lines (not full stepper)
- Numbers: w-8 h-8 rounded-full, centered text
- Instructions: Clean bullet lists with text-sm
- Icon usage: Small icons (16px) from Heroicons for tips/notifications

#### Buttons
- **Primary Action**: Full rounded (rounded-full), px-6 py-3, text-base font-medium
- **Secondary Action**: Outlined style, same dimensions
- **Icon Buttons**: Square w-10 h-10, rounded-lg, centered icon

#### Badges/Labels
- Clinic type badges: Inline-flex, px-3 py-1, rounded-full, text-xs font-medium, uppercase tracking-wide

#### Feedback Display
- **Feedback Sections**: Accordion-style expandable cards
- Headers: Clickable, p-4, flex justify-between
- Content: p-4 when expanded, structured lists
- Categories clearly labeled with icons
- Ratings/scores displayed prominently

---

### D. Page-Specific Layouts

#### Landing Page
**Structure**: Single page, scrollable
- Hero section: py-16, centered content, max-w-4xl
  - Main heading with app purpose
  - Three-column instruction cards (grid approach)
  - Compact, informative, no images needed
- Case library section: py-12
  - "Select a Case Study" heading
  - Grid of case cards as described above
- Footer: Minimal, py-8, centered links/info

#### Case Detail Page
**Structure**: Split layout on desktop
- Left panel (lg:col-span-1): Fixed/sticky case brief
  - Case title header
  - Triage notes card
  - Key findings card (structured medical data)
  - Task description card
  - Tip card with icon
- Right panel (lg:col-span-2): Chat interface
  - Header with patient scenario
  - Scrollable message area
  - Fixed input at bottom
  - Feedback mode replaces chat when triggered

---

### E. Animations

**Minimal, purposeful animations only**:
- Card hover: Smooth elevation change (transition-shadow duration-200)
- Message appearance: Gentle fade-in (opacity transition)
- Button interactions: Standard hover/active states (built-in)
- No page transitions, no scroll animations, no loading spinners beyond basic states

---

### F. Accessibility & Interaction

- All interactive elements have min-height of 44px (touch targets)
- Form inputs with clear labels and focus states
- Focus indicators: ring-2 ring-offset-2 on focus
- Keyboard navigation fully supported
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for icon-only buttons
- High contrast ratios for medical data readability

---

## Images

**No hero images required** - This is a professional medical education tool where clarity and efficiency take precedence over visual appeal. The application's credibility comes from its functionality and clear information architecture, not imagery.

**Icon Library**: Heroicons (outline variant) via CDN for UI elements, tips, and feedback categories.