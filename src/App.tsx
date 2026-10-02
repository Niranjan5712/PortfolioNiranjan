import type { ReactElement } from 'react'
import { Loader } from '@/components/layout/Loader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNav } from '@/components/layout/SiteNav'
import { Awards } from '@/components/sections/Awards'
import { Beyond } from '@/components/sections/Beyond'
import { Contact } from '@/components/sections/Contact'
import { Hero } from '@/components/sections/hero/Hero'
import { HowIShip } from '@/components/sections/how-i-ship/HowIShip'
import { OperatingPrinciples } from '@/components/sections/how-i-ship/OperatingPrinciples'
import { ImpactStats } from '@/components/sections/ImpactStats'
import { IntroVideo } from '@/components/sections/IntroVideo'
import { Journey } from '@/components/sections/journey/Journey'
import { ProductLine } from '@/components/sections/products/ProductLine'
import { SkillsMarquee } from '@/components/sections/SkillsMarquee'
import { TwinChat } from '@/components/twin/TwinChat'
import { profile } from '@/data/profile'
import { MEDIA } from '@/data/site'
import { TWIN_SUGGESTIONS, TWIN_TEASERS } from '@/data/twin'
import { useScrollTriggerAutoRefresh } from '@/hooks/useScrollTriggerAutoRefresh'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { useTwinChat } from '@/hooks/useTwinChat'

const funnelProducts = profile.products.filter((p) => p.inFunnel).map((p) => p.shortName)
const skillRows = [
  [...profile.skills.product, ...profile.skills.analytics],
  profile.skills.aiProduct,
]

export function App(): ReactElement {
  useSmoothScroll()
  useScrollTriggerAutoRefresh()
  const twin = useTwinChat(profile)

  return (
    <>
      <Loader firstName={profile.hero.firstName} />
      <SiteNav brand={profile.hero.firstName} links={profile.nav} />
      <main className="relative z-[1]">
        <Hero content={profile.hero} videoSrc={MEDIA.hero3d} />
        <SkillsMarquee rows={skillRows} />
        <ImpactStats stats={profile.stats} />
        <HowIShip steps={profile.process} funnelProducts={funnelProducts} />
        <OperatingPrinciples principles={profile.principles} />
        <ProductLine products={profile.products} />
        <Journey roles={profile.roles} />
        <Awards awards={profile.awards} />
        <IntroVideo src={MEDIA.intro} label={MEDIA.introLabel} duration={MEDIA.introDuration} />
        <Beyond content={profile.beyond} />
        <Contact contact={profile.contact} />
      </main>
      <SiteFooter name={profile.name} wordmark={profile.hero.firstName} />
      <TwinChat chat={twin} suggestions={TWIN_SUGGESTIONS} teasers={TWIN_TEASERS} />
    </>
  )
}
