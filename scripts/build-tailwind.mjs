import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import fs from "fs";
import path from "path";

const root = process.cwd();

async function main() {
  const compiler = await compile('@import "tailwindcss";', {
    from: path.join(root, "app/globals.css"),
    base: root,
    shouldRewriteUrls: true,
    onDependency: () => {}
  });

  const scanner = new Scanner({
    sources: [
      { base: root, pattern: "app/**/*.{ts,tsx,js,jsx}", negated: false },
      { base: root, pattern: "components/**/*.{ts,tsx,js,jsx}", negated: false }
    ]
  });

  const candidates = new Set();
  for (const c of scanner.scan()) {
    candidates.add(c);
  }

  // Pre-seed common utilities to ensure rich styling
  const common = [
    "flex", "inline-flex", "grid", "hidden", "block", "inline-block",
    "flex-col", "flex-row", "flex-1", "flex-wrap", "flex-shrink-0", "flex-grow",
    "items-center", "items-start", "items-end", "items-stretch",
    "justify-center", "justify-between", "justify-start", "justify-end",
    "gap-1", "gap-1.5", "gap-2", "gap-2.5", "gap-3", "gap-4", "gap-5", "gap-6", "gap-8",
    "p-1", "p-1.5", "p-2", "p-2.5", "p-3", "p-4", "p-5", "p-6", "p-8",
    "px-1", "px-1.5", "px-2", "px-2.5", "px-3", "px-3.5", "px-4", "px-5", "px-6",
    "py-1", "py-1.5", "py-2", "py-2.5", "py-3", "py-3.5", "py-4", "py-6",
    "pt-2", "pb-2", "pl-2", "pr-2", "pt-4", "pb-4", "pl-4", "pr-4",
    "m-0", "m-auto", "mx-auto", "my-auto", "mt-1", "mt-2", "mt-3", "mt-4", "mt-6", "mb-1", "mb-2", "mb-4",
    "w-full", "w-auto", "w-4", "w-5", "w-6", "w-8", "w-10", "w-12", "w-16", "w-64", "w-72", "w-80", "w-96",
    "h-full", "h-screen", "h-4", "h-5", "h-6", "h-8", "h-10", "h-12", "h-16",
    "min-h-0", "min-h-full", "min-h-screen", "min-w-0", "max-w-xs", "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-3xl", "max-w-4xl", "max-w-5xl", "max-w-6xl", "max-w-full",
    "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl",
    "font-normal", "font-medium", "font-semibold", "font-bold", "font-mono",
    "text-zinc-100", "text-zinc-200", "text-zinc-300", "text-zinc-400", "text-zinc-500", "text-zinc-600", "text-white", "text-black",
    "text-blue-400", "text-blue-500", "text-emerald-400", "text-emerald-500", "text-amber-400", "text-amber-500", "text-red-400", "text-red-500", "text-purple-400", "text-purple-500",
    "bg-zinc-950", "bg-zinc-900", "bg-zinc-800", "bg-zinc-700", "bg-zinc-100", "bg-white", "bg-black", "bg-transparent",
    "bg-blue-600", "bg-blue-500", "bg-blue-500/10", "bg-blue-500/20", "bg-emerald-500/10", "bg-emerald-500/20", "bg-amber-500/10", "bg-red-500/10", "bg-red-500/20",
    "border", "border-t", "border-b", "border-l", "border-r", "border-zinc-800", "border-zinc-700", "border-zinc-600", "border-zinc-900",
    "border-blue-500", "border-red-500", "border-emerald-500", "border-transparent",
    "rounded", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full",
    "shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl", "shadow-none",
    "overflow-hidden", "overflow-y-auto", "overflow-x-auto", "overflow-y-scroll",
    "relative", "absolute", "fixed", "sticky", "top-0", "bottom-0", "left-0", "right-0", "inset-0", "z-10", "z-20", "z-30", "z-40", "z-50",
    "transition-all", "transition-colors", "transition-opacity", "transition-transform", "duration-150", "duration-200", "duration-300",
    "hover:bg-zinc-800", "hover:bg-zinc-700", "hover:bg-zinc-900", "hover:text-white", "hover:text-zinc-200", "hover:border-zinc-600",
    "hover:bg-blue-700", "hover:bg-blue-600", "active:scale-95", "focus:outline-none", "focus:ring-2", "focus:ring-blue-500", "focus:border-blue-500",
    "disabled:opacity-50", "disabled:cursor-not-allowed", "cursor-pointer", "select-none", "resize-none", "whitespace-pre-wrap", "break-words"
  ];
  for (const item of common) {
    candidates.add(item);
  }

  const generated = compiler.build([...candidates]);
  
  // Custom styles for code highlighting, badges, and layout
  const custom = `
/* Custom LLM Playground Styles */
pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-pulse-subtle {
  animation: pulse-subtle 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cursor-blink {
  display: inline-block;
  width: 7px;
  height: 16px;
  background-color: #3b82f6;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.8s infinite;
}

/* Range input styling */
input[type="range"] {
  accent-color: #3b82f6;
}
`;

  const fullCss = generated + "\n" + custom;
  fs.writeFileSync(path.join(root, "app/globals.css"), fullCss);
  console.log("Successfully generated app/globals.css (bytes: " + fullCss.length + ", classes: " + candidates.size + ")");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
