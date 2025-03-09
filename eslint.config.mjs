import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("eslint:recommended", "airbnb-base", "plugin:prettier/recommended"),
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },

            ecmaVersion: 5,
            sourceType: "module",
        },

        settings: {
            "import/resolver": {
                node: {
                    extensions: [".js", ".mjs"],
                },
            },
        },

        rules: {
            indent: ["error", 2],

            "no-use-before-define": ["error", {
                functions: false,
                classes: true,
            }],

            "linebreak-style": ["error", "unix"],

            "prettier/prettier": ["warn", {
                singleQuote: true,
                trailingComma: "es5",
            }],

            "import/extensions": ["error", "always", {
                ignorePackages: true,
            }],
        },
    },
];