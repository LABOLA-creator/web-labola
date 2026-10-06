import Image from 'next/image'
import {notFound} from 'next/navigation'

import ChromaGrid from '@/components/ChromaGrid'
import {ContactFormSection} from '@/components/ContactFormSection'
import {LandingFooter} from '@/components/LandingFooter'
import {LandingHeader} from '@/components/LandingHeader'
import {client} from '@/sanity/client'
import {homePageQuery} from '@/sanity/queries/homePageQuery'
import {talentsPageQuery} from '@/sanity/queries/talentsPageQuery'
import type {HomePageData, HomePageSection, LandingFormSection} from '@/sanity/types/homePage'
import type {TalentsPageData} from '@/sanity/types/talentsPage'

export const revalidate = 60

export default async function TalentsPage() {
  const talentsSlug = process.env.NEXT_PUBLIC_TALENTS_SLUG ?? 'talentos'
  const homeSlug = process.env.NEXT_PUBLIC_HOME_SLUG ?? null
  const [talentsPage, homePage] = await Promise.all([
    client.fetch<TalentsPageData | null>(talentsPageQuery, {slug: talentsSlug}),
    client.fetch<HomePageData | null>(homePageQuery, {slug: homeSlug}),
  ])

  if (!talentsPage || !homePage?.footer) {
    notFound()
  }

  const headerData = talentsPage.header
  const footerData = homePage.footer
  const contactSection = homePage?.sections.find(isFormSection)

  if (!headerData || !footerData) {
    notFound()
  }

  const overlayOpacity = clampNumber(talentsPage.hero?.overlayOpacity ?? 0.7, 0, 1)
  const heroTitle = talentsPage.hero?.title?.trim() || 'Nuestros'
  const heroHighlight = talentsPage.hero?.highlightedWord?.trim() || 'talentos'
  const heroBackgroundImage = talentsPage.hero?.backgroundImage

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050505]">
        <div className="absolute inset-0 z-0">
          {heroBackgroundImage?.url ? (
            <Image
              src={heroBackgroundImage.url}
              alt={heroBackgroundImage.alt || `${heroTitle} ${heroHighlight}`}
              fill
              priority
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(102,33,203,0.42),transparent_38%),radial-gradient(circle_at_82%_24%,rgba(221,208,0,0.24),transparent_40%),#050505]" />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-black" style={{opacity: overlayOpacity}} />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(100deg,rgba(145,67,255,0.20)_0%,rgba(0,0,0,0)_48%,rgba(221,208,0,0.16)_100%)]" />

        <div className="relative z-30 mx-auto flex min-h-[420px] w-full max-w-[1180px] flex-col px-4 pb-14 pt-8 md:px-8 lg:px-10">
          <LandingHeader header={headerData} />

          <div className="flex flex-1 items-center justify-center pb-8 pt-14 text-center md:pb-10">
            <h1 className="font-heading text-balance text-[clamp(2.1rem,5.8vw,4.1rem)] leading-[1.05]">
              <span className="text-white">{heroTitle} </span>
              <span className="text-[#DDD000]">{heroHighlight}</span>
            </h1>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-8 md:px-8 md:pb-24 md:pt-10 lg:px-10">
        <ChromaGrid items={talentsPage.talents || []} />

        {contactSection ? (
          <section className="mt-20 md:mt-24">
            <ContactFormSection section={contactSection} />
          </section>
        ) : null}
      </main>

      <LandingFooter footer={footerData} />
    </>
  )
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isFormSection(section: HomePageSection): section is LandingFormSection {
  return section._type === 'landingForm'
}
