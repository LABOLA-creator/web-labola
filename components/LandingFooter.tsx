'use client'

import Image from 'next/image'
import Link from 'next/link'
import type {MouseEvent} from 'react'

import type {LandingFooterData} from '@/sanity/types/homePage'

const SERVICE_NAV_EVENT = 'labola:service-nav'

interface LandingFooterProps {
  footer: LandingFooterData
}

export function LandingFooter({footer}: LandingFooterProps) {
  return (
    <footer className="border-t border-white/15">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 pt-16 md:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.45fr_1fr_auto] md:items-end">
          <div className="max-lg:flex max-lg:justify-center">
            {footer.footerLogo?.url ? (
              <Image
                src={footer.footerLogo.url}
                alt={footer.footerLogo.alt || footer.title}
                width={460}
                height={150}
                className="h-auto w-full max-w-70 lg:max-w-115 object-contain"
              />
            ) : (
              <p className="font-heading text-6xl font-black italic uppercase leading-none tracking-tight md:text-8xl">
                LABOLA
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-8 max-lg:justify-items-center max-lg:text-center">
            {footer.linksColumns.map((column) => (
              <div key={column._key}>
                {column.title?.trim() ? (
                  <h3 className="font-subtitle mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-[#DDD000]">
                    {column.title}
                  </h3>
                ) : (
                  <h3 className="font-subtitle mb-3 hidden text-[11px] font-semibold uppercase tracking-[0.11em] text-[#DDD000] sm:block">
                    <span className="invisible" aria-hidden="true">
                      .
                    </span>
                  </h3>
                )}
                <ul className="font-subtitle space-y-2 gap-4 text-sm text-white/90">
                  {column.links.map((link) => (
                    <li key={link._key}>
                      <SmartLink
                        href={link.href}
                        className="transition-colors duration-200 hover:text-[#DDD000]"
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {footer.socialLinks && footer.socialLinks.length > 0 ? (
            <ul className="flex gap-2 max-lg:justify-center">
              {footer.socialLinks.map((social) => (
                <li key={social._key}>
                  <a
                    href={social.href}
                    className="font-subtitle inline-flex h-8 w-8 items-center justify-center border border-[#DDD000] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#DDD000] transition-colors duration-200 hover:bg-[#DDD000] hover:text-black"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform || social.href}
                  >
                    {social.icon?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={social.icon.url}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      getSocialShortLabel(social.platform)
                    )}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          
        </div>

        {footer.bottomLogos && footer.bottomLogos.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-end">
            {footer.bottomLogos.map((item) => {
              const img = (
                <Image
                  src={item.image.url}
                  alt={item.alt || ''}
                  width={120}
                  height={48}
                  className="h-8 w-auto object-contain transition-transform duration-200 hover:-translate-y-0.5"
                />
              )
              return item.href ? (
                <a
                  key={item._key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.alt}
                >
                  {img}
                </a>
              ) : (
                <span key={item._key}>{img}</span>
              )
            })}
          </div>
        )}

        <div className="font-subtitle mt-8 flex flex-col gap-2 border-t border-white/15 pt-4 text-[10px] uppercase tracking-[0.08em] text-white/60 md:flex-row md:items-center md:justify-between">
          <p>{footer.legalText}</p>
          {footer.smallPrint ? <p>{footer.smallPrint}</p> : null}
        </div>
      </div>
    </footer>
  )
}

interface SmartLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

function SmartLink({href, className, children}: SmartLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return

    const isSamePageHash =
      href.startsWith('#') || (href.startsWith('/#') && window.location.pathname === '/')

    if (!isSamePageHash) return

    event.preventDefault()

    const hash = getHashFromHref(href)
    if (!hash) return

    if (window.location.hash.slice(1) !== hash) {
      window.history.pushState(null, '', `/#${hash}`)
    }

    window.dispatchEvent(new Event(SERVICE_NAV_EVENT))
  }

  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}

function getSocialShortLabel(platform?: string) {
  if (!platform) return '#'
  return platform.slice(0, 2)
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')
}

function getHashFromHref(href: string) {
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return ''
  return href.slice(hashIndex + 1).trim()
}
