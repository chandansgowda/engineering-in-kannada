import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Lazily loaded so react-markdown only ships with blog posts and notes. */
export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const external = href?.startsWith("http");
          return (
            <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {children}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
