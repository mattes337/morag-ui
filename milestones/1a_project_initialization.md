# Milestone 1A: Project Initialization with Storybook

## Objective
Initialize the Next.js 14 application with all required dependencies, Storybook for component development, and basic project structure for the MoRAG UI platform.

## Context
- **Current State**: Documentation-rich project with no frontend implementation
- **Tech Stack**: Next.js 14.2+, React 18, Tailwind CSS, Radix UI, TypeScript 5, Storybook 8
- **Architecture**: 4-Layer DAG with component-driven development

## Scope
- Initialize Next.js 14 project with TypeScript
- Install and configure Storybook for Next.js
- Install and configure all required dependencies
- Set up project structure following the 4-layer architecture
- Configure Tailwind CSS with custom theme
- Set up Radix UI primitives
- Create basic environment configuration
- Configure ESLint and Prettier
- Set up Storybook with essential addons

## Storybook Configuration
```bash
# Required Storybook packages
@storybook/nextjs
@storybook/react
@storybook/addon-essentials
@storybook/addon-interactions
@storybook/addon-a11y
@storybook/addon-viewport
@chromatic-com/storybook
```

## Project Structure
```
morag-ui-claude/
├── .storybook/            # Storybook configuration
│   ├── main.ts           # Main config
│   ├── preview.tsx       # Global decorators
│   └── manager.ts        # UI customization
├── app/                  # Next.js app router
├── components/           # React components
├── stories/              # Component stories
│   ├── Introduction.mdx # Welcome page
│   └── *.stories.tsx    # Component stories
└── lib/                  # Utilities
```

## Success Criteria
- [ ] Next.js dev server runs without errors
- [ ] Storybook runs on separate port (6006)
- [ ] TypeScript configuration works for both Next.js and Storybook
- [ ] Tailwind CSS styles work in Storybook
- [ ] Radix UI components render in Storybook
- [ ] Basic folder structure matches architecture requirements
- [ ] Environment variables are configured
- [ ] Linting and formatting tools are operational
- [ ] Sample story renders successfully

## Dependencies
- None (first milestone)

## Deliverables
1. Initialized Next.js project with all dependencies
2. Configured Storybook with Next.js integration
3. Basic folder structure following 4-layer architecture
4. Working development server showing default page
5. Working Storybook with sample component story
6. Scripts for concurrent development (Next.js + Storybook)

## Technical Notes
- Use App Router (not Pages Router)
- Configure for client-side rendering initially (simulated backend)
- Set up path aliases for clean imports (@/components, @/lib, etc.)
- Include mock data structure for simulated backend
- Configure Storybook to handle Tailwind CSS and Radix UI
- Add npm scripts:
  - `npm run dev` - Run Next.js
  - `npm run storybook` - Run Storybook
  - `npm run dev:all` - Run both concurrently