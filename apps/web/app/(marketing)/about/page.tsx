
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | HomeSprint",
  description: "Building the future of rental living in Jerusalem.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cloud pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 pb-20 pt-10 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-sans text-5xl font-bold leading-tight text-midnight md:text-7xl">
            We're building the <br />
            <span className="text-mint">future of living</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-midnight/70 md:text-xl">
            HomeSprint is on a mission to make finding a home in Jerusalem as
            inspiring as living in one. No more spreadsheets, no more ghosting.
          </p>
        </div>
      </section>

      {/* Mission Section - Bento Grid style */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="font-sans text-3xl font-bold text-midnight md:text-4xl">
              Our Core Values
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-3xl bg-sandstone p-8 transition-all hover:scale-[1.02] hover:shadow-float">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-mint shadow-sm">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-2xl font-bold text-midnight">
                Deeply Human
              </h3>
              <p className="text-midnight/70">
                We believe technology should bring people together, not keep them
                apart. Every interaction is designed with empathy first.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-midnight p-8 transition-all hover:scale-[1.02] hover:shadow-float">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-mint backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-2xl font-bold text-white">
                Radically Fast
              </h3>
              <p className="text-white/70">
                Time is your most valuable asset. We've optimized every step of the
                rental process to get you moving faster.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-apricot/30 p-8 transition-all hover:scale-[1.02] hover:shadow-float">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-midnight shadow-sm">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-2xl font-bold text-midnight">
                Trust by Default
              </h3>
              <p className="text-midnight/70">
                Verified listings, verified humans. We're building a community
                where safety and transparency are the standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Asymmetric Layout */}
      <section className="bg-white py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-sandstone md:aspect-[4/3]">
                {/* Placeholder for an image */}
                <div className="flex h-full w-full items-center justify-center text-midnight/20">
                    <span className="text-lg font-medium">Jerusalem Lifestyle Image</span>
                </div>
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-white p-6 shadow-float md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-mint/20" />
                  <div>
                    <p className="font-bold text-midnight">Founded in 2024</p>
                    <p className="text-sm text-midnight/60">Jerusalem, Israel</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="mb-6 font-sans text-4xl font-bold leading-tight text-midnight">
                From the heart of <br />
                <span className="text-apricot">Jerusalem</span>.
              </h2>
              <div className="space-y-6 text-lg text-midnight/70">
                <p>
                  We started HomeSprint because we were tired of the rental market
                  status quo. The endless Facebook groups, the unresponsive agents,
                  the outdated websites.
                </p>
                <p>
                  We knew there had to be a better way. A way that combines the
                  warmth of community with the speed of modern technology.
                </p>
                <div className="pt-4">
                  <Link
                    href="/listings"
                    className="inline-flex items-center gap-2 rounded-full bg-midnight px-8 py-4 font-bold text-white transition-all hover:bg-midnight/90 hover:shadow-float"
                  >
                    Find your home
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

