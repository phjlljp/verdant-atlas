import { useLocalStorage } from './useLocalStorage';

/**
 * Dark mode toggle hook backed by localStorage key 'darkMode'.
 * @returns {[boolean, Function]} - [isDark, toggleDarkMode]
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage('darkMode', false);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  return [isDark, toggleDarkMode];
}
