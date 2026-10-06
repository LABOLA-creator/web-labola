import localFont from 'next/font/local'
import type {Metadata} from 'next'

import {client} from '@/sanity/client'
import {homePageSeoQuery} from '@/sanity/queries/homePageSeoQuery'
import type {SeoData} from '@/sanity/types/homePage'

import './globals.css'

const exo = localFont({
  src: '../fonts/exo-variable.woff2',
  variable: '--font-exo',
  display: 'swap',
})
const montserrat = localFont({
  src: '../fonts/montserrat-variable.woff2',
  variable: '--font-montserrat',
  display: 'swap',
})
const inter = localFont({
  src: '../fonts/Inter-variable.woff2',
  variable: '--font-inter',
  display: 'swap',
})
const ptSansCaption = localFont({
  src: '../fonts/PTSansCaption-Regular.woff2',
  variable: '--font-pt-sans-caption',
  display: 'swap',
})
interface HomePageSeoResult {
  title?: string
  seo?: SeoData
}

export async function generateMetadata(): Promise<Metadata> {
  const homeSlug = process.env.NEXT_PUBLIC_HOME_SLUG ?? null

  try {
    const homePage = await client.fetch<HomePageSeoResult | null>(homePageSeoQuery, {slug: homeSlug})
    const title = homePage?.seo?.title ?? homePage?.title
    const description = homePage?.seo?.description
    const ogImageUrl = homePage?.seo?.ogImage?.url

    const metadata: Metadata = {}

    if (title) {
      metadata.title = title
    }

    if (description) {
      metadata.description = description
    }

    if (title || description || ogImageUrl) {
      metadata.openGraph = {
        title,
        description,
        images: ogImageUrl ? [{url: ogImageUrl}] : undefined,
      }
      metadata.twitter = {
        card: ogImageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        images: ogImageUrl ? [ogImageUrl] : undefined,
      }
    }

    return metadata
  } catch (error) {
    console.error('Failed to load metadata from Sanity', error)
    return {}
  }
}

const GA_TRACKING_ID = process.env.GACODE ?? ''
const shouldLoadAnalytics = process.env.NODE_ENV === 'production' && GA_TRACKING_ID.length > 0

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth motion-reduce:scroll-auto">
      <head>
        {process.env.NODE_ENV === 'production' ? (
          <script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid="d33aa01c-edf0-4b76-858c-5e7e8de56437"
            data-blockingmode="auto"
            type="text/javascript"
          />
        ) : null}
        {shouldLoadAnalytics ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}');
                `,
              }}
            />
          </>
        ) : null}
      </head>
      <body
        className={`${exo.variable} ${montserrat.variable} ${inter.variable} ${ptSansCaption.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
