# MMUSMANLAB Website — SEO & Organic Traffic Upgrade

## Goal

Improve the existing Next.js portfolio so it can attract organic search traffic while preserving the current visual design and functionality.

Do NOT redesign the website from scratch.

Do NOT remove existing sections.

Do NOT invent fake credentials, clients, statistics, testimonials, awards, employment history, or project results.

The goal is to transform the site from a simple portfolio into:

1. Personal developer portfolio
2. Detailed project case-study site
3. Technical knowledge/content site
4. Future foundation for useful developer tools

---

# Current Stack

* Next.js App Router
* TypeScript
* Tailwind CSS
* React
* Existing `src/app`
* Existing project data in `src/app/lib/data.ts`

Current domain:

https://mmusmanlab.vercel.app

---

# IMPORTANT SEO REQUIREMENTS

## 1. Preserve existing design

Do not replace the current visual system.

Keep:

* existing colors
* typography
* animations
* components
* navbar
* footer
* project cards
* responsive layout
* dark theme

Only make structural/content changes necessary for SEO and content discovery.

---

# 2. Improve global metadata

Update:

`src/app/layout.tsx`

Create stronger global metadata using Next.js Metadata API.

Include:

* title template
* meaningful description
* keywords only where genuinely useful
* authors
* creator
* publisher
* canonical metadata where appropriate
* Open Graph
* Twitter/X metadata
* robots configuration
* favicon/icons if already available

Use:

`https://mmusmanlab.vercel.app`

as metadataBase.

Do not keyword-stuff.

Suggested positioning:

Muhammad M. Usman is a software engineer building web, mobile and full-stack applications with Next.js, React, React Native, Expo, TypeScript and Node.js.

---

# 3. Improve homepage SEO

Update:

`src/app/page.tsx`

The homepage should clearly communicate:

* who Muhammad M. Usman is
* what he builds
* technologies used
* types of problems solved
* major projects
* how visitors can work with/contact him

The H1 should be natural and useful.

Avoid making the H1 just:

"Muhammad M. Usman"

Prefer something semantically meaningful such as:

"Full-Stack Software Engineer Building Web & Mobile Applications"

Keep Muhammad M. Usman's name visible prominently.

Use proper heading hierarchy:

H1
H2
H3

Do not use headings purely for visual styling.

---

# 4. Project pages need unique SEO metadata

Current file:

`src/app/projects/[id]/page.tsx`

It currently uses:

"use client"

Do not force the entire route to be client-side.

Refactor this route so that the route page can use Next.js server-side metadata.

If interactive functionality is required, move only the interactive UI into a separate client component.

Create:

`generateStaticParams()`

using the existing `projects` data.

Create:

`generateMetadata()`

for each project.

Each project must have a unique:

* title
* description
* canonical URL
* Open Graph title
* Open Graph description

Example:

Amtech Shop:

Title:
"Amtech Shop — React Native E-commerce App | Muhammad M. Usman"

Description:
"Case study of Amtech Shop, a cross-platform e-commerce application built with React Native, Expo, Firebase and TypeScript."

Do the equivalent naturally for every project.

---

# 5. Improve project content

Current data source:

`src/app/lib/data.ts`

The existing project descriptions are too short for strong case-study pages.

Extend the Project interface with optional fields such as:

* slug
* overview
* problem
* solution
* features
* architecture
* challenges
* technologies
* outcome
* lessons
* keywords
* year
* role

Do NOT invent information.

Only use information already present in the repository or information explicitly available from the existing project descriptions.

If information is unknown, leave it out rather than making it up.

---

# 6. Make project pages genuine case studies

For each project page, structure content approximately as:

H1 — Project name

Short overview

## Overview

## Problem

Only include if known.

## Solution

Only include factual information available about the project.

## Key Features

Use actual known features.

## Technology Stack

List technologies.

## Architecture / Engineering

Explain only what can be supported by the project information.

## Challenges

Only include known challenges.

## Project Links

Live Demo
Source Code

## Related Projects

Link to other relevant projects.

Do not fill pages with generic paragraphs.

---

# 7. Add About page metadata

Update:

`src/app/about/page.tsx`

Add page-specific metadata.

Title example:

"About Muhammad M. Usman — Software Engineer"

Description should accurately summarize his background and technical interests.

Do not invent employment history or qualifications.

---

# 8. Add Projects page metadata

Update:

`src/app/projects/page.tsx`

Use:

Title:
"Software Projects — Web, Mobile & Full-Stack Applications"

Description:
"Explore web, mobile and full-stack software projects built with technologies including Next.js, React, React Native, Expo, TypeScript and Node.js."

Use natural language.

---

# 9. Add a content/articles system

Create:

`src/app/articles`

Use a simple local content architecture initially.

Do NOT introduce a CMS yet.

