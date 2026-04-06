/**
 * Compact navigation below the home drop zone — Guides + FAQ (Contact / Feedback stay in the top bar).
 */
export default function SiteExploreBar() {
  return (
    <nav className="site-explore-bar" aria-label="More pages">
      <div className="site-explore-bar__track">
        <span className="site-explore-bar__eyebrow">Explore</span>
        <div className="site-explore-bar__chips">
          <a className="site-explore-bar__chip" href="/uses">
            Guides
          </a>
          <a className="site-explore-bar__chip site-explore-bar__chip--accent" href="/faq">
            FAQ
          </a>
        </div>
      </div>
    </nav>
  )
}
