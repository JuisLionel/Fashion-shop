import { useState } from 'react'
import { FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'
import TextLoop from './TextLoop'
import siteData from '../../Data.json'

type PromoType = 'notice' | 'alert' | 'promo'

const PROMO_STYLES: Record<PromoType, string> = {
    notice: 'border-b border-warning/50 bg-warning/15 text-base-content',
    alert: 'border-b border-error/70 bg-error text-error-content',
    promo: 'border-b border-base-300 bg-base-200 text-base-content',
}

export default function Promo() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    const type: PromoType = siteData.site.promo.type === 'notice' || siteData.site.promo.type === 'alert'
        ? siteData.site.promo.type
        : 'promo'
    const isTextPromo = type === 'promo'

    return (
        <div
            role={type === 'alert' ? 'alert' : 'status'}
            aria-live={type === 'alert' ? 'assertive' : 'polite'}
            className={`relative flex min-h-10 w-full items-center justify-center overflow-hidden px-12 py-1 text-center font-jost text-sm ${PROMO_STYLES[type]}`}
        >
            {isTextPromo ? (
                <TextLoop
                    text={siteData.site.promo.text}
                    shape="line"
                    speed={45}
                    separator="✦"
                    uppercase={false}
                    fontSize={14}
                    fontWeight={700}
                    letterSpacing={0.5}
                    gradient={['#8A6A3B', '#3A4440']}
                    ribbon={false}
                    className="promo-text-loop"
                    style={{ height: '36px' }}
                />
            ) : (
                <p className="flex items-center justify-center gap-2 font-medium leading-relaxed">
                    {type === 'alert'
                        ? <FiAlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        : <FiInfo className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    <span>{siteData.site.promo.text}</span>
                </p>
            )}

            <button
                type="button"
                onClick={() => setIsVisible(false)}
                aria-label={`Close ${type}`}
                className="close-button absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-black/5 text-current transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
                <FiX className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    )
}