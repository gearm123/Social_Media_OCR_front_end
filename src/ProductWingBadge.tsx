const PRODUCT_WING_HREF = 'https://productwing.com/product/chatreconstruct'
const PRODUCT_WING_BADGE_SRC = 'https://productwing.com/assets/images/badge.png'
const SUBMIT_MY_SAAS_HREF = 'https://submitmysaas.com'
const SUBMIT_MY_SAAS_BADGE_SRC = 'https://submitmysaas.com/featured-badge.png'

export default function ProductWingBadge() {
  return (
    <p className="product-wing-badge">
      <a target="_blank" rel="noopener noreferrer" href={PRODUCT_WING_HREF}>
        <img src={PRODUCT_WING_BADGE_SRC} alt="Product Wing" height={54} loading="lazy" />
      </a>
      <a target="_blank" rel="noopener noreferrer" href={SUBMIT_MY_SAAS_HREF}>
        <img
          src={SUBMIT_MY_SAAS_BADGE_SRC}
          alt="Featured on SubmitMySaas"
          height={54}
          loading="lazy"
        />
      </a>
    </p>
  )
}
