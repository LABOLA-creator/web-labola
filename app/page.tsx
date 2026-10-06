import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import type {CSSProperties} from 'react'
import ImageTrail from '../reactBits/imageTrail'
import ScrollReveal from '../reactBits/scrollReveal';
import CountUp from '../reactBits/countUp'
import SplitText from "../reactBits/splitText";
import LogoLoop from '../reactBits/logoLoop';
import ScrollStack, { ScrollStackItem } from '../reactBits/scrollStack'

import {ContactFormSection} from '@/components/ContactFormSection'
import {LandingFooter} from '@/components/LandingFooter'
import {LandingHeader} from '@/components/LandingHeader'
import {ServicesAccordion} from '@/components/ServicesAccordion'
import {TextLoop} from '@/reactBits/text-loop'
import {bracketHighlight} from '@/functions/globalFunctions'
import type {BodyBlockProps, PrimaryLinkProps} from '@/interfaces/pageInterfaces'
import {client} from '@/sanity/client'
import {homePageQuery} from '@/sanity/queries/homePageQuery'
import type {
  HomePageData,
  HomePageSection,
  LandingBodySection,
  LandingFormSection,
  LandingHeroSection,
} from '@/sanity/types/homePage'

export const revalidate = 60

export default async function Home() {
  const homeSlug = process.env.NEXT_PUBLIC_HOME_SLUG ?? null
  const homePage = await client.fetch<HomePageData | null>(homePageQuery, {slug: homeSlug})

  if (!homePage) {
    notFound()
  }

  const heroSection = homePage.sections.find(isHeroSection)
  const bodySection = homePage.sections.find(isBodySection)
  const formSection = homePage.sections.find(isFormSection)

  if (!heroSection || !bodySection || !formSection) {
    notFound()
  }
  console.log('Home page data:', { bodySection})

  const overlayOpacity = clampNumber(heroSection.background?.overlayOpacity ?? 0.6, 0, 1)
  const overlayStyle: CSSProperties = {opacity: overlayOpacity}
  const backgroundVideoUrl = heroSection.background?.video?.url
  const backgroundImage = heroSection.background?.image
  const imageTrailItems = (heroSection.imageTrailItems ?? []).map((item) => item.url)
  const tagsRibbonItems = heroSection.tagsRibbon ?? []
  const tagsRibbonText = tagsRibbonItems.length > 0 ? `${tagsRibbonItems.join(' • ')} • ` : ''

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 text-white">
        <div className="absolute inset-0 z-0">
          {backgroundVideoUrl ? (
            <video
              key={backgroundVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover object-center"
            >
              <source src={backgroundVideoUrl} />
            </video>
          ) : backgroundImage?.url ? (
            <Image
              src={backgroundImage.url}
              alt={backgroundImage.alt || heroSection.title}
              fill
              priority
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(109,22,215,0.5),transparent_40%),radial-gradient(circle_at_82%_28%,rgba(231,239,0,0.32),transparent_42%),#070707]" />
          )}
        </div>

        {imageTrailItems.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
            <ImageTrail key={66} items={imageTrailItems} variant={5} />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-20 bg-black" style={overlayStyle} />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(95deg,rgba(160,61,255,0.34)_0%,rgba(0,0,0,0)_46%,rgba(231,239,0,0.22)_100%)]" />

        <div className="relative z-30 mx-auto flex min-h-155 w-full max-w-295 flex-col px-4 pb-16 pt-8 md:px-8 lg:px-10 h-185">
          <LandingHeader header={homePage.header} />

          <div className="mx-auto mt-10 flex max-w-4xl flex-1 flex-col items-center justify-center text-center md:mt-0">
            <h1 className="font-heading text-start sm:text-center text-balance text-[clamp(2rem,6vw,4.1rem)] leading-[1.03]">
              <span className="block">{bracketHighlight(heroSection.headline)}</span>
              {heroSection.highlightedText ? (
                <span className="block">{bracketHighlight(heroSection.highlightedText)}</span>
              ) : null}
            </h1>

            <p className="font-body mt-8 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
              {heroSection.subheadline}
            </p>

            {heroSection.primaryCta?.href && heroSection.primaryCta?.label ? (
              <PrimaryLink href={heroSection.primaryCta.href} className="mt-8">
                {heroSection.primaryCta.label}
              </PrimaryLink>
            ) : null}
          </div>
        </div>
      </section>

      {tagsRibbonItems.length > 0 ? (
        <section className="border-b border-white/15 bg-linear-to-r from-[#9b47fb] via-[#c47ff7] to-[#DDD000]">
          <div className="mx-auto w-full max-w-295 px-4 md:px-8 lg:pe-4">
            <TextLoop
              text={tagsRibbonText}
              speed={14}
              className="py-2 text-center font-subtitle uppercase text-white [&_span]:text-[clamp(1rem,2.2vw,2rem)] [&_span]:font-semibold [&_span]:leading-none [&_span]:tracking-[0.02em]"
            />
          </div>
        </section>
      ) : null}

      <main className="mx-auto flex w-full max-w-295 flex-col gap-24 px-4 py-16 md:gap-28 md:px-8 md:py-24 lg:px-10">
        <BodyBlock section={bodySection} />
        <ContactFormSection section={formSection} />
      </main>

      <LandingFooter footer={homePage.footer} />
  </>
  )
}

