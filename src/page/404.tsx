import { Link } from 'react-router'
import { FiArrowUpRight } from 'react-icons/fi'
import Silk from '../Components/Silk'
import FuzzyText from '../Components/fuzzyText'

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#171615] px-6 py-16 text-[#f5f2ec]">
      <div className="absolute inset-0 z-0">
        <Silk
          color="#8A6A3B"
          sheenColor="#E5D5B8"
          speed={4}
          scale={1.1}
          rotation={0}
          sheen={0.48}
          depth={0.58}
          glow={0.28}
          noiseIntensity={0.8}
          mouseInteraction
          clickRipple
          intro
          ripple={1}
          wave={1}
          variation={0}
          interactionStrength={1}
          fade={0}
          lightMode={false}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(90deg,rgba(17,16,15,0.8),rgba(17,16,15,0.24),rgba(17,16,15,0.72))]" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <p className="font-jost text-xs uppercase tracking-[0.4em] text-[#d4b986]">A little off the runway</p>
        <div className="mt-5 flex justify-center">
          <FuzzyText
            fontSize="clamp(8rem, 32vw, 22rem)"
            fontWeight={300}
            fontFamily="Jost, sans-serif"
            color="#f5f2ec"
            baseIntensity={0.12}
            hoverIntensity={0.45}
            fuzzRange={24}
            direction="horizontal"
            enableHover
            trigger="hover"
            intro
            className="max-w-full"
          >
            404
          </FuzzyText>
        </div>
        <div className="mx-auto mt-10 max-w-xl">
          <h2 className="font-jost text-2xl font-light sm:text-3xl">This page missed its fitting.</h2>
          <p className="mt-3 font-jost text-sm leading-relaxed text-white/70 sm:text-base">
            The link may have changed, or this look is no longer on the rack. Let’s find you something else.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="btn btn-outline rounded-none border-white/40 px-6 font-jost uppercase tracking-[0.15em] text-white hover:border-[#d4b986] hover:bg-[#d4b986] hover:text-[#171615]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="btn rounded-none border-[#d4b986] bg-[#d4b986] px-6 font-jost uppercase tracking-[0.15em] text-[#171615] hover:border-[#e5d5b8] hover:bg-[#e5d5b8]"
          >
            Explore the shop
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}