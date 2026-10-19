import { useEffect, useRef } from 'react'
import { FiClock, FiInstagram, FiMail, FiMapPin, FiMessageCircle, FiPhone, FiX } from 'react-icons/fi'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import siteData from '../../Data.json'

type ContactMenuProps = {
  isOpen: boolean
  onClose: () => void
}

const CONTACT = siteData.site.contact

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address.join(', '))}`

const rowClass = 'contact-in group flex items-start gap-4 border-b border-base-300 py-5 font-jost'
const labelClass = 'text-xs uppercase tracking-widest text-base-content/60'
const valueClass = 'mt-1 block text-lg font-light transition-colors duration-300 group-hover:text-accent'

export default function ContactMenu({ isOpen, onClose }: ContactMenuProps) {
  const drawer = useRef<HTMLDivElement>(null)

  // Escape closes the menu
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Each row fades up one after another every time the menu opens
  useGSAP(
    () => {
      if (!isOpen) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.fromTo(
        '.contact-in',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07, delay: 0.25 }
      )
    },
    { scope: drawer, dependencies: [isOpen] }
  )

  return (
    <div
      className={`fixed inset-0 z-100 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div
        ref={drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Contact us"
        className={`fixed inset-y-0 left-0 z-50 w-120 max-w-[90vw] overflow-y-auto bg-base-100 text-base-content transition-[translate,visibility,background-color] duration-300 ease-out ${
          isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="p-4">
          <button
            type="button"
            aria-label="Close contact menu"
            onClick={onClose}
            className="close-menu-button group inline-flex h-10 cursor-pointer items-center justify-center rounded-full px-2.5 transition duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <FiX className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="max-w-0 font-jost overflow-hidden whitespace-nowrap text-lg font-bold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100">
              close
            </span>
          </button>
        </div>

        <div className="px-8 pb-12 pt-4">
          <h2 className="contact-in font-jost text-3xl font-light">Contact us</h2>
          <p className="contact-in mt-3 font-jost font-light text-base-content/70">
            {CONTACT.description}
          </p>

          <div className="mt-8 border-t border-base-300">
            <a href={CONTACT.whatsapp.href} target="_blank" rel="noreferrer" className={rowClass}>
              <FiMessageCircle className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className={labelClass}>WhatsApp</span>
                <span className={valueClass}>{CONTACT.whatsapp.label}</span>
              </span>
            </a>

            <a href={CONTACT.phone.href} className={rowClass}>
              <FiPhone className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className={labelClass}>Phone</span>
                <span className={valueClass}>{CONTACT.phone.label}</span>
              </span>
            </a>

            <a href={CONTACT.email.href} className={rowClass}>
              <FiMail className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className={labelClass}>Email</span>
                <span className={valueClass}>{CONTACT.email.label}</span>
              </span>
            </a>

            <a href={CONTACT.instagram.href} target="_blank" rel="noreferrer" className={rowClass}>
              <FiInstagram className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className={labelClass}>Instagram</span>
                <span className={valueClass}>{CONTACT.instagram.label}</span>
              </span>
            </a>

            <a href={mapsHref} target="_blank" rel="noreferrer" className={rowClass}>
              <FiMapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className={labelClass}>Visit us</span>
                <span className={valueClass}>
                  {CONTACT.address.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </span>
              </span>
            </a>

            <div className="contact-in flex items-start gap-4 py-5 font-jost">
              <FiClock className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="w-full">
                <span className={labelClass}>Opening hours</span>
                <dl className="mt-2 flex flex-col gap-2 text-base font-light">
                  {CONTACT.hours.map(([day, time]) => (
                    <div key={day} className="flex justify-between gap-4">
                      <dt>{day}</dt>
                      <dd className="text-base-content/70">{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}