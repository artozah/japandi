import { Suspense } from 'react';
import { Header } from '@/components/home/Header';
import { Hero } from '@/components/home/Hero';
import { HeroSwitcher } from '@/components/home/HeroSwitcher';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TryItDemo } from '@/components/home/TryItDemo';
import { StyleGallery } from '@/components/home/StyleGallery';
import { RoomExplorer } from '@/components/home/RoomExplorer';
import { UseCases } from '@/components/home/UseCases';
import { Testimonials } from '@/components/home/Testimonials';
import { Comparison } from '@/components/home/Comparison';
import { CommunityGallery } from '@/components/home/CommunityGallery';
import { Pricing } from '@/components/home/Pricing';
import { FAQ } from '@/components/home/FAQ';
import { Footer } from '@/components/home/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<Hero />}>
          <HeroSwitcher />
        </Suspense>
        <HowItWorks />
        <TryItDemo />
        <StyleGallery />
        <RoomExplorer />
        <UseCases />
        <Testimonials />
        <Comparison />
        <CommunityGallery />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
