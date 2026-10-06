'use client'

import Image from 'next/image'
import {useEffect, useMemo, useState} from 'react'

import type {TalentCard, TalentSocialLink} from '@/sanity/types/talentsPage'

export interface ChromaGridProps {
  items: TalentCard[]
  className?: string
}

export default function ChromaGrid({items, className = ''}: ChromaGridProps) {
  const [activeTalent, setActiveTalent] = useState<TalentCard | null>(null)

  useEffect(() => {
    if (!activeTalent) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveTalent(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeTalent])

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-white/15 bg-[#0c0c0c] px-5 py-14 text-center text-white/70">
        Todavia no hay talentos cargados.
      </div>
    )
  }

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 ${className}`}>
        {items.map((item, index) => {
          const key = item._key || `${item.name}-${index}`
          const imageAlt = item.image?.alt || item.name

          return (
            <article key={key} className="group [perspective:1200px]">
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => setActiveTalent(item)}
                aria-label={`Abrir detalle de ${item.name}`}
              >
                <div className="relative aspect-square [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:[transform:rotateY(180deg)]">
                  <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[#111] [backface-visibility:hidden]">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#151515] px-4 text-center text-base text-white/75 ">
                        {item.name}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center rounded-[18px] border border-[#DDD000] bg-[#DDD000] p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <h3 className="font-heading text-[clamp(1.35rem,2.2vw,1.9rem)] leading-tight text-black capitalize">
                      {item.name}
                    </h3>
                  </div>
                </div>
              </button>
            </article>
          )
        })}
      </div>

      {activeTalent ? <TalentModal talent={activeTalent} onClose={() => setActiveTalent(null)} /> : null}
    </>
  )
}

interface TalentModalProps {
  talent: TalentCard
  onClose: () => void
}

function TalentModal({talent, onClose}: TalentModalProps) {
  const socialLinks = useMemo(
    () => (talent.socialLinks || []).filter((social) => Boolean(social?.url)),
    [talent.socialLinks],
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div className="pointer-events-none absolute -left-14 top-1/3 h-48 w-48 rounded-full bg-[#DDD000]/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-56 w-56 rounded-full bg-[#a051ff]/35 blur-3xl" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="talent-modal-title"
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[22px] border border-white/30 bg-[#e9e9e9] text-black shadow-[0_25px_90px_rgba(0,0,0,0.45)]"
      >
        <div className="grid md:grid-cols-[0.42fr_0.58fr]">
          <div className="relative min-h-[320px] md:min-h-[520px]">
            {talent.image?.url ? (
              <Image
                src={talent.image.url}
                alt={talent.image.alt || talent.name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] p-6 text-center text-xl text-white">
                {talent.name}
              </div>
            )}
          </div>

          <div className="relative flex min-h-[320px] flex-col p-6 md:min-h-[520px] md:p-10">
            <h3 id="talent-modal-title" className="font-heading text-[clamp(2rem,4vw,3rem)] leading-[1.02] text-black capitalize">
              {talent.name}
            </h3>

            {talent.description ? (
              <p className="font-body mt-5 max-w-xl text-sm leading-relaxed text-black/80 md:text-base">
                {talent.description}
              </p>
            ) : null}

            {socialLinks.length > 0 ? (
              <ul className="mt-6 flex flex-col gap-2">
                {socialLinks.map((social) => (
                  <li key={social._key}>
                    <SocialLinkButton social={social} />
                  </li>
                ))}
              </ul>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="font-button absolute bottom-6 right-6 inline-flex h-[96px] w-[96px] items-center justify-center rounded-full border border-[#DDD000] text-[20px] uppercase tracking-[0.04em] text-black transition-colors duration-200 hover:bg-[#DDD000]/20 md:bottom-10 md:right-10"
            >
              Cerrar
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

interface SocialLinkButtonProps {
  social: TalentSocialLink
}

function SocialLinkButton({social}: SocialLinkButtonProps) {
  const label = getSocialLabel(social.platform)
  const iconAlt = social.icon?.alt || `Icono ${label}`
  const followers = social.followers?.trim() || '--'

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: ${followers}`}
      className="group inline-flex items-center gap-3"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#b8ad00] transition-colors duration-200 group-hover:text-[#8c8300]">
        {social.icon?.url ? (
          <Image src={social.icon.url} alt={iconAlt} width={30} height={30} className="h-8 w-8 object-contain" />
        ) : (
          <span className="font-subtitle text-[11px] font-semibold uppercase">{label.slice(0, 2)}</span>
        )}
      </span>
      <span className="font-subtitle text-lg font-bold tracking-[0.04em] text-black transition-colors duration-200 group-hover:text-black">
        {followers}
      </span>
    </a>
  )
}

function getSocialLabel(platform?: string) {
  if (!platform?.trim()) return 'Red social'
  return platform.trim()
}
