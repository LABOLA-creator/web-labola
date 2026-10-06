'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState, type ReactNode} from 'react'

import type {LandingHeaderData, LandingNavLink} from '@/sanity/types/homePage'

type NavigationViewport = 'desktop' | 'mobile'

interface LandingHeaderProps {
  header: LandingHeaderData
}

export function LandingHeader({header}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const desktopLinks = header.navLinks.filter((item) => shouldShowNavLink(item, 'desktop'))
  const mobileLinks = header.navLinks.filter((item) => shouldShowNavLink(item, 'mobile'))

  return (
    <header className="relative">
      <nav
        aria-label="Navegacion principal"
        className="mx-auto flex w-full items-center justify-between gap-6"
      >
        <div className="flex items-center">
          {header.logo?.url ? (
            <Link href="/">
              <Image
                src={header.logo.url}
                alt={header.logo.alt || header.title}
                width={120}
                height={54}
                className="h-[70px] w-auto p-1"
                priority
              />
            </Link>
          ) : (
            <span className="bg-white px-3 py-2 text-xl font-black italic tracking-tight text-black">
              LABOLA
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white transition-colors duration-200 hover:bg-white/10 lg:hidden"
          aria-label="Abrir menu de navegacion"
        >
          <BarsIcon className="h-5 w-5" />
        </button>

        <ul className="font-subtitle hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.11em] lg:flex">
          {desktopLinks.map((item) => (
            <li key={item._key}>
              <HeaderNavItem item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/75"
            aria-label="Cerrar menu de navegacion"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 z-10 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#050505] px-6 py-5">
            <div className="flex items-center justify-between">
              {header.logo?.url ? (
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Image
                    src={header.logo.url}
                    alt={header.logo.alt || header.title}
                    width={96}
                    height={42}
                    className="h-12 w-auto p-1"
                  />
                </Link>
              ) : (
                <span className="bg-white px-3 py-2 text-lg font-black italic tracking-tight text-black">
                  LABOLA
                </span>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white transition-colors duration-200 hover:bg-white/10"
                aria-label="Cerrar menu de navegacion"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <ul className="mt-8 space-y-2">
              {mobileLinks.map((item) => (
                <li key={item._key}>
                  <HeaderNavItem item={item} mobile onNavigate={() => setMobileMenuOpen(false)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  )
}

interface HeaderNavItemProps {
  item: LandingNavLink
  mobile?: boolean
  onNavigate?: () => void
}

function HeaderNavItem({item, mobile = false, onNavigate}: HeaderNavItemProps) {
  const label = stripBrackets(item.label)
  const hasBracketStyle = hasBracketMarkers(item.label)
  const textColorClass = getBracketTextColorClass(hasBracketStyle, 'text-white')

  if (item.variant === 'button') {
    const isPrimary = isPrimaryNavButton(label, item.href)

    return (
      <SmartLink
        href={item.href}
        onClick={onNavigate}
        className={[
          'font-button inline-flex items-center rounded-full px-5 text-[13px] font-semibold uppercase tracking-[0.11em] transition-colors duration-200',
          mobile ? 'h-11 w-full justify-center' : 'h-9',
          isPrimary
            ? 'bg-[#DDD000] text-black hover:brightness-95'
            : hasBracketStyle
              ? 'border border-[#b96dff] hover:bg-[#b96dff]/15'
              : `${textColorClass} hover:bg-white/10`,
        ].join(' ')}
      >
        {label}
      </SmartLink>
    )
  }

  return (
    <SmartLink
      href={item.href}
      onClick={onNavigate}
      className={[
        textColorClass,
        mobile
          ? 'font-subtitle -mx-1 block rounded-lg px-3 py-2 text-base font-semibold uppercase tracking-[0.08em] hover:bg-white/5'
          : 'transition-colors duration-200 hover:text-[#DDD000]',
      ].join(' ')}
    >
      {label}
    </SmartLink>
  )
}

interface SmartLinkProps {
  href: string
  className?: string
  children: ReactNode
  onClick?: () => void
}

function SmartLink({href, className, children, onClick}: SmartLinkProps) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

interface IconProps {
  className?: string
}

function BarsIcon({className}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({className}: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function shouldShowNavLink(item: LandingNavLink, viewport: NavigationViewport) {
  if (item.showOn === 'desktop') return viewport === 'desktop'
  if (item.showOn === 'mobile') return viewport === 'mobile'
  return true
}

function isPrimaryNavButton(label: string, href: string) {
  const normalizedLabel = normalizeString(label)
  const normalizedHref = normalizeString(href)
  return normalizedLabel.includes('contact') || normalizedHref.includes('contact')
}

function hasBracketMarkers(value: string) {
  const trimmed = value.trim()
  return trimmed.startsWith('[') && trimmed.endsWith(']')
}

function stripBrackets(value: string) {
  return value.trim().replace(/^\[(.*)\]$/, '$1').trim()
}

function getBracketTextColorClass(hasBracketStyle: boolean, fallbackClass: string) {
  return hasBracketStyle ? 'text-[#DDD000]' : fallbackClass
}

function normalizeString(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')
}
