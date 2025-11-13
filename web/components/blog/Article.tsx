import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

type ArticleProps = {
  title: string
  subtitle?: string
  hero?: { src: string; alt: string; width?: number; height?: number; priority?: boolean }
  children: ReactNode
  backHref?: string
}

export default function BlogArticle({ title, subtitle, hero, children, backHref = '/blog' }: ArticleProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          {hero && (
            <Image
              src={hero.src}
              alt={hero.alt}
              width={hero.width ?? 1200}
              height={hero.height ?? 700}
              priority={hero.priority}
              className="rounded-lg mb-6"
            />
          )}

          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
          {subtitle && <h2 className="text-lg sm:text-xl text-gray-700 mb-6">{subtitle}</h2>}

          {children}
        </article>

        <div className="mt-8 text-center">
          <Link href={backHref} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            ← Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  )
}

