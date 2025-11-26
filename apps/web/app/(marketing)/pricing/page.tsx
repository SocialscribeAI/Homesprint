
import { Metadata } from "next";
import Link from "next/link";
import { Check, X as XIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | HomeSprint",
  description: "Simple, transparent pricing for landlords and seekers.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-cloud pt-24 pb-20">
      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <h1 className="font-sans text-5xl font-bold text-midnight md:text-7xl">
          Simple, transparent <br />
          <span className="text-mint">pricing</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-midnight/70">
          No hidden fees. No surprise charges. Just the tools you need to find
          your next home or tenant.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Seeker Plan */}
            <div className="relative flex flex-col rounded-3xl bg-white p-8 shadow-sm transition-all hover:scale-[1.02] hover:shadow-float">
              <div className="mb-6">
                <h3 className="font-sans text-2xl font-bold text-midnight">Seeker</h3>
                <p className="text-midnight/60">For those looking for a home</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-midnight">₪0</span>
                <span className="text-midnight/60">/forever</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Unlimited searches</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Verified listings only</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Direct messaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Application tracking</span>
                </li>
              </ul>
              <Link
                href="/listings"
                className="block w-full rounded-full border-2 border-midnight bg-transparent py-4 text-center font-bold text-midnight transition-colors hover:bg-midnight hover:text-white"
              >
                Start Searching
              </Link>
            </div>

            {/* Landlord Starter */}
            <div className="relative flex flex-col rounded-3xl bg-white p-8 shadow-sm transition-all hover:scale-[1.02] hover:shadow-float border-2 border-transparent hover:border-mint/50">
              <div className="mb-6">
                <h3 className="font-sans text-2xl font-bold text-midnight">Landlord Starter</h3>
                <p className="text-midnight/60">Perfect for single properties</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-midnight">Free</span>
                <span className="text-midnight/60">/during pilot</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">1 Active listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Tenant verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Automated scheduling</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-midnight/80">Standard support</span>
                </li>
              </ul>
              <Link
                href="/login/otp"
                className="block w-full rounded-full bg-midnight py-4 text-center font-bold text-white transition-all hover:bg-midnight/90 hover:shadow-glow"
              >
                List Free
              </Link>
            </div>

            {/* Landlord Pro */}
            <div className="relative flex flex-col overflow-hidden rounded-3xl bg-midnight p-8 text-white shadow-float transition-all hover:scale-[1.02]">
              <div className="absolute top-0 right-0 rounded-bl-2xl bg-mint px-4 py-1 text-xs font-bold text-midnight">
                COMING SOON
              </div>
              <div className="mb-6">
                <h3 className="font-sans text-2xl font-bold">Landlord Pro</h3>
                <p className="text-white/60">For portfolios and agents</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold">₪49</span>
                <span className="text-white/60">/month</span>
              </div>
              <ul className="mb-8 space-y-4 flex-1">
                 <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-white/80">Unlimited listings</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-white/80">Featured placement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-white/80">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-white/80">Priority support</span>
                </li>
              </ul>
              <button
                disabled
                className="block w-full cursor-not-allowed rounded-full bg-white/10 py-4 text-center font-bold text-white/50"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Snippet */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-3xl">
           <h2 className="mb-12 text-center font-sans text-3xl font-bold text-midnight">
            Common Questions
          </h2>
          <div className="space-y-6">
             <div className="rounded-2xl border border-sandstone p-6">
               <h3 className="mb-2 font-bold text-midnight">Is it really free for seekers?</h3>
               <p className="text-midnight/70">Yes. We believe you shouldn't have to pay to find a place to live.</p>
             </div>
             <div className="rounded-2xl border border-sandstone p-6">
               <h3 className="mb-2 font-bold text-midnight">How do you verify tenants?</h3>
               <p className="text-midnight/70">We use a secure identity verification process combined with income verification to ensure trust and safety.</p>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