Create:

`src/app/articles/page.tsx`

and dynamic:

`src/app/articles/[slug]/page.tsx`

Create a local content/data structure.

Each article should contain:

* slug
* title
* description
* publishedAt
* updatedAt
* category
* tags
* content
* relatedProjects

Create reusable article components.

---

# 10. Initial articles

Create only these first three articles.

Do not create fake technical experiences.

### Article 1

Title:

"How I Built a React Native E-commerce App with Expo and Firebase"

Connect it to:

`amtech-shop`

Discuss only facts available in the project data.

### Article 2

Title:

"Building a Household Budget Tracker with React Native and Expo"

Connect it to:

`leftly`

Discuss only known functionality.

### Article 3

Title:

"Building an Educational Platform with Next.js and TypeScript"

Connect it to:

`praxivon`

Discuss only known functionality.

These should be useful technical case-study articles, not keyword-stuffed SEO pages.

---

# 11. Add article links throughout the site

Create internal links:

Homepage
→ Projects
→ Articles
→ Individual project
→ Related article

Project page
→ Related article
→ Related project

Article
→ Related project
→ Other articles

This should create a strong internal-link graph.

---

# 12. Expand sitemap

Update:

`src/app/sitemap.ts`

Include:

* /
* /about
* /projects
* /contact
* every project URL
* /articles
* every article URL

Use meaningful `lastModified` values.

Do not use `new Date()` for every URL on every build unless there is a genuine reason.

---

# 13. Robots

Review:

`src/app/robots.ts`

Keep public pages crawlable.

Continue blocking:

* `/dashboard/`
* `/private/`

Ensure sitemap URL points to:

https://mmusmanlab.vercel.app/sitemap.xml

---

# 14. Structured data

Add appropriate JSON-LD structured data.

At minimum consider:

Homepage:

`Person`

Website:

`WebSite`

Projects/articles:

`CreativeWork` or appropriate subtype when genuinely applicable.

Do not add fake ratings, reviews, organizations or other structured data that isn't supported by visible page content.

Use JSON-LD safely in Next.js.

---

# 15. Image SEO

Review every `next/image`.

Ensure:

* descriptive alt text
* meaningful filenames where practical
* width/height or fill used correctly
* no generic alt text such as "image"

Project images should describe the actual project.

---

# 16. Avoid generic SEO language

Remove or reduce repetitive phrases such as:

"scalable"

"production-ready"

"modern architecture"

"technical excellence"

"high-performance"

when they aren't supported by specific information.

Replace generic claims with concrete explanations.

Bad:

"Built with modern scalable architecture."

Better:

"The application uses React Native and Expo for the mobile client and Firebase for real-time product data."

Only state what is actually known.

---

# 17. Add a visible Articles/Insights navigation item

Update the Navbar.

Navigation should become approximately:

Home
About
Projects
Articles
Contact

Do not make the navigation overcrowded.

---

# 18. Add related content to the homepage

Add an "Latest Articles" section below the projects or near the lower portion of the homepage.

Show 3 articles.

Each card should contain:

* title
* short description
* date
* category
* link

---

# 19. Add breadcrumbs to project/article pages

Implement accessible breadcrumb navigation.

Example:

Home
→ Projects
→ Amtech Shop

and:

Home
→ Articles
→ How I Built a React Native E-commerce App

Use normal HTML links.

If structured breadcrumb JSON-LD is implemented, ensure it matches visible breadcrumbs.

---

# 20. Performance

Do not sacrifice performance for SEO.

Keep:

* Next/Image
* server rendering where possible
* static generation where appropriate
* minimal client components

Avoid turning the entire application into client components.

---

# 21. IMPORTANT: do not do these things

Do NOT:

* buy backlinks
* generate hundreds of AI articles
* keyword stuff
* create fake reviews
* create fake testimonials
* claim fake clients
* claim fake results
* create doorway pages
* create hundreds of near-identical pages
* add irrelevant keywords
* redesign the entire website
* remove working features

---

# 22. Acceptance criteria

After implementation:

`npm run build`

must succeed.

Verify:

`/robots.txt`

`/sitemap.xml`

`/`

`/about`

`/projects`

`/projects/amtech-shop`

`/projects/leftly`

`/projects/praxivon`

`/projects/technical-systems`

`/articles`

and all article URLs.

Every important page must have:

* unique title
* unique description
* canonical URL
* indexable content
* proper H1
* internal links

Project and article pages should be statically generated where practical.

Do not break the current visual design.

---

# FINAL OUTPUT FROM COPILOT

Before making changes, inspect the existing repository.

Then provide:

1. Files that need modification
2. Files that need creation
3. Problems discovered
4. Proposed implementation
5. Then implement the changes

Do not rewrite unrelated code.
Do not remove existing functionality.
