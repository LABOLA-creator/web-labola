'use client'

import {useRef, useState} from 'react'
import type {FormEvent} from 'react'
import {Turnstile, type TurnstileInstance} from '@marsidev/react-turnstile'

import type {LandingFormField, LandingFormSection} from '@/sanity/types/homePage'

interface ContactFormSectionProps {
  section: LandingFormSection
}

type SubmitFeedback = {
  kind: 'success' | 'error'
  message: string
}

type ContactPayloadKey = 'firstName' | 'company' | 'email' | 'message'

const FIELD_ALIASES: Record<ContactPayloadKey, string[]> = {
  firstName: ['firstname', 'first_name', 'name', 'nombre', 'fullname', 'full_name', 'nombrecompleto'],
  company: ['company', 'empresa', 'compania', 'organizacion', 'organization', 'business', 'brand', 'marca'],
  email: ['email', 'correo', 'mail', 'e-mail', 'correoelectronico'],
  message: ['message', 'mensaje', 'comentario', 'comentarios', 'consulta', 'detalle', 'detalles'],
}

export function ContactFormSection({section}: ContactFormSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<SubmitFeedback | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const isProduction = process.env.NODE_ENV === 'production'
  const isTurnstileEnabled = isProduction
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileStatus, setTurnstileStatus] = useState<'required' | 'success' | 'error' | 'expired'>(
    'required',
  )
  const [turnstileMessage, setTurnstileMessage] = useState<string | null>(null)
  const canSubmit =
    !isSubmitting &&
    (!isTurnstileEnabled || (Boolean(turnstileSiteKey) && turnstileStatus === 'success'))

  const resetTurnstile = () => {
    setTurnstileToken('')
    setTurnstileStatus('required')
    turnstileRef.current?.reset()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)
    setTurnstileMessage(null)

    if (isTurnstileEnabled && !turnstileSiteKey) {
      setFeedback({
        kind: 'error',
        message: 'El captcha no está configurado. Revisa NEXT_PUBLIC_TURNSTILE_SITE_KEY.',
      })
      return
    }

    if (isTurnstileEnabled && (turnstileStatus !== 'success' || !turnstileToken)) {
      setTurnstileMessage('Completa la verificación de seguridad para enviar el formulario.')
      return
    }

    const form = event.currentTarget
    const rawFormData = new FormData(form)
    const payload = buildContactPayload(
      section.formFields,
      rawFormData,
      isTurnstileEnabled ? turnstileToken : '',
    )

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      })

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean
            message?: string
            error?: string
          }
        | null

      if (!response.ok || !data?.ok) {
        setFeedback({
          kind: 'error',
          message: data?.error || section.errorMessage || 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
        })
        return
      }

      setFeedback({
        kind: 'success',
        message: section.successMessage || data.message || 'Mensaje enviado. Gracias por contactar.',
      })
      form.reset()
    } catch {
      setFeedback({
        kind: 'error',
        message: section.errorMessage || 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
      })
    } finally {
      setIsSubmitting(false)
      resetTurnstile()
    }
  }

  return (
    <>
      <section aria-label={section.title} id="contacto">
        <h2 className="font-heading text-balance text-[clamp(1.5rem,4.8vw,2.5rem)] uppercase leading-[1.08] text-[#DDD000] border-t border-white/15 pt-10 pb-5">
          {section.heading}
        </h2>
        <div className="grid gap-12  lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-6">
            <p className="font-body max-w-md text-sm leading-relaxed text-white/80 md:text-base">
              {section.subtext}
            </p>

            <div className="space-y-4 border-l border-[#DDD000]/80 pl-4 text-sm">
              <div>
                <p className="font-subtitle text-[11px] uppercase tracking-[0.11em] text-white/60">Email</p>
                <a
                  href={`mailto:${section.contactInfo.email}`}
                  className="font-body text-base text-white transition-colors duration-200 hover:text-[#DDD000]"
                >
                  {section.contactInfo.email}
                </a>
              </div>
              <div>
                <p className="font-subtitle text-[11px] uppercase tracking-[0.11em] text-white/60">
                  Estamos en
                </p>
                <p className="font-body text-base text-white">
                  {[section.contactInfo.city, section.contactInfo.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            {section.formFields.map((field) => {
              const isTextarea = field.type === 'textarea'
              const spansTwoColumns = isTextarea || field.type === 'email'

              return (
                <div key={field._key} className={`space-y-2 ${spansTwoColumns ? 'md:col-span-2' : ''}`}>
                  <label
                    htmlFor={field.name}
                    className="font-subtitle text-[11px] font-semibold uppercase tracking-[0.11em] text-white/80"
                  >
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>

                  {isTextarea ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      required={field.required}
                      rows={5}
                      disabled={isSubmitting}
                      className="h-36 w-full rounded-xl border border-white/20 bg-[#d7d7db] px-4 py-3 text-base text-black outline-none transition-shadow duration-200 placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#DDD000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={getInputType(field)}
                      required={field.required}
                      disabled={isSubmitting}
                      className="h-11 w-full rounded-xl border border-white/20 bg-[#d7d7db] px-4 text-base text-black outline-none transition-shadow duration-200 placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#DDD000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                    />
                  )}
                </div>
              )
            })}

            <div className="md:col-span-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="privacy"
                  required
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 rounded border border-white/30 bg-transparent accent-[#DDD000]"
                />
                <span className="font-body text-sm text-white/80">Acepto la política de privacidad.</span>
              </label>
            </div>

            {feedback ? (
              <p
                className={`font-subtitle md:col-span-2 text-xs uppercase tracking-[0.08em] ${
                  feedback.kind === 'error' ? 'text-[#ff8e8e]' : 'text-[#DDD000]'
                }`}
                role="status"
                aria-live="polite"
              >
                {feedback.message}
              </p>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="font-button inline-flex h-11 items-center rounded-full bg-[#DDD000] px-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-black transition-colors duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DDD000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
              >
                {isSubmitting ? 'Enviando...' : section.submitLabel}
              </button>
            </div>

            {isTurnstileEnabled ? (
              <div className="md:col-span-2 space-y-3">
                {turnstileSiteKey ? (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey}
                  options={{
                    theme: 'dark',
                    language: 'es',
                    responseField: false,
                  }}
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                    setTurnstileStatus('success')
                    setTurnstileMessage(null)
                  }}
                  onExpire={() => {
                    setTurnstileToken('')
                    setTurnstileStatus('expired')
                    setTurnstileMessage('La verificación expiró. Resuélvela de nuevo.')
                  }}
                  onError={() => {
                    setTurnstileToken('')
                    setTurnstileStatus('error')
                    setTurnstileMessage('No se pudo validar el captcha. Inténtalo otra vez.')
                  }}
                />
                ) : (
                  <p className="font-subtitle text-xs uppercase tracking-[0.08em] text-[#ff8e8e]">
                    El captcha no está configurado.
                  </p>
                )}

                {turnstileMessage ? (
                  <p className="font-subtitle text-xs uppercase tracking-[0.08em] text-[#ff8e8e]">
                    {turnstileMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </>
  )
}

function getInputType(field: LandingFormField) {
  if (field.type === 'email') return 'email'
  return 'text'
}

function buildContactPayload(fields: LandingFormField[], rawFormData: FormData, turnstileToken: string) {
  const valuesByKey: Partial<Record<ContactPayloadKey, string>> = {}
  const textFallbackValues: string[] = []

  for (const field of fields) {
    const value = String(rawFormData.get(field.name) ?? '').trim()
    if (!value) continue

    const key = resolvePayloadKey(field)
    if (key) {
      if (!valuesByKey[key]) valuesByKey[key] = value
      continue
    }

    if (field.type === 'text') {
      textFallbackValues.push(value)
    }
  }

  if (!valuesByKey.firstName && textFallbackValues[0]) {
    valuesByKey.firstName = textFallbackValues[0]
  }
  if (!valuesByKey.company && textFallbackValues[1]) {
    valuesByKey.company = textFallbackValues[1]
  }

  const payload = new FormData()
  payload.set('firstName', valuesByKey.firstName ?? '')
  payload.set('company', valuesByKey.company ?? '')
  payload.set('email', valuesByKey.email ?? '')
  payload.set('message', valuesByKey.message ?? '')

  if (rawFormData.get('privacy')) {
    payload.set('privacy', 'on')
  }
  payload.set('cf-turnstile-response', turnstileToken)
  payload.set('turnstileToken', turnstileToken)

  return payload
}

function resolvePayloadKey(field: LandingFormField): ContactPayloadKey | null {
  if (field.type === 'email') return 'email'
  if (field.type === 'textarea') return 'message'

  const candidates = [field.name, field.label].map(normalizeToken)

  for (const key of Object.keys(FIELD_ALIASES) as ContactPayloadKey[]) {
    for (const alias of FIELD_ALIASES[key]) {
      if (candidates.some((candidate) => candidate === alias)) {
        return key
      }
    }
  }

  for (const key of Object.keys(FIELD_ALIASES) as ContactPayloadKey[]) {
    for (const alias of FIELD_ALIASES[key]) {
      if (alias.length < 5) continue
      if (candidates.some((candidate) => candidate.includes(alias))) {
        return key
      }
    }
  }

  return null
}

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}
