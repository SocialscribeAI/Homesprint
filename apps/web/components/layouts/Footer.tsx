import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-16 border-t border-sandstone">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Brand Column */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="h-8 w-8 rounded-lg bg-midnight flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110">
                H
              </div>
              <span className="font-sans text-xl font-bold text-midnight tracking-tight">
                HomeSprint
              </span>
            </Link>
            <p className="text-midnight/50 leading-relaxed text-sm">
              Building the future of renting in Israel. <br />
              Starting right here in Jerusalem.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-midnight text-sm uppercase tracking-wider">Company</h4>
              <Link href="/about" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                About
              </Link>
              <Link href="/careers" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Careers
              </Link>
              <Link href="/contact" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-midnight text-sm uppercase tracking-wider">Legal</h4>
              <Link href="/legal/terms" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cookies" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Cookies
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-midnight text-sm uppercase tracking-wider">Social</h4>
              <Link href="#" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Instagram
              </Link>
              <Link href="#" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-sm text-midnight/60 hover:text-mint transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-sandstone flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-midnight/40">
          <p>© {currentYear} HomeSprint. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-apricot fill-apricot animate-pulse" />
            <span>in Jerusalem</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


