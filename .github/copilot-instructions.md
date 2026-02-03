## Front-end Development Strategy

- **Environment Discovery**: Before running any build/dev command, run `cat package.json | head -20` to check the "type" field, "scripts", and key dependencies.
- **Holistic Linting**: When fixing a lint error, first run `npm run lint` (or equivalent) to get the full list of issues. Fix all instances of the same error type in one pass.
- **Port Management**: Before starting a dev server, use `lsof -i :<port>` to check if the port is in use. Only run `npm run dev` or equivalent once per workspace.
- **Build Debugging**: When debugging build tool errors, check the installed version (`npm ls <package>`) and consult the tool's migration guide if the error seems version-related.
- **Front-end Designing Skill**: Always check the front-end design skill when the task is front-end related.

## Browser Usage

- **Explicit Cleanup**: Every `browser_subagent` task MUST include the instruction: "Close all tabs you opened before returning."
- **Port Verification**: Always check the config file (webpack.config, vite.config, etc.) to confirm the port used for the dev server before attempting to open a page. If there's an api used, try `vercel dev` first and don't use `npm run dev` directly if possible.
- **Efficient Debugging**: When using the browser to debug UI issues, prioritize using "Inspect Element" style tools (if available to the subagent) over simple screenshots to find CSS/layout conflicts.

## Planing

When Planning, always ask questions beforehand for the details if the prompt from the user wasn't clear enough.
