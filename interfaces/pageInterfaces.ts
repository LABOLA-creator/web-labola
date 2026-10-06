import type {ReactNode} from 'react'

import type {LandingBodySection, LandingFormSection} from '@/sanity/types/homePage'

export interface BodyBlockProps {
  section: LandingBodySection
}

export interface FormBlockProps {
  section: LandingFormSection
}

export interface PrimaryLinkProps {
  href: string
  className?: string
  children: ReactNode
}
