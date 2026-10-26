# Writing rules

Shared by the Writer and Compliance agents. The validator enforces the banned-phrase list; these rules cover the rest.

## Audience and voice

US shoppers who want to buy grass-fed meat or dairy and don't know the jargon. Plain verbs, short sentences, sentence-case headings, second person ("you"). Explain every term the first time you use it. Practical over persuasive: the reader should finish knowing what to do next. Never use em dashes; use commas, colons, parentheses or separate sentences.

## Facts

- Every number, rule, date or factual claim must come from a source you opened, and that source goes in the frontmatter `sources` list. Prefer primary sources: USDA, FSIS, certifier standards, university extension services, state agencies, peer-reviewed papers.
- Write in your own words. Quote at most one short phrase (under 15 words) from any source.
- Prices vary by region and year: give ranges, name the source and year, and tell readers to confirm with the farm.
- If sources disagree, say so.

## Claims you must not make

- Health or disease outcomes: lowers cholesterol, heart-healthy, anti-inflammatory, weight loss, prevents or fights any disease, boosts immunity.
- "High in" or "rich in" omega-3 for beef or dairy. You may report measured omega-3 differences with a citation, but always give the absolute amounts and note that they are small compared with fish such as salmon.
- Unqualified environmental claims: sustainable, climate-friendly, eco-friendly, better for the planet. Describe a specific practice and attribute it instead.
- Any claim that the site tested, tasted, cooked, ordered or bought a product. Comparisons are based on published information only.
- Calling a farm or product certified without evidence, or calling grain-finished products grass-fed.
- Legal advice. For raw milk or herdshare content, state each state's status with a dated citation and include: "This is a summary, not legal advice. Laws change; check with your state agriculture department."

## Format

File: `src/content/drafts/{slug}.md` (the Writer) or `src/content/articles/{slug}.md` (once approved).

```yaml
---
title: "Under 90 characters, plain and specific"
description: "50 to 170 characters that say what the reader will learn."
kind: guide        # guide | review | compare | best
published: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - title: "Source name: page title"
    url: "https://..."
---
```

Body in Markdown: start with a two or three sentence answer to the reader's question (no heading), then `##` sections. 1,200 to 2,000 words. Use a table when comparing three or more things. Link to `/farms/` where a reader would want to find a farm, `/certifications/` when labels come up, and other guides at `/guides/{slug}/` only if the file exists in `src/content/articles/`. No affiliate or tracking links. Don't add a sources section in the body; the page renders the frontmatter list.

## Lead image (optional)

A guide may have one stock photo at the top. Use only Unsplash or Pexels photos (both free for commercial use). Add to the frontmatter:

```yaml
image:
  src: "https://images.unsplash.com/photo-...?w=1200&q=80"
  alt: "What the photo shows, in plain words"
  credit: "Photographer name on Unsplash"
  credit_url: "https://unsplash.com/photos/..."
```

The photo must match the article honestly (no misleading scenes, no identifiable brands or people's faces). Never use photos from farm websites, news sites or image search results.

## Before finishing

Run `node scripts/validate.mjs path/to/your-file.md` from the repo root and fix every error and warning.
