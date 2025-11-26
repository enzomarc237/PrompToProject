# Step-by-Step Guide: Iterative Generation

## 1. UI/UX Enhancements

### a. Add “Refine”/“Regenerate” Actions
- In your project file tree (e.g., in `ResultsDisplay.tsx`), add a button or context menu item labeled “Refine” or “Regenerate” next to each file and folder.
- Add an “Extend Project” prompt box below or above the project tree for project-wide changes.

### b. Prompt Modal
- When a user clicks “Refine,” open a modal dialog with:
  - The current file/folder name
  - A textarea for the user’s new prompt (e.g., “Add error handling to this file”)
  - “Submit” and “Cancel” buttons

## 2. Frontend State & Logic

### a. Track Context
- When “Refine” is clicked, store:
  - The selected file/folder path
  - The current content (for files) or structure (for folders)
- For “Extend Project,” store the entire project structure.

### b. Send Request to AI Service
- Update your `geminiService.ts` to accept:
  - The user’s new prompt
  - The current content/context (file, folder, or project)
  - The target type (file/folder/project)

- Example API call:
  ```ts
  geminiService.refine({
    prompt: userPrompt,
    context: fileContent, // or folder/project JSON
    target: 'file', // or 'folder'/'project'
    path: filePath // for files/folders
  });
  ```

### c. Update Project State
- On AI response:
  - If refining a file: replace the file’s content in the project state.
  - If refining a folder: update all files in that folder as returned by the AI.
  - If extending the project: merge new/updated files into the project tree.

## 3. Backend/AI Service Changes

### a. Update geminiService.ts
- Add a `refine` or `modify` method that:
  - Accepts the prompt, context, target, and path.
  - Constructs a prompt for Gemini like:
    - For files:  
      “Given this file: [file content], and this user request: [prompt], generate an improved version of the file.”
    - For folders/projects:  
      “Given this [folder/project] structure: [JSON], and this user request: [prompt], update accordingly.”
- Send the request to Gemini and return the AI’s response.

### b. Handle Large Contexts
- If the file/folder/project is large, consider sending only the relevant part to the AI to avoid context window issues.

## 4. Project History & Versioning

### a. Save Each Iteration
- After each refinement or extension, save the new project state to PocketBase as a new version or update the existing record with a version history log.

### b. UI for Version History
- Optionally, add a “History” button to let users view and revert to previous versions.

## 5. User Feedback

- Show loading indicators while waiting for the AI.
- Display success or error toasts after each operation.
- Optionally, show a diff view of changes before applying them.

## 6. Testing

- Test refining a single file, a folder, and the whole project.
- Test with large projects and edge cases (e.g., empty files, binary files).
- Test error handling (AI failure, network issues).

## 7. Documentation

- Update your in-app help and README to explain the new iterative generation features.

---

### Example User Flow

1. User generates a project.
2. User clicks “Refine” on `src/App.js`, enters: “Add error boundary.”
3. Modal opens, user submits prompt.
4. AI returns updated `App.js`; UI updates the file.
5. User clicks “Extend Project,” enters: “Add a settings page.”
6. AI returns new/updated files; UI merges them into the project.
7. Each change is saved to project history.

---

## Optional: Advanced Features

- Show a diff before applying AI changes.
- Allow users to undo/redo refinements.
- Support batch refinements (multiple files at once).
