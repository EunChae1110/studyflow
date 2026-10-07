"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("studyflow-md text-sm leading-6 text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-6">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className?.includes("language-"));
            if (isBlock) {
              return (
                <code className={cn("font-mono text-[12px]", className)} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[12px]"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg border border-border bg-surface-muted p-3 text-[12px] last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-primary/40 pl-3 text-muted last:mb-0">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          hr: () => <hr className="my-3 border-border" />,
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-surface-muted px-2 py-1 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1 align-top">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