function BodyBlock({section}: BodyBlockProps) {
  const whyStackCards = section.whyCards
  const primaryWhyCard = whyStackCards[0]

  return (
    <section id='quienes-somos' aria-label={section.title} className="space-y-14 md:space-y-16 ">
      <div className="space-y-6">
        <ScrollReveal
          baseOpacity={0.1}
          enableBlur
          baseRotation={0}
          blurStrength={4}
        >
          <h2
            key="intro-title"
            className="font-heading max-w-5xl text-balance text-[clamp(1.4rem,4.8vw,1.6rem)] leading-[1.1] text-[#DDD000] pb-6"
          >
            {bracketHighlight(section.introTitle)}
          </h2>
          <p
            key="intro-text"
            className="font-body max-w-4xl font-medium
 text-balance text-xl leading-relaxed text-white/90 md:text-[2rem] md:leading-[1.2]"
          >
            {bracketHighlight(section.introText)}
          </p>
        </ScrollReveal>
      </div>
      <div className="grid gap-10 pt-2 md:grid-cols-3 text-right">
        {section.metrics.map((metric) => {
          const parsedMetric = parseMetricForCountUp(metric.value)

          return (
            <article key={metric._key} className="space-y-2 justify-end">
              <p className="font-heading text-[clamp(3.1rem,7vw,4.6rem)] font-semibold leading-none text-[#DDD000]">
                {parsedMetric ? (
                  <>
                    {parsedMetric.prefix}
                    <CountUp
                      from={0}
                      to={parsedMetric.value}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                      startWhen
                    />
                    {parsedMetric.suffix}
                  </>
                ) : (
                  metric.value
                )}
              </p>
              <p className="font-subtitle text-sm uppercase tracking-[0.07em] text-white/90">{metric.label}</p>
              {metric.description ? (
                <p className="font-body text-xs text-white/65">{metric.description}</p>
              ) : null}
            </article>
          )
        })}
      </div>


      <div className="space-y-4 pt-6" id="services">
        <span id="servicios" className="block h-0" aria-hidden="true" />
        {section.servicesTitle ? (
          <p className="font-heading max-w-5xl text-balance text-[clamp(1.4rem,4.8vw,1.6rem)] leading-[1.1] text-[#DDD000]">
            {section.servicesTitle}
          </p>
        ) : null}
        {section.servicesDescription ? (
          <p className="font-body text-md text-white">{section.servicesDescription}</p>
        ) : null}

        <ServicesAccordion services={section.servicesAccordion} />
      </div>

      <div className="pt-10">
        <SplitText
          text={section.manifesto.title}
          className="font-heading mx-auto max-w-5xl text-center text-[clamp(2.2rem,5vw,4.6rem)] uppercase leading-[1.08] text-[#DDD000]"
          delay={40}
          duration={1.25}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
        {section.manifesto.subtitle ? (
          <p className="font-body mx-auto mt-5 max-w-3xl text-center text-base text-white/75 md:text-lg">
            {section.manifesto.subtitle}
          </p>
        ) : null}
      </div>

        
      {primaryWhyCard ? (
          <ScrollStack
            useWindowScroll
            itemDistance={50}
            itemScale={0.032}
            itemStackDistance={15}
            stackPosition="10%"
            scaleEndPosition="13%"
            baseScale={0.9}
            grayscaleAmount={18}
            className="px-1 md:px-2"
          >
            {whyStackCards.map((card, index) => (
              <ScrollStackItem
                key={card._key || `${card.title}-${index}`}
                itemClassName="rounded-4xl border border-transparent h-[50vh] lg:h-[60vh] flex flex-col items-center justify-center [background:linear-gradient(#050505,#050505)_padding-box,linear-gradient(90deg,#A855F7,#c47ff7,#FFFFFF,#DDD000)_border-box] px-5 py-10 md:px-12 md:py-14"
              >
                <div className="space-y-8 pt-2">
                  <div className="text-center">
                    <span className="font-subtitle text-center text-[13px] font-semibold uppercase tracking-[0.12em] text-[#DDD000]">
                      {card.eyebrow || `${index + 1}`.padStart(2, '0')}
                    </span>
                    <h5 className="font-heading mt-5 text-center text-[clamp(1.8rem,6vw,5.2rem)] leading-none text-[#DDD000]">
                      {card.title}
                    </h5>
                    <p className="font-body mx-auto mt-5 max-w-4xl text-center text-sm leading-relaxed text-white/80 md:text-base">
                      {card.text}
                    </p>
                  </div>

                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
      ) : null}



      <section className="pt-5 ">
        <p className="font-subtitle text-[13px] font-semibold uppercase tracking-[0.12em] text-[#DDD000]">
          MARCAS QUE NOS ELIGEN
        </p>
        <div className="relative pt-5">
          <LogoLoop
            logos={section.brands.map((brand) => ({
              src: brand.logo.url,
              alt: brand.logo.alt || brand.name,
            }))}
            speed={50}
            direction="left"
            logoHeight={60}
            gap={60}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#0a0a0a"
            ariaLabel="Technology partners"
          />
        </div>
      </section>
    </section>
  )
}

// Funciones y scripts de utilidad para el componente de la página principal ---------------------------------------------------------

function PrimaryLink({href, className, children}: PrimaryLinkProps) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={[
          'font-button',
          'inline-flex h-11 items-center rounded-full bg-[#DDD000] px-7',
          'text-[12px] font-semibold uppercase tracking-[0.11em] text-black',
          'transition-colors duration-200 hover:brightness-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DDD000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
          className || '',
        ].join(' ')}
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={[
        'font-button',
        'inline-flex h-11 items-center rounded-full bg-[#DDD000] px-7',
        'text-[12px] font-semibold uppercase tracking-[0.11em] text-black',
        'transition-colors duration-200 hover:brightness-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DDD000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
        className || '',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}

function parseMetricForCountUp(rawValue: string): {prefix: string; value: number; suffix: string} | null {
  const value = rawValue.trim()
  const numberMatch = value.match(/\d+(?:[.,]\d+)*/)

  if (!numberMatch) return null

  const numericToken = numberMatch[0]
  const start = numberMatch.index ?? 0
  const end = start + numericToken.length
  const prefix = value.slice(0, start)
  const suffix = value.slice(end)
  const normalizedToken = normalizeMetricNumberToken(numericToken)
  const parsedValue = Number(normalizedToken)

  if (Number.isNaN(parsedValue)) return null

  return {
    prefix,
    value: parsedValue,
    suffix,
  }
}

function normalizeMetricNumberToken(token: string) {
  const hasComma = token.includes(',')
  const hasDot = token.includes('.')

  if (hasComma && hasDot) {
    return token.replace(/,/g, '')
  }

  if (hasComma) {
    const commaAsThousands = /^\d{1,3}(,\d{3})+$/.test(token)
    return commaAsThousands ? token.replace(/,/g, '') : token.replace(',', '.')
  }

  return token
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')
}

function isHeroSection(section: HomePageSection): section is LandingHeroSection {
  return section._type === 'landingHero'
}

function isBodySection(section: HomePageSection): section is LandingBodySection {
  return section._type === 'landingBody'
}

function isFormSection(section: HomePageSection): section is LandingFormSection {
  return section._type === 'landingForm'
}
