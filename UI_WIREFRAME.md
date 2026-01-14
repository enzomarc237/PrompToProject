# UI Wireframe for Iterative Generation

```
+-----------------------------------------------------------------------------------+
|                                Prompt-to-Project                                  |
+-----------------------------------------------------------------------------------+
| [User: Jane Doe]         [New Project]   [Project History]   [Logout]             |
+-----------------------------------------------------------------------------------+
| Project: My React App                     [Extend Project ▼]                      |
|-----------------------------------------------------------------------------------|
| [Prompt: ____________________________________________] [Extend]                   |
|-----------------------------------------------------------------------------------|
| Project Files:                                                                   |
|                                                                                   |
|   src/                                                                           |
|   ├── App.js         [View] [Refine] [Diff]                                       |
|   ├── index.js       [View] [Refine]                                              |
|   └── components/                                                                |
|        ├── TodoList.js   [View] [Refine] [Diff]                                   |
|        └── Header.js     [View] [Refine]                                          |
|                                                                                   |
|   public/                                                                        |
|   └── index.html     [View] [Refine]                                              |
|                                                                                   |
| [Add File] [Add Folder]                                                           |
|-----------------------------------------------------------------------------------|
| [Download ZIP] [Share] [Undo] [Redo] [Show Version History]                       |
+-----------------------------------------------------------------------------------+

[Refine Modal]
-------------------------------------------------------------------------------------
| Refine: src/components/TodoList.js                                                |
|                                                                                   |
| Current Content:                                                                  |
| // ... (code preview, scrollable)                                                 |
|                                                                                   |
| Prompt: [Add drag-and-drop support to this component.]                            |
|                                                                                   |
| [Show AI Suggestions ▼]                                                           |
|                                                                                   |
| [Submit] [Cancel]                                                                 |
-------------------------------------------------------------------------------------

[Extend Project Modal]
-------------------------------------------------------------------------------------
| Extend Project:                                                                   |
|                                                                                   |
| Current Structure:                                                                |
| - src/ (expandable tree)                                                          |
| - public/                                                                         |
|                                                                                   |
| Prompt: [Add a settings page with theme toggle.]                                  |
|                                                                                   |
| [Show AI Suggestions ▼]                                                           |
|                                                                                   |
| [Submit] [Cancel]                                                                 |
-------------------------------------------------------------------------------------

[Diff Modal]
-------------------------------------------------------------------------------------
| Diff: src/components/TodoList.js                                                  |
|                                                                                   |
| - (old code, highlighted in red)                                                  |
| + (new code, highlighted in green)                                                |
|                                                                                   |
| [Accept Changes] [Reject]                                                         |
-------------------------------------------------------------------------------------

[Version History Modal]
-------------------------------------------------------------------------------------
| Version History:                                                                  |
|                                                                                   |
| [v1] Initial Generation   [View] [Restore]                                        |
| [v2] Refined TodoList.js  [View] [Restore]                                        |
| [v3] Added settings page  [View] [Restore]                                        |
|                                                                                   |
| [Close]                                                                           |
-------------------------------------------------------------------------------------

[Loading Spinner]  [Toast: “TodoList.js updated successfully!”]
```

---

This wireframe illustrates the main project view, modals for refining/extending, diffing, and version history, as well as global actions and feedback elements.
