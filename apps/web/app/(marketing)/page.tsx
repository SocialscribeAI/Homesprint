"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ArrowRight, CheckCircle2, Clock, GraduationCap, MapPin, Heart, Key } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

// Animation Variants - Tuned for "Warm Future"
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } // Soft "spring-like" ease
  }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } }
};

const floatAnimation = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 2, -2, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  }
};

export default function MarketingHome() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col overflow-x-hidden bg-cloud selection:bg-mint selection:text-white">
      
      {/* Section 1: The Hero ("The Warm Entrance") */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 -mt-20">
        {/* Organic Background Blobs - Jerusalem Stone & Mint */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-[10%] left-[10%] h-[600px] w-[600px] rounded-full bg-sandstone/40 blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[20%] right-[5%] h-[500px] w-[500px] rounded-full bg-apricot/10 blur-[120px]" 
          />
          <div className="absolute bottom-0 left-[30%] h-[400px] w-[800px] rounded-full bg-mint/5 blur-[100px]" />
        </div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-midnight/5 bg-white/50 px-4 py-1.5 text-sm font-medium text-midnight/60 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
              </span>
              Live in Jerusalem
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className="font-sans text-5xl font-extrabold tracking-tight text-midnight md:text-7xl lg:text-8xl leading-[1.1]"
          >
            Find your place. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-midnight to-midnight/70 relative inline-block">
              Without the chase.
              <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-6 text-mint" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="mx-auto mt-8 max-w-2xl text-lg font-medium text-midnight/60 md:text-xl leading-relaxed"
          >
            The student-first rental sanctuary. Verified landlords, roommate matching, and zero ghosting. <br className="hidden md:block"/> Finally, a way to move that feels like home.
          </motion.p>

          {/* Floating Island Search Bar - Glassmorphism */}
          <motion.div 
            variants={fadeInUp}
            className="mx-auto mt-12 w-full max-w-xl"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mint via-apricot to-mint opacity-40 blur-lg transition duration-500 group-hover:opacity-60 group-hover:blur-xl" />
              
              <div className="relative flex items-center p-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full shadow-float transition-transform duration-300 hover:scale-[1.01]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sandstone/50 text-midnight">
                  <MapPin className="h-5 w-5" />
                </div>
                <input 
                  type="text" 
                  placeholder="Rehavia, Nachlaot, French Hill..." 
                  className="h-full w-full bg-transparent px-4 text-lg text-midnight placeholder:text-midnight/30 focus:outline-none"
                />
                <button className="hidden sm:block shrink-0 rounded-full bg-midnight px-8 py-3.5 font-sans font-bold text-white transition-all hover:bg-midnight/90 hover:shadow-lg active:scale-95">
                  Search
                </button>
                <button className="sm:hidden shrink-0 rounded-full bg-midnight p-3.5 text-white">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-midnight/50">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-mint" /> 100% Verified Humans</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-mint" /> No Hidden Fees</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-mint" /> Student Friendly</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Section 2: The Value Prop (Bento Grid) - "The Safe Hub" */}
      <section className="relative z-20 bg-sandstone/30 px-6 py-32 rounded-t-[3rem] -mt-10 border-t border-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="font-sans text-3xl font-bold text-midnight md:text-5xl">Built for students,<br/>trusted by everyone.</h2>
            <p className="mt-4 text-lg text-midnight/60">We stripped away the noise of Facebook groups and the chaos of Yad2. This is renting designed for peace of mind.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2 h-auto md:h-[600px]">
            
            {/* Card 1: Verified Humans (Large) */}
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
              className="group relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-[2.5rem] border border-white bg-white p-10 shadow-sm transition-all"
            >
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-mint/10 blur-3xl transition-all group-hover:bg-mint/20" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sandstone px-4 py-1.5 text-sm font-bold text-midnight">
                    <CheckCircle2 className="h-4 w-4 text-mint" /> Safety First
                  </div>
                  <h3 className="mt-6 font-sans text-4xl font-bold tracking-tight">Real People Only.</h3>
                  <p className="mt-4 max-w-md text-lg text-midnight/60 leading-relaxed">
                    We verify every single lister via phone and email. Say goodbye to bots, scams, and creepy DMs.
                  </p>
                </div>
                
                {/* Mock UI Element */}
                <div className="mt-10 flex items-center gap-4 rounded-2xl bg-sandstone/30 p-4 border border-white/60 backdrop-blur-md max-w-md">
                   <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white shadow-sm" />
                   <div className="flex-1 min-w-0">
                      <div className="h-4 w-32 rounded-full bg-midnight/10 mb-2.5" />
                      <div className="h-3 w-20 rounded-full bg-midnight/5" />
                   </div>
                   <div className="shrink-0 flex gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-mint">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Speed */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="col-span-1 rounded-[2.5rem] bg-midnight p-10 text-white shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-mint/20 blur-3xl rounded-full" />
              <Clock className="h-10 w-10 text-mint mb-6" />
              <h3 className="font-sans text-2xl font-bold">Match in days.</h3>
              <p className="mt-3 text-white/70 leading-relaxed">Our algorithm sorts by move-in date and lifestyle, not just price.</p>
            </motion.div>

            {/* Card 3: Student Hubs */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="group col-span-1 rounded-[2.5rem] border border-white bg-white p-10 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sandstone/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <GraduationCap className="h-12 w-12 text-apricot mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-sans text-xl font-bold">Campus Hubs</h3>
              <p className="mt-2 text-midnight/60">Hebrew U • Bezalel • Hadassah</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 3: The "Breakout" Banner - "Student Warmth + Future" */}
      <section className="relative overflow-hidden bg-midnight py-40">
        <div className="absolute inset-0 opacity-20">
            {/* Animated Grid Lines could go here */}
            <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/20 blur-[150px]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="max-w-xl relative">
             <motion.div 
               variants={floatAnimation}
               className="absolute -top-12 -left-12 text-6xl opacity-20 rotate-[-15deg]"
             >
               🔑
             </motion.div>
             
             <h2 className="font-sans text-5xl font-bold text-white md:text-7xl leading-[1.1] tracking-tight">
               Stop scrolling. <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint to-white">Start living.</span>
             </h2>
             <p className="mt-8 text-xl text-white/80 leading-relaxed max-w-md">
               Join the thousands of students who found their home without the headache. Fast, safe, and actually kind of fun.
             </p>
             <div className="mt-10 flex gap-4">
               <button className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-bold text-midnight transition-all hover:bg-mint hover:text-white hover:scale-105 hover:shadow-glow">
                 Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
               </button>
               <button className="px-8 py-4 font-bold text-white hover:text-mint transition-colors">
                 How it works
               </button>
             </div>
          </div>
          
          {/* "Out of pocket" 3D Element */}
          <motion.div 
            style={{ y: yParallax }}
            className="relative"
          >
             <motion.div 
               animate={{ y: [0, -30, 0], rotate: [6, 3, 6] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="relative h-80 w-80 md:h-[500px] md:w-[500px] bg-gradient-to-br from-sandstone to-white rounded-[3rem] border-8 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
             >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-80 mix-blend-multiply transition-transform duration-10000 hover:scale-110" />
                
                {/* Floating Emojis for "Student Warmth" */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }} 
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute top-10 right-10 rounded-2xl bg-white p-4 shadow-xl text-4xl"
                >
                  🏡
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-10 left-10 rounded-2xl bg-white p-4 shadow-xl text-4xl"
                >
                  🎓
                </motion.div>

                {/* Center Badge */}
                <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-apricot fill-apricot" />
                    <span className="text-sm font-bold text-midnight">Match Found!</span>
                  </div>
                  <div className="text-xs text-midnight/60">"Finally a roommate who cleans dishes."</div>
                </div>

             </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
