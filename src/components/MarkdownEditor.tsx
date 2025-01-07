import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import SplitPane from "react-split-pane";
import { toast } from "sonner";

const initialMarkdown = `# Welcome to the Markdown Editor!

## Features
- Live preview
- Syntax highlighting
- Split pane view
- Clean design

Try editing this text to see the live preview!

\`\`\`javascript
// Code blocks are supported too!
function hello() {
  console.log("Hello, world!");
}
\`\`\`
`;

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-semibold">Markdown Editor</h1>
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Copy Content
        </button>
      </div>
      <SplitPane
        split="vertical"
        minSize={200}
        defaultSize="50%"
        style={{ position: "relative" }}
      >
        <div className="h-[calc(100vh-73px)] bg-muted/30">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            placeholder="Enter markdown here..."
          />
        </div>
        <div className="h-[calc(100vh-73px)] overflow-auto bg-background">
          <div className="p-4 prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </SplitPane>
    </div>
  );
};

export default MarkdownEditor;