import type { ReactElement } from 'react'
import { Magnetic } from '@/components/common/Magnetic'
import { Button } from '@/components/ui/button'
import type { Contact as ContactInfo } from '@/types/profile'

interface ContactProps {
  contact: ContactInfo
}

export function Contact({ contact }: ContactProps): ReactElement {
  return (
    <section id="contact" aria-label="Contact" className="relative overflow-hidden pt-[clamp(80px,11vw,140px)] pb-[clamp(24px,4vw,56px)] text-center">
      <div className="mx-auto w-[min(1160px,100%-40px)]">
        <h2 className="m-0 mb-6 text-[clamp(50px,10vw,136px)] leading-[.9] font-bold tracking-[-0.055em]">
          Let’s build
          <br />
          what’s next.
        </h2>
        <p className="mx-auto mb-[34px] max-w-[46ch] text-[19px] text-ink-soft">
          Building AI products people trust and actually use. If that’s what you’re working on, let’s talk.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Button asChild size="pill">
              <a href={`mailto:${contact.email}`}>Email me</a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="pill" variant="outline">
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="pill" variant="outline">
              <a href={contact.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild size="pill" variant="outline">
              <a href={contact.phoneHref}>Call</a>
            </Button>
          </Magnetic>
        </div>
        <p className="mt-7 text-[15px] text-ink-soft">
          {contact.location} &nbsp;/&nbsp; {contact.phone} &nbsp;/&nbsp; {contact.email}
        </p>
      </div>
    </section>
  )
}
