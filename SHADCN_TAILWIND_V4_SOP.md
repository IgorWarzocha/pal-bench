# Standard Operating Procedure: Initializing Shadcn UI with Tailwind v4 (Vite)

This protocol defines the division of labor between the **Agent** (AI) and the **User** (Human) when initializing a project.

## Phase 1: Preparation (Agent)

**[AGENT ACTION]**
Before the user runs any commands, the Agent must prepare the environment to prevent CLI failures.

1.  **Fix TypeScript Aliases:**
    The shadcn CLI fails if it can't find paths in the root `tsconfig.json`. The Agent must check and update `tsconfig.json` to explicitly include the `baseUrl` and `paths`, even if they exist in `tsconfig.app.json`.

    ```json
    // tsconfig.json additions
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": { "@/*": ["./src/*"] }
      }
    }
    ```

2.  **Verify Tailwind v4 Install:**
    The Agent checks `package.json` for `tailwindcss` (v4+) and `@tailwindcss/vite`.

## Phase 2: Initialization (User)

**[USER ACTION]**
The User must run these commands interactively in the terminal. The Agent cannot perform these reliably due to interactive prompts.

1.  **Run Init:**

    ```bash
    npx shadcn@latest init
    ```

    - **Style:** New York
    - **Base Color:** Neutral/Zinc
    - **CSS Variables:** Yes (Auto-selected for v4)

2.  **Install Base Components:**

    ```bash
    npx shadcn@latest add
    ```

    - Select `All` (press `a`, then `Enter`).

3.  **Install Extensions (Optional):**

    ```bash
    npx shadcn@latest add @ai-elements/all
    ```

    - **Important:** When prompted to overwrite files (e.g., `button.tsx`, `tooltip.tsx`), answer **NO** (`n`).

## Phase 3: Cleanup & Compliance (Agent)

**[AGENT ACTION]**
After the user completes the installation, the Agent must sanitize the code to ensure strict Tailwind v4 compliance. The CLI often generates hybrid v3/v4 code that needs fixing.

1.  **Sanitize `src/index.css`:**
    The Agent must rewrite this file to ensure:
    - Legacy `@media` preferences are removed.
    - `tailwindcss-animate` plugin is replaced/complemented by `@import "tw-animate-css"`.
    - Variables are correctly scoped in `@theme inline`.
    - Colors use `oklch` syntax.

2.  **Verify `vite.config.ts`:**
    Ensure `@tailwindcss/vite` is present in the plugins array.

3.  **Verify `package.json`:**
    Ensure `tw-animate-css` is installed if the CSS imports it.

## Summary Checklist

| Step | Action                          | Owner     |
| :--- | :------------------------------ | :-------- |
| 1    | Add paths to `tsconfig.json`    | **Agent** |
| 2    | `npx shadcn@latest init`        | **User**  |
| 3    | `npx shadcn@latest add`         | **User**  |
| 4    | Clean up `index.css` (v4 fixes) | **Agent** |
