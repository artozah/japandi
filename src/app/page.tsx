import dynamic from 'next/dynamic';
import { Header } from '@/components/home/Header';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { StyleGallery } from '@/components/home/StyleGallery';
import { RoomExplorer } from '@/components/home/RoomExplorer';
import { UseCases } from '@/components/home/UseCases';
import { Testimonials } from '@/components/home/Testimonials';
import { Comparison } from '@/components/home/Comparison';
import { Pricing } from '@/components/home/Pricing';
import { FAQ } from '@/components/home/FAQ';
import { Footer } from '@/components/home/Footer';

const TryItDemo = dynamic(() =>
  import('@/components/home/TryItDemo').then((m) => m.TryItDemo),
);
const CommunityGallery = dynamic(() =>
  import('@/components/home/CommunityGallery').then((m) => m.CommunityGallery),
);

export default function HomePage() {
  const showTryItDemo = process.env.NEXT_PUBLIC_FF_TRY_IT_DEMO === 'true';
  const showCommunityGallery =
    process.env.NEXT_PUBLIC_FF_COMMUNITY_GALLERY === 'true';

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        {showTryItDemo && <TryItDemo />}
        <StyleGallery />
        <RoomExplorer />
        <UseCases />
        <Testimonials />
        <Comparison />
        {showCommunityGallery && <CommunityGallery />}
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
