I'm calling this palette **Lifeline**. It keeps the indigo from before and adds the neutrals and status meanings that real ambulance services use.

**Brand and status colors**

| Role | Name | Hex | Text on it | Use |
|---|---|---|---|---|
| primary | Midnight Indigo | `#2F3E9E` | white | Main buttons, links, navbar |
| primary-soft | Dawn Indigo | `#E6E9F8` | indigo | Selected rows, hover backgrounds |
| secondary | Slate | `#64748B` | white | Secondary buttons, offline units |
| success | Vital Green | `#177A4E` | white | Available, completed, valid |
| danger | Beacon Red | `#D92D3A` | white | Critical calls, cancel, errors |
| warning | Amber Flare | `#F5A524` | dark | Delays, low units, urgent |
| info | Dispatch Sky | `#0B73A8` | white | En route, dispatched, notices |

**Neutrals (light theme)**

| Role | Hex |
|---|---|
| background | `#F4F6FA` |
| surface (cards) | `#FFFFFF` |
| border | `#D8DDE6` |
| text | `#1E2A36` |
| muted text | `#4C6272` |

**Dark theme (dispatcher dashboard)**

| Role | Hex |
|---|---|
| background | `#0E1224` |
| surface | `#171C36` |
| border | `#2A3158` |
| text | `#E8EBF5` |
| muted text | `#9AA3C0` |
| primary (lighter) | `#8C9BFF` |
| danger (lighter) | `#FF5A66` |

```css
:root {
  --color-primary: #2F3E9E;
  --color-primary-soft: #E6E9F8;
  --color-secondary: #64748B;
  --color-success: #177A4E;
  --color-danger: #D92D3A;
  --color-warning: #F5A524;
  --color-info: #0B73A8;

  --bg: #F4F6FA;
  --surface: #FFFFFF;
  --border: #D8DDE6;
  --text: #1E2A36;
  --text-muted: #4C6272;

  /* Domain tokens */
  --priority-critical: var(--color-danger);
  --priority-urgent: var(--color-warning);
  --priority-routine: var(--color-info);
  --unit-available: var(--color-success);
  --unit-enroute: var(--color-info);
  --unit-busy: var(--color-warning);
  --unit-offline: var(--color-secondary);
}

:root[data-theme="dark"] {
  --color-primary: #8C9BFF;
  --color-danger: #FF5A66;
  --bg: #0E1224;
  --surface: #171C36;
  --border: #2A3158;
  --text: #E8EBF5;
  --text-muted: #9AA3C0;
}
```

**Why this works**
- **The brand color is distinct from every status color.** Indigo is not blue, red, green or yellow, so a normal button never looks like an alert.
- **Red is only for emergencies.** Because nothing else on screen is red, a critical call stands out.
- **Contrast is better than in my last version.** I darkened success and info slightly, because they were just under the WCAG AA threshold of 4.5:1 for white text. All colored buttons now pass with white text, except amber, which takes dark text.
- **The neutrals do most of the work.** As in the NHS and DispatchHealth examples, most of the screen is neutral, with color reserved for meaning.
- **Never rely on color alone.** Pair each status with an icon and a label, such as "P1 Critical", for colorblind dispatchers.

I can turn this into a swatch preview page or a sample dispatcher dashboard if you want to see it in use.