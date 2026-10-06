'use client'

import Image from 'next/image'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {LandingServiceAccordionItem, PortableTextNode} from '@/sanity/types/homePage'

const SERVICE_NAV_EVENT = 'labola:service-nav'

type AccordionState = 'open' | 'closing' | 'closed'

interface ServicesAccordionProps {
  services: LandingServiceAccordionItem[]
}

export function ServicesAccordion({services}: ServicesAccordionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const serviceIds = useMemo(() => services.map((service) => resolveServiceId(service)), [services])
  const serviceIdSet = useMemo(() => new Set(serviceIds), [serviceIds])

  const [states, setStates] = useState<Record<string, AccordionState>>(() =>
    Object.fromEntries(serviceIds.map((id) => [id, 'closed'])),
  )

  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const openService = useCallback((targetId: string) => {
    setStates((prev) => {
      const next: Record<string, AccordionState> = {}
      for (const id of Object.keys(prev)) {
        if (id === targetId) {
          next[id] = 'open'
        } else if (prev[id] === 'open') {
          next[id] = 'closing'
        } else {
          next[id] = prev[id]
        }
      }
      return next
    })
  }, [])

  const toggleService = useCallback(
    (id: string) => {
      setStates((prev) => {
        const current = prev[id] ?? 'closed'
        if (current === 'closed') {
          // Open this, close others
          const next: Record<string, AccordionState> = {}
          for (const sid of Object.keys(prev)) {
            if (sid === id) {
              next[sid] = 'open'
            } else if (prev[sid] === 'open') {
              next[sid] = 'closing'
            } else {
              next[sid] = prev[sid]
            }
          }
          return next
        } else if (current === 'open') {
          return {...prev, [id]: 'closing'}
        } else {
          // closing → re-open
          return {...prev, [id]: 'open'}
        }
      })
    },
    [],
  )

  // Handle transitionend to finalize 'closing' → 'closed'
  useEffect(() => {
    const listeners: Array<() => void> = []

    for (const [id, state] of Object.entries(states)) {
      if (state === 'closing') {
        const el = contentRefs.current[id]
        if (!el) {
          setStates((prev) => ({...prev, [id]: 'closed'}))
          continue
        }

        const onEnd = () => {
          setStates((prev) => {
            if (prev[id] === 'closing') return {...prev, [id]: 'closed'}
            return prev
          })
        }

        el.addEventListener('transitionend', onEnd, {once: true})
        listeners.push(() => el.removeEventListener('transitionend', onEnd))
      }
    }

    return () => listeners.forEach((remove) => remove())
  }, [states])

  useEffect(() => {
    const handleServiceHashNavigation = () => {
      const rawHash = window.location.hash.slice(1)
      if (!rawHash) return

      const decodedHash = decodeHash(rawHash)
      const normalizedHash = normalizeServiceId(decodedHash)
      if (!normalizedHash) return

      if (normalizedHash === 'services' || normalizedHash === 'servicios') {
        document.getElementById('services')?.scrollIntoView({behavior: 'smooth', block: 'start'})
        return
      }

      const targetServiceId = normalizedHash
        .replace(/^service-content-/, '')
        .replace(/^service-/, '')

      if (!serviceIdSet.has(targetServiceId)) return

      openService(targetServiceId)

      requestAnimationFrame(() => {
        const el = containerRef.current?.querySelector<HTMLElement>(
          `[data-service-id="${targetServiceId}"]`,
        )
        el?.scrollIntoView({behavior: 'smooth', block: 'start'})
      })
    }

    handleServiceHashNavigation()
    window.addEventListener('hashchange', handleServiceHashNavigation)
    window.addEventListener(SERVICE_NAV_EVENT, handleServiceHashNavigation)

    return () => {
      window.removeEventListener('hashchange', handleServiceHashNavigation)
      window.removeEventListener(SERVICE_NAV_EVENT, handleServiceHashNavigation)
    }
  }, [serviceIdSet, openService])

  return (
    <div ref={containerRef} className="pt-4">
      {services.map((service, index) => {
        const serviceId = serviceIds[index]
        const state = states[serviceId] ?? 'closed'
        const isOpen = state === 'open'

        return (
          <div
            key={service._key}
            data-service-id={serviceId}
            data-state={state}
            className="border-t first:border-t-0 border-transparent p-5 transition-[background-color] duration-500 [--accordion-bg:#0a0a0a] [background:linear-gradient(var(--accordion-bg),var(--accordion-bg))_padding-box,linear-gradient(90deg,#DDD000,#c47ff7,#A855F7)_border-box] data-[state=open]:[--accordion-bg:#DDD000] data-[state=open]:text-black data-[state=closing]:[--accordion-bg:#DDD000] data-[state=closing]:text-black"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleService(serviceId)}
              className="font-heading flex w-full cursor-pointer items-center justify-between py-4 text-[clamp(2rem,5vw,3.7rem)] uppercase leading-[1.05] tracking-[0.01em] text-left"
            >
              <span>{service.title}</span>
              <span
                className="text-[#DDD000] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] data-[state=open]:rotate-45 data-[state=open]:text-black data-[state=closing]:rotate-45 data-[state=closing]:text-black"
                data-state={state}
              >
                {service.icon || '+'}
              </span>
            </button>
            <div
              ref={(el) => {
                contentRefs.current[serviceId] = el
              }}
              data-state={state}
              className="grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-[600ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] data-[state=open]:grid-rows-[1fr] data-[state=closing]:grid-rows-[0fr]"
            >
              <div
                data-state={state}
                className="min-h-0 space-y-3 pb-5 text-sm leading-relaxed text-white/80 opacity-0 transition-[color,opacity] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] data-[state=open]:text-black/80 data-[state=open]:opacity-100 data-[state=closing]:text-white/80 data-[state=closing]:opacity-0"
              >
                {renderPortableNodes(service.content, serviceId, state)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function renderPortableNodes(
  nodes: PortableTextNode[],
  serviceId: string,
  state: AccordionState,
) {
  let paragraphCount = 0

  return nodes.map((node) => {
    if (node._type === 'block') {
      paragraphCount += 1
      const text = node.children.map((child) => child.text).join('')
      const paragraphId =
        paragraphCount === 1
          ? `service-content-${serviceId}`
          : `service-content-${serviceId}-paragraph-${String(paragraphCount)}`

      return (
        <p
          id={paragraphId}
          key={node._key}
          data-state={state}
          className="font-body text-sm leading-relaxed text-white/80 transition-colors duration-200 data-[state=open]:text-black/80 md:text-base"
        >
          {text}
        </p>
      )
    }

    if (node.url) {
      return (
        <Image
          key={node._key}
          src={node.url}
          alt={node.alt || 'Servicio'}
          width={900}
          height={500}
          className="mt-2 h-auto w-full rounded-xl object-cover"
        />
      )
    }

    return null
  })
}

function resolveServiceId(service: LandingServiceAccordionItem) {
  const serviceId = normalizeServiceId(service.id ?? '')
  if (serviceId) return serviceId

  const titleId = normalizeServiceId(service.title)
  if (titleId) return titleId

  return `service-${service._key}`
}

function normalizeServiceId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function decodeHash(hash: string) {
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}
