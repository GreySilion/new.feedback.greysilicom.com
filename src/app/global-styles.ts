// This file contains global styles that are applied to the entire application
// It's used to avoid using styled-jsx in the root layout

export const globalStyles = `
  :root {
    --primary: 59 130 246; /* blue-500 */
    --primary-hover: 37 99 235; /* blue-600 */
    --primary-light: 239 246 255; /* blue-50 */
    --secondary: 100 116 139; /* slate-500 */
    --accent: 14 165 233; /* sky-500 */
    --background: 255 255 255; /* white */
    --foreground: 30 41 59; /* slate-800 */
    --muted: 241 245 249; /* slate-100 */
    --border: 226 232 240; /* slate-200 */
  }

  * {
    border-color: rgb(var(--border));
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
    height: 100%;
  }

  body {
    color: rgb(var(--foreground));
    background: rgb(var(--background));
    font-family: var(--font-inter, Inter), system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
