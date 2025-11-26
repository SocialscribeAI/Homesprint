"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/listings", label: "Find a Home" },
    { href: "/landlords", label: "For Landlords" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="h-8 w-8 rounded-lg bg-midnight flex items-center justify-center text-white font-bold text-lg">
            H
          </div>
          <span className="font-sans text-xl font-bold text-midnight tracking-tight">
            HomeSprint
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition-colors hover:text-mint",
                pathname === link.href ? "text-mint font-bold" : "text-midnight/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login/otp"
            className="text-sm font-bold text-midnight hover:text-mint transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login/otp"
            className="rounded-full bg-midnight px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-midnight/90 hover:shadow-glow"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden z-50 text-midnight"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 bg-white p-6 pt-24 shadow-xl md:hidden border-b border-sandstone"
            >
              <nav className="flex flex-col gap-6 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-midnight/80 hover:text-mint"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 mt-4 border-t border-sandstone pt-6">
                  <Link
                    href="/login/otp"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-midnight px-4 py-3 font-bold text-midnight"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login/otp"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-midnight px-4 py-3 font-bold text-white"
                  >
                    Sign up
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}


