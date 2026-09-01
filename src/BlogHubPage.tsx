import { BLOG_ARTICLES, COMPARISON_ARTICLES } from './articles'
import { SEO_BLOG_DESCRIPTION } from './seoContent'

export default function BlogHubPage() {
  return (
    <div className="support-page seo-article">
      <header className="support-page__header">
        <a className="support-page__back" href="/">
          ← Back to Translate Chat
        </a>
      </header>
      <main className="support-page__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              Blog
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title">Articles</h1>
        <p className="support-page__lead">{SEO_BLOG_DESCRIPTION}</p>

        <h2 className="intent-landing__h2">How-to</h2>
        <ul className="blog-hub__list">
          {BLOG_ARTICLES.map((article) => (
            <li key={article.path}>
              <a href={article.path}>{article.h1}</a>
              <span className="blog-hub__blurb">{article.lead}</span>
            </li>
          ))}
        </ul>

        <h2 className="intent-landing__h2">Comparisons</h2>
        <ul className="blog-hub__list">
          {COMPARISON_ARTICLES.map((article) => (
            <li key={article.path}>
              <a href={article.path}>{article.h1}</a>
              <span className="blog-hub__blurb">{article.lead}</span>
            </li>
          ))}
        </ul>

        <p className="support-page__note">
          Looking for the translator itself?{' '}
          <a href="/uses">Translation guides</a>
          {' · '}
          <a href="/how-to">How to use Translate Chat</a>
        </p>
      </main>
    </div>
  )
}
