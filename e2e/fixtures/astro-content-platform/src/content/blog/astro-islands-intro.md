---
title: "Introduction to Astro Islands"
description: "Learn how Astro's Islands architecture delivers zero JS by default."
date: "2025-01-10"
author: "Lunx Team"
tags: ["astro", "islands", "performance"]
featured: true
---

# Introduction to Astro Islands

Astro Islands (also known as Component Islands) is a pattern where interactive UI components are isolated in a sea of static HTML.

## How It Works

When you use `client:idle`, `client:load`, or `client:visible`, Astro wraps your component in a special `<astro-island>` custom element.

```jsx
<Counter client:idle />
<SearchBox client:load />
<Chart client:visible />
```

## Benefits

- **Zero JS by default** — static pages ship no JavaScript
- **Selective hydration** — only interactive components load JS
- **Priority-based loading** — `client:idle` defers to browser idle time
