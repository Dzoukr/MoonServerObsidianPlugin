import builtins from "builtin-modules";
import {defineConfig} from "vite";

const setOutDir = (mode: string) => {
    switch (mode) {
        case "development":
            return "./test-vault/.obsidian/plugins/moon-server-publisher";
        case "production":
            return "build";
    }
};

export default defineConfig(({mode}) => {
    return {
        plugins: [],
        build: {
            lib: {
                entry: "src/main",
                formats: ["cjs"],
            },
            rollupOptions: {
                output: {
                    entryFileNames: "main.js",
                    assetFileNames: "styles.css",
                    // sourcemapBaseUrl: 'file:/// [Local path to plugin src folder] /test-vault/.obsidian/plugins/obsidian-svelte-plugin/'
                },
                external: [
                    "obsidian",
                    "electron",
                    "@codemirror/autocomplete",
                    "@codemirror/collab",
                    "@codemirror/commands",
                    "@codemirror/language",
                    "@codemirror/lint",
                    "@codemirror/search",
                    "@codemirror/state",
                    "@codemirror/view",
                    "@lezer/common",
                    "@lezer/highlight",
                    "@lezer/lr",
                    ...builtins,
                ],
            },
            outDir: setOutDir(mode),
            emptyOutDir: false,
            sourcemap: "inline",
        },
    };
});
