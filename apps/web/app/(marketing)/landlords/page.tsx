
import { Metadata } from "next";
import Link from "next/link";
import { Check, Calendar, ShieldCheck, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "For Landlords | HomeSprint",
  description: "List your property with peace of mind. Verified tenants, automated scheduling, and zero hassle.",
};

export default function LandlordsPage() {
  return (
    <main className="min-h-screen bg-cloud pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 text-center lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-apricot/20 via-cloud to-cloud" />
        
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-sandstone px-4 py-2 text-sm font-bold text-midnight">
            <span className="mr-2 h-2 w-2 rounded-full bg-mint" />
            Now accepting new properties
          </div>
          <h1 className="font-sans text-5xl font-bold leading-tight text-midnight md:text-7xl">
            Rent your property <br />
            with <span className="text-mint">peace of mind</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-midnight/70 md:text-xl">
            Stop juggling messages and scheduling conflicts. HomeSprint verifies tenants, 
            handles viewings, and streamlines the entire rental process.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login/otp"
              className="inline-flex items-center justify-center rounded-full bg-midnight px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-midnight/90 hover:shadow-float"
            >
              List your property
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-bold text-midnight shadow-sm transition-all hover:bg-sandstone"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits - Bento Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Verified Tenants */}
            <div className="group relative col-span-1 overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all hover:scale-[1.02] hover:shadow-float lg:col-span-2">
              <div className="flex h-full flex-col justify-between">
                <div className="mb-8 max-w-lg">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-mint/10 text-mint">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 font-sans text-3xl font-bold text-midnight">
                    Verified Tenants Only
                  </h3>
                  <p className="text-lg text-midnight/70">
                    We verify identity, income, and rental history before a tenant can even apply. 
                    Say goodbye to time-wasters and hello to reliable renters.
                  </p>
                </div>
                {/* Visual element placeholder */}
                <div className="flex items-center gap-4 rounded-xl bg-sandstone/50 p-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200" />
                    ))}
                  </div>
                  <span className="font-bold text-midnight">100+ Verified Seekers waiting</span>
                </div>
              </div>
            </div>

            {/* Card 2: Automated Scheduling */}
            <div className="group relative overflow-hidden rounded-3xl bg-midnight p-8 text-white transition-all hover:scale-[1.02] hover:shadow-float">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-mint">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-2xl font-bold">
                Automated Scheduling
              </h3>
              <p className="text-white/70">
                Set your availability once. We handle the coordination, reminders, and confirmations.
              </p>
            </div>

            {/* Card 3: Direct Messaging */}
            <div className="group relative overflow-hidden rounded-3xl bg-apricot/20 p-8 transition-all hover:scale-[1.02] hover:shadow-float">
               <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-apricot">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-2xl font-bold text-midnight">
                Direct Messaging
              </h3>
              <p className="text-midnight/70">
                Chat securely with potential tenants through our platform without sharing your personal phone number.
              </p>
            </div>

            {/* Card 4: Smart Matching */}
            <div className="group relative col-span-1 overflow-hidden rounded-3xl bg-sandstone p-8 transition-all hover:scale-[1.02] hover:shadow-float lg:col-span-2">
               <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="flex-1">
                   <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-midnight">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 font-sans text-2xl font-bold text-midnight">
                    Smart Matching
                  </h3>
                  <p className="text-midnight/70">
                    Our algorithm matches your property with tenants who fit your criteria—budget, move-in date, and lifestyle.
                  </p>
                </div>
                 {/* Decorative */}
                 <div className="mt-8 flex-1 rounded-2xl bg-white p-6 shadow-sm md:mt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-mint" />
                        <div className="h-2 w-24 rounded-full bg-sandstone" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-mint" />
                        <div className="h-2 w-32 rounded-full bg-sandstone" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-mint" />
                        <div className="h-2 w-20 rounded-full bg-sandstone" />
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[3rem] bg-midnight px-6 py-20 text-center text-white">
          <h2 className="mb-6 font-sans text-4xl font-bold md:text-5xl">
            Ready to list your property?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-xl text-white/70">
            Join hundreds of landlords in Jerusalem who have switched to a smarter, simpler way to rent.
          </p>
          <Link
            href="/login/otp"
            className="inline-flex items-center rounded-full bg-mint px-10 py-5 text-lg font-bold text-midnight transition-all hover:scale-105 hover:bg-white hover:shadow-glow"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </main>
  );
}

