# Product

## Register

product

## Users

Two audiences in roughly equal measure: internal Nestor engineers/QA verifying that the right
asset render shows up per platform (android, ios, web, generic), and external clients or
stakeholders viewing the same gallery to evaluate Nestor's delivery network. Both groups need to
trust what they're looking at without reading documentation first.

## Product Purpose

A working gallery over Nestor's Asset Delivery Network (ADN) that does two jobs equally: lets
someone spot-check that an asset renders correctly across platforms, and lets them compare load
performance between ADN v1 and ADN delta v2 to judge which service is faster. Success looks like
a viewer trusting the gallery enough to make a platform or service decision from it directly,
without needing to cross-check elsewhere.

## Brand Personality

Premium and editorial. Confident, considered, gallery-grade rather than dashboard-grade: warm
dark (and light) surfaces, an editorial display typeface for the title, generous whitespace, real
interactive states. The tool should feel like a curated archive, not a generic admin panel, even
though it serves a QA/comparison workflow.

## Anti-references

Explicitly not a generic SaaS dashboard: no blue/purple gradient admin-panel aesthetic, no
identical card grids, no AI-default cream/beige body background, no gradient text, no tiny
uppercase tracked eyebrows scattered across every section.

## Design Principles

- Editorial confidence over dashboard convention: a tool can still feel curated.
- Real data, real states: every interactive surface (search, filters, speed test, lightbox) shows
  true loading/empty/error states, not placeholders.
- One accent, used deliberately, carries hierarchy instead of color noise.
- Motion and texture are purposeful (hover reveals, shimmer skeletons, grain) and never decorative
  filler.
- Light and dark are both first-class, not a dark theme with a light theme bolted on.

## Accessibility & Inclusion

No special requirements beyond a baseline WCAG AA bar: sufficient text contrast, visible focus
states, and `prefers-reduced-motion` support, already partly in place and worth keeping as the
default rather than expanding further.
