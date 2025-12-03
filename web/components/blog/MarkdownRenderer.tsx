import ReactMarkdown from 'react-markdown'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return <ReactMarkdown remarkPlugins={[remarkGfm, remarkEmoji]}>{content}</ReactMarkdown>
}
