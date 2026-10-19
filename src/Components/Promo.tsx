import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import TextLoop from './TextLoop'
import siteData from '../../Data.json'

export default function Promo() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="relative w-full overflow-hidden border-b p-1 border-black/10 bg-linear-to-r from-[#F9A8AC] via-[#F9D6BF] to-[#A9D6CB] text-black dark:border-white/15">
            <TextLoop
                text={siteData.site.promo.text}
                shape="line"
                speed={45}
                separator="✦"
                uppercase={false}
                fontSize={14}
                fontWeight={700}
                letterSpacing={0.5}
                gradient={['#8F2B1A', '#6B4F25']}
                ribbon={false}
                className="promo-text-loop"
                style={{ height: '36px' }}
            />
            
            <button
                type="button"
                onClick={() => setIsVisible(false)}
                aria-label="Close discount announcement"
                className="close-button absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-base-100 text-base-content transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-content"
            >
                <FiX className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    )
}