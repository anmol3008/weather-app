// src/components/ThemeToggle.jsx
export default function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {darkMode ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
