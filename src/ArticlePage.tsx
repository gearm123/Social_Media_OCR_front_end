import type { ArticleBlock, SeoArticle } from './articles'
import { BLOG_HUB_PATH } from './articles'

type Props = {
  article: SeoArticle
}

function BlockView({ block }: { block: ArticleBlock }) {
  if (block.type === 'callout') {
    return (
      <p className="seo-article__callout">
        <a className="support-page__mailto intent-landing__cta seo-article__callout-link" href={block.href}>
          {block.label}
        </a>
        {block.text ? <span className="seo-article__callout-text">{block.text}</span> : null}
      </p>
    )
  }
  if (block.type === 'table') {
    return (
      <section className="seo-article__section">
        {block.heading ? <h2 className="intent-landing__h2">{block.heading}</h2> : null}
        <div className="seo-article__table-wrap">
          <table className="seo-article__table">
            <caption className="seo-article__caption">{block.caption}</caption>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={cell} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={`${row[0]}-${i}`}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }
  return (
    <section className="seo-article__section">
      <h2 className="intent-landing__h2">{block.heading}</h2>
      {block.paragraphs.map((p) => (
        <p className="support-page__lead intent-landing__more" key={p.slice(0, 48)}>
          {p}
        </p>
      ))}
      {block.bullets && block.bullets.length > 0 ? (
        <ul className="intent-landing__tips">
          {block.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default function ArticlePage({ article }: Props) {
  return (
    <div className="support-page seo-article">
      <header className="support-page__header">
        <a className="support-page__back" href={BLOG_HUB_PATH}>
          ← All articles
        </a>
      </header>
      <main className="support-page__main">
        <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
          <ol className="seo-breadcrumbs__list">
            <li className="seo-breadcrumbs__item">
              <a href="/">Home</a>
            </li>
            <li className="seo-breadcrumbs__item">
              <a href={BLOG_HUB_PATH}>Blog</a>
            </li>
            <li className="seo-breadcrumbs__item seo-breadcrumbs__item--current" aria-current="page">
              {article.h1}
            </li>
          </ol>
        </nav>
        <h1 className="support-page__title">{article.h1}</h1>
        <p className="support-page__lead">{article.lead}</p>

        {article.blocks.map((block, i) => (
          <BlockView block={block} key={i} />
        ))}

        <p className="intent-landing__cta-wrap">
          <a className="support-page__mailto intent-landing__cta" href={article.cta.href}>
            {article.cta.label}
          </a>
          {article.cta.text ? <span className="seo-article__cta-note">{article.cta.text}</span> : null}
        </p>

        <nav className="intent-landing__related" aria-label="Related translation guides">
          <h2 className="intent-landing__h2">Related translation guides</h2>
          <ul className="intent-landing__related-list">
            {article.related.map((item) => (
              <li key={item.path}>
                <a href={item.path}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href={BLOG_HUB_PATH}>All articles</a>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  )
}
