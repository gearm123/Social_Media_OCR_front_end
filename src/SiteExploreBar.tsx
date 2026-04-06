/**
 * Compact navigation below the home drop zone — How to, Guides, FAQ (Contact / Feedback in the top bar).
 */
export default function SiteExploreBar() {
  return (
    <nav className="site-explore-bar" aria-label="More pages">
      <div className="site-explore-bar__track">
        <span className="site-explore-bar__eyebrow">Explore</span>
        <div className="site-explore-bar__chips">
          <a className="site-explore-bar__chip site-explore-bar__chip--accent" href="/how-to">
            How to
          </a>
          <a className="site-explore-bar__chip" href="/uses">
            Guides
          </a>
          <a className="site-explore-bar__chip" href="/faq">
            FAQ
          </a>
        </div>
      </div>
    </nav>
  )
}
