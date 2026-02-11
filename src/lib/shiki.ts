import { createHighlighter, bundledLanguages, type LanguageInput } from "shiki";

const highlighterPromise = createHighlighter({
  themes: ["one-light", "one-dark-pro"],
  langs: ["text"],
});

const loadedLangs = new Set<string>(["text"]);

export async function highlight(code: string, language: string) {
  const lang = language in bundledLanguages ? language : "text";
  const highlighter = await highlighterPromise;

  if (!loadedLangs.has(lang)) {
    await highlighter.loadLanguage(lang as LanguageInput);
    loadedLangs.add(lang);
  }

  return highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: "one-light",
      dark: "one-dark-pro",
    },
    defaultColor: false,
  });
}
