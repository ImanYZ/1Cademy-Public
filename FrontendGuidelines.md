# Frontend Guidelines

## Modules

we have 3 modules `notebook` , `instructors` and `public search of 1cademy`

- You need to create types in his respective file:
  - `src/nodeBookTypes.ts` to notebook modules
  - `src/instructorsTypes.ts` to instructors module
  - `src/knowledgeTypes.ts` to public view of 1cademy

## General

- Add styles in `sx` component props, don't add in global.css (we will migrate to MUI)
  - You need to reuse the MUI components
- if you find a component different than MUI components, you need to ask:
  - Can I use a similar MUI component? (design Team will fix the design)
  - Should I create a custom component?
  - Should I override the the MUI component? (this will be reflected in all the application)
- Don't upload PR’s with console.logs
- Don't upload PR’s with unnecessary comments
- Every solution should be tested thinking in side effects
- You need to type everything
- Use simple and intuitive names to functions and variables
- Custom components must be:
  - Configurable: have the required props
  - Testable: easy to simulate environment
  - Consistence: use palette theme
  - Smaller: if is possible split into smaller components
- Utils functions must be pure functions:
  - To reduce complexity
- Don't add global variables in context: (we will refactor to remove context)
  - it can create unnecessary renders
  - if is required, ask to see possible side effects

## Charts

- Should be configurable and reusable to prototype quickly with a mocks
- You need to transform data to use charts without modify chart
- Should be responsive
- Should work with defined themes
- Should has skeleton component
- Show message when doesn't have data
