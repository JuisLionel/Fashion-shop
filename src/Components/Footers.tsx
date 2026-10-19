import { Link } from 'react-router'

import siteData from '../../Data.json'

const CATEGORIES = [...new Set(siteData.products.map((p) => p.category))].slice(0, 5)
const CURRENT_YEAR = new Date().getFullYear()

export default function Footers() {
  return (
    <>
      <footer className="border-t border-base-300 bg-base-200 text-base-content transition-colors duration-300">
        <div className="mx-auto grid max-w-360 grid-cols-2 gap-x-8 gap-y-10 px-6 py-12 md:grid-cols-4 md:px-12 md:py-16">
          <div className="col-span-2 max-w-xl md:col-span-2">
            <Link to="/" className="mb-5 inline-flex items-center gap-3 font-jost text-2xl font-semibold">
              <img src="/icons.svg" alt="" className="h-12 w-12 rounded-full object-contain" />
              <span>{siteData.site.brand.name}</span>
            </Link>
            <p className="font-jost text-sm font-light leading-relaxed text-base-content/70">
              {siteData.site.brand.description}
            </p>
            <p className="mt-3 font-jost text-xs font-light text-base-content/55">
              {siteData.site.brand.since}
            </p>
          </div>

          <nav aria-label="Shop">
            <h2 className="mb-4 font-jost text-xs font-semibold uppercase tracking-[0.18em] text-base-content/55">Shop</h2>
            <ul className="space-y-3 font-jost text-sm">
              <li><Link to="/shop?sort=new" className="link link-hover no-underline hover:text-accent">New in</Link></li>
              <li><Link to="/shop?sale=true" className="link link-hover no-underline hover:text-accent">Sale</Link></li>
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link to={`/shop?category=${encodeURIComponent(category)}`} className="link link-hover no-underline hover:text-accent">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className="mb-4 font-jost text-xs font-semibold uppercase tracking-[0.18em] text-base-content/55">Help</h2>
            <ul className="space-y-3 font-jost text-sm">
              <li><Link to="/size-guide" className="link link-hover no-underline hover:text-accent">Size guide</Link></li>
              <li><Link to="/shipping" className="link link-hover no-underline hover:text-accent">Shipping</Link></li>
              <li><Link to="/exchanges" className="link link-hover no-underline hover:text-accent">Exchanges</Link></li>
              <li><a href={siteData.site.contact.whatsapp.href} className="link link-hover no-underline hover:text-accent">Contact us</a></li>
            </ul>
          </nav>
        </div>
      </footer>

      <div className="border-t border-base-300 bg-base-200 px-6 py-5 font-jost text-xs font-light text-base-content/60 transition-colors duration-300 md:px-12">
        <div className="mx-auto flex max-w-360 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} {siteData.site.brand.name}. {siteData.site.footer.rights}</p>
          <p>Thoughtfully made for everyday style.</p>
        </div>
      </div>
    </>
  )
}