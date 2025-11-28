import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MarkdownContent from './components/MarkdownContent'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAdjacentPages } from './data/docsData'

export default function DocsPage() {
    const { category, page } = useParams()
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const slug = `${category}/${page}`
    const currentPath = `/docs/${slug}`
    const { prev, next } = getAdjacentPages(currentPath)

    useEffect(() => {
        const loadMarkdown = async () => {
            setLoading(true)
            setError(null)

            try {
                // Construct the markdown file path
                const mdPath = `/docs/${slug}.md`
                const response = await fetch(mdPath)

                if (!response.ok) {
                    throw new Error('Documentation page not found')
                }

                const text = await response.text()
                setContent(text)
            } catch (err) {
                setError(err.message)
                setContent('# Page Not Found\n\nThe requested documentation page could not be found.')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            loadMarkdown()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading documentation...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Markdown Content */}
            <MarkdownContent content={content} />

            {/* Navigation Footer */}
            {(prev || next) && (
                <div className="mt-12 pt-8 border-t flex items-center justify-between">
                    {prev ? (
                        <Link
                            to={prev.path}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <div>
                                <div className="text-xs text-muted-foreground">Previous</div>
                                <div className="font-medium">{prev.title}</div>
                            </div>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {next && (
                        <Link
                            to={next.path}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Next</div>
                                <div className="font-medium">{next.title}</div>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
