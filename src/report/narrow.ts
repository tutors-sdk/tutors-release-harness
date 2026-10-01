/**
 * A phone never scrolls the page sideways (since 1.20.5): under 640px a table scrolls inside its own box, and a long
 * name in a sentence (a glance line, a reason, a claim scope) breaks where it must. In report.html and in the lead
 * (`LEAD_CSS` in lead.ts), so a kept report rendered by an older harness gets it too when it is kept.
 */
export const NARROW_CSS = `@media (max-width:640px){table{display:block;overflow-x:auto;max-width:100%}p,li,dd,summary,h1,h2,h3,h4{overflow-wrap:anywhere}}`;
