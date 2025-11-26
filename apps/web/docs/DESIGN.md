# Landing Page Design Spec: "Nordic Warmth x Future Living"

## 1. Core Aesthetic: "Warm Futurism"
**Vibe**: A digital sanctuary. It feels like entering a bright, modern, sun-drenched living room. It is high-tech (fast, smart) but deeply human (warm, soft, organic).
**Inspiration**: Swedish minimalism (clean lines, functionality) meets Gen-Z Startup (bento grids, bold typography, "out-of-pocket" creative layouts).

### The Feeling
- **Open**: Extensive whitespace. No clutter. The content breathes.
- **Warm**: Not sterile white. Use "Cloud White" and "Sandstone" bases.
- **Futuristic**: Smooth motion (120ms transitions), glassmorphism accents, pill-shaped interactive elements.

## 2. Typography: The "Startup" Voice
A strong, geometric sans-serif that feels engineered but friendly.

- **Primary Font (Headings)**: **Manrope** or **Plus Jakarta Sans**.
  - *Why*: Geometric, tall x-height, feels like a modern tech product.
  - *Usage*: Bold (700) for headlines, Medium (500) for UI labels.
  - *Styling*: Tight letter-spacing (-0.02em) for that crisp "app" look.
- **Secondary Font (Body)**: **Inter** or **DM Sans**.
  - *Why*: Maximum readability, neutral character.

## 3. Color Palette: "Contrast & Comfort"
Refining the brand palette to fix "overlapping colors" and ensure high-contrast accessibility while maintaining warmth.

| Role | Color Name | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Base** | **Cloud White** | `#FAFAFA` | Main page background (not harsh `#FFFFFF`). |
| **Surface** | **Sandstone** | `#F3EDE4` | Section backgrounds, "Bento" card backgrounds. |
| **Primary** | **Midnight Ink** | `#0F172A` | Text, primary buttons, distinct borders. |
| **Accent** | **Sprint Mint** | `#2AD5C1` | Success states, "New" badges, hover glows. |
| **Warmth** | **Apricot / Clay** | `#FFBCA9` | Soft gradients, illustrations, human elements. |

*Rule*: Never place low-contrast text on colored backgrounds. Use "Midnight Ink" text on "Sandstone" cards.

## 4. UI Components: "Boxes & Breakouts"

### A. The "Bento" Grid (Boxes)
Instead of list items, use modular grid boxes.
- **Style**: Large corner radius (`rounded-2xl` or `rounded-3xl`).
- **Border**: Subtle inside stroke (`border-slate-100`).
- **Hover**: Scale up 1.02x with a soft, colored shadow glow.

### B. "Out-of-Pocket" Banners
Sections that break the grid to create visual interest and "startup energy."
- **Asymmetry**: Text on one side, image bleeding off the screen on the other.
- **Floating Elements**: 3D-style icons or avatars floating above the section background.
- **Marquees**: Infinite scroll text ribbons ("Find home faster • Find home faster") tilting at 2-3 degrees.

### C. Buttons & Inputs
- **Buttons**: Full pill shape (`rounded-full`). High gloss or soft shadow.
- **Search Bar**: A "floating island" design. Heavy drop shadow (`shadow-xl`), completely detached from the background visuals.

## 5. Landing Page Structure

### Section 1: The Hero ("The Warm Entrance")
*Goal: Comfort + Speed.*
- **Layout**: Split screen or Centered with "floating" search.
- **Visual**: A full-width, high-res video or image of a sunlit, happy apartment (not wide angle real estate shot, but lifestyle focused).
- **Headline**: "Find your place. Faster." (Large, 4rem+, Tight leading).
- **Interaction**: The Search Bar is the "door handle." It should be prominent, inviting, and simple (Start typing location...).

### Section 2: The Value Prop (Bento Grid)
*Goal: Explain "Why Us" without reading.*
- **Card 1 (Large)**: "Verified Humans" – Photo of a verified badge + happy user.
- **Card 2 (Tall)**: "Speed" – Graphic of a timeline shrinking.
- **Card 3 (Square)**: "Student Hubs" – University logos.
- **Card 4 (Wide)**: "No Ghosting" – Chat interface mockup showing a reply.

### Section 3: The "Breakout" Banner
*Goal: Brand energy.*
- A tilted section background (Sandstone color).
- **Content**: "Stop scrolling. Start moving."
- **Visual**: 3D house keys or moving boxes floating in space.

### Section 4: Latest Listings (Carousel)
- Clean cards. Photo top, price/location bottom.
- **Interaction**: Horizontal scroll with "snap" physics.

### Section 5: Footer (The Foundation)
- Clean, organized, minimal.
- "Made with ❤️ in Jerusalem."

## 6. Motion & Micro-interactions
- **Load**: Elements fade up + slide in.
- **Hover**: Buttons fill with color; Cards lift.
- **Scroll**: Parallax effect on "floating" images.
