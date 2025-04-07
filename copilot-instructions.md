# Instructions
- always update copilot-instructions.md when you are done with a task. 
- Always run `npm run build` and `npm test` as a last step to ensure the solution builds successfully and all tests pass.

# Commands
- Use `git commit -m "message"` for committing changes.
- '-reason' when I type this command I want you to reason deeper but no code changes
- '-steps'  when I type this command I want you to create a list of things you want to do. stuff you already done add a green check infront of the step. steps that are ongoing should be marked with a icon of a pen

# Lessons Learned
- Always write clear and concise commit messages.
- Regularly update dependencies to avoid security vulnerabilities.
- Write tests for new features to ensure reliability.
- Avoid moving backend logic into the frontend's `src/` directory to maintain separation of concerns.
- Use a truly shared directory for logic that needs to be accessed by both frontend and backend.

# Scratchpad
- Experiment with new libraries and frameworks here.
- Test snippets of code before integrating them into the main project.
- Use this space for brainstorming and prototyping ideas.
- Debugging `isValidPlacement` runtime error in `Grid.js`.
- Verify if `isValidPlacement` is properly imported and initialized.
- Add debugging logs to check the state of `isValidPlacement` during runtime.
- Ensure `isValidPlacement` is defined before it is used in `Grid.js`.
- Check for potential circular dependencies between `Grid.js` and `gameEngine.js`.