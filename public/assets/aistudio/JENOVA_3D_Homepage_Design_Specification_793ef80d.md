# JENOVA --- Homepage Visual Design Specification

## 1. Design Overview

**Project:** JENOVA\
**Tagline:** A New Way to Grow Together.\
**Bengali tagline:** নতুন সম্ভাবনা, সবার জন্য।\
**Core message:** Your Community. Your Opportunities. Your Future.

Create a premium, India-inspired, futuristic community-support platform
homepage. The design should combine a bright cinematic Indian landscape,
a central 3D globe, a floating tricolour India model, glowing glass
interface panels, and a clear service journey.

**Reference direction:** Follow the uploaded JENOVA homepage image for
its overall composition, hierarchy, visual atmosphere, and placement of
elements. Rebuild the design as a responsive, functional website rather
than placing the reference image as a page background.

## 2. Overall Visual Style

-   Futuristic, optimistic, welcoming, and community-focused.
-   Bright blue sky with soft clouds and warm sunlight.
-   White and pale-blue environment with deep navy typography.
-   Saffron/orange and green accents inspired by the Indian tricolour.
-   Cyan and turquoise glow effects for 3D elements.
-   Gold highlights for orbital rings and key details.
-   Translucent glassmorphism cards with soft shadows and illuminated
    edges.
-   Rich 3D depth without making the interface crowded.

### Suggested Colour Palette

  Colour         Hex         Usage
  -------------- ----------- ----------------------------------
  Sky Blue       `#70B8F2`   Sky and background accents
  Deep Navy      `#092B55`   Headings and dark UI elements
  Saffron        `#FF8A18`   Hero emphasis and highlights
  White          `#FFFFFF`   Cards and clean surfaces
  India Green    `#138A45`   Community and tricolour accents
  Cyan Glow      `#36E7F2`   3D outlines and interactive glow
  Golden Light   `#FFC45C`   Orbital rings and lighting

## 3. Header and Navigation

Place a clean navigation bar across the top of the page.

### Left side

-   JENOVA logo with a community-inspired symbol.
-   Small tagline: "A New Way to Grow Together."

### Navigation links

-   Home
-   Services
-   AI Assistant
-   Local Support
-   About
-   FAQs
-   Contact

### Right side

-   Light/dark mode toggle.
-   Login button.

### Styling and behaviour

-   Floating, rounded navigation container.
-   Light glassmorphism treatment.
-   Subtle cyan border and soft glow.
-   Clearly visible active navigation state.
-   Smooth hover and focus effects.
-   Responsive mobile navigation menu.

## 4. Hero Section

The hero is the main visual focus and should occupy the first screen on
desktop.

### Left content column

Small trust badge:

**Trusted • Verified • People First**

Main heading:

# Your Community.

# Your Opportunities.

# Your Future.

Emphasise "Your Future" in saffron/orange with a subtle gradient and
animated underline.

Supporting paragraph:

> Discover essential information, government assistance, digital safety
> and new opportunities through one intelligent community platform.

Primary action: **Explore Services**\
Secondary action: **Watch Demo**

Display the Bengali tagline below the buttons:

**নতুন সম্ভাবনা, সবার জন্য।**

### Right 3D visual area

Build a live 3D scene containing:

1.  A large transparent, slowly rotating globe.
2.  A prominent JENOVA identity mark in front of the globe.
3.  Golden orbital rings circling the globe.
4.  A futuristic circular platform beneath the globe.
5.  Floating particles and fine network connections.
6.  A 3D India map with saffron, white, and green sections.
7.  An Ashoka Chakra placed in the white section of the map.
8.  A holographic platform beneath the India model.

The India map and globe should be separate 3D objects so they can be
animated and interacted with independently. Use a geographically
recognisable India silhouette and represent the national flag
respectfully and accurately.

### Floating quick-access panels

Place four small glass panels around the 3D scene:

  Panel   Icon concept          Label
  ------- --------------------- -------------
  1       Shield                Stay Safe
  2       Government building   Get Schemes
  3       Briefcase             Find Jobs
  4       Location pin          Local Help

Each panel should have a floating animation, subtle glow, and hover
interaction.

## 5. Five Service Cards

Place five horizontally aligned glassmorphism cards beneath the hero on
desktop.

### Card 1 --- JENOVA Protect

-   Visual: 3D security shield.
-   Description: Detect suspicious job offers, online fraud and
    potential scams.
-   Action: Learn More.

### Card 2 --- JENOVA Schemes

-   Visual: 3D government building.
-   Description: Discover government schemes and check eligibility.
-   Action: Learn More.

### Card 3 --- JENOVA Checklist

-   Visual: 3D document clipboard.
-   Description: Prepare documents before visiting offices.
-   Action: Learn More.

### Card 4 --- JENOVA Voice

-   Visual: 3D microphone.
-   Description: Get answers in natural Bengali voice.
-   Action: Learn More.

### Card 5 --- JENOVA Local

-   Visual: 3D location marker.
-   Description: Find verified local assistance and support.
-   Action: Learn More.

### Card appearance

-   Translucent blue-tinted glass.
-   Rounded corners.
-   Cyan and golden illuminated borders.
-   Soft shadows and realistic depth.
-   A 3D icon on the left or upper area of each card.
-   Clear title, short description, and visible action.
-   Subtle lift, tilt, and light response on hover.

Each card must link to its actual service page or working feature. Do
not leave the buttons as decorative controls.

## 6. "How JENOVA Works" Journey

Create a wide, light-coloured section below the service cards.

Heading: **How JENOVA Works?**\
Supporting line: **Simple steps. Real support.**

Show five steps connected by animated arrows:

  Step   Label        3D visual          Supporting text
  ------ ------------ ------------------ --------------------------
  1      Discover     Magnifying glass   Find what you need
  2      Understand   Open book          Get clear guidance
  3      Prepare      Clipboard          Get ready with checklist
  4      Act          Rocket             Access services
  5      Follow Up    Handshake          Track progress

Animate the icons and connecting pathway as the user scrolls into this
section.

At the far right, include a dark-blue or deep-teal callout panel:

**Empowering People. Building a Better Tomorrow.**

## 7. Real 3D and Animation Requirements

The website must use real-time 3D objects, not a flattened screenshot or
a static hero image.

### Recommended stack

-   React and TypeScript.
-   Three.js.
-   React Three Fiber.
-   `@react-three/drei`.
-   GSAP and ScrollTrigger.
-   CSS3.
-   Lucide React for interface icons.

### Required 3D elements

-   Globe geometry.
-   India map geometry.
-   Ashoka Chakra model or carefully constructed geometry.
-   Orbital rings.
-   Circular platforms.
-   Floating service icons.
-   Particle systems.
-   Animated lighting and materials.

### Motion and interaction

-   Slow continuous globe rotation.
-   Independent India-map rotation or gentle floating movement.
-   Animated orbital rings.
-   Floating quick-access panels.
-   Subtle particle movement.
-   Mouse-responsive camera or object movement.
-   Drag interaction for selected 3D objects.
-   GSAP scroll-triggered reveals for the service and journey sections.
-   Smooth hover states for cards and buttons.

Motion should feel polished and deliberate, not distracting.

## 8. Responsive Behaviour

### Desktop

-   Two-column hero: text on the left, 3D scene on the right.
-   Five service cards in one row.
-   Five-step journey in one row.

### Tablet

-   Reduce 3D scene complexity and spacing.
-   Allow service cards to wrap into two or three columns.
-   Keep headings and buttons comfortably readable.

### Mobile

-   Stack hero text above the 3D scene.
-   Reduce particle count and rendering resolution.
-   Use a two-column service-card layout where suitable.
-   Stack or horizontally scroll the journey steps accessibly.
-   Keep navigation in a compact mobile menu.
-   Prevent horizontal overflow.

Provide a graceful fallback for devices without WebGL support.

## 9. Accessibility and Performance

-   Respect `prefers-reduced-motion`.
-   Provide text alternatives for meaningful visual content.
-   Ensure keyboard navigation and visible focus states.
-   Maintain readable contrast and comfortable font sizes.
-   Lazy-load 3D scenes where possible.
-   Optimise models, textures, and materials.
-   Limit particle counts and draw calls.
-   Dispose of unused Three.js resources.
-   Avoid forcing 3D rendering on low-powered devices.
-   Keep all important service information available as normal HTML
    content.

## 10. Functional and Content Requirements

-   All navigation links must work.
-   Explore Services must navigate to the services section.
-   Watch Demo must open a real demo or clearly labelled demo
    experience.
-   Login must connect to the existing authentication flow.
-   Each service card must open its actual feature.
-   Theme toggle must change the theme.
-   Mobile navigation must open and close correctly.

Do not invent government partnerships, verified status, statistics,
testimonials, office details, or service availability. Any local
assistance listing must be supported by reliable information and show
its verification status and last-checked date.

## 11. Implementation Guidance for an Existing Project

Before changing code:

1.  Audit the existing JENOVA project and identify its framework and
    component structure.
2.  Locate the current homepage, navigation, service pages,
    authentication, and backend integrations.
3.  Preserve working routes, APIs, database connections, and components.
4.  Identify which existing sections can be reused.

Then implement in stages:

1.  Rebuild the homepage layout and typography to match the reference.
2.  Create the globe, India model, and orbital platform as live 3D
    objects.
3.  Add the floating quick-access panels.
4.  Build the five service cards and connect their routes.
5.  Add the "How JENOVA Works" journey and scroll animations.
6.  Implement responsive layouts and accessibility.
7.  Test every interaction and existing application feature.

Do not rewrite the entire application unnecessarily. Do not replace
functional pages with mockups or placeholder screens.

## 12. Acceptance Checklist

-   [ ] The homepage composition closely follows the reference image.
-   [ ] The JENOVA brand and tagline are visible.
-   [ ] The hero has the correct heading, paragraph, and two calls to
    action.
-   [ ] The globe is a live 3D object.
-   [ ] The India model is recognisable and uses the tricolour
    respectfully.
-   [ ] The Ashoka Chakra is visible in the map's white section.
-   [ ] Orbital rings and floating elements animate smoothly.
-   [ ] Four quick-access panels are visible around the 3D scene.
-   [ ] All five service cards are present and functional.
-   [ ] The five-step journey is present and animated.
-   [ ] Desktop, tablet, and mobile layouts work.
-   [ ] Reduced-motion and WebGL fallback behaviour are supported.
-   [ ] Existing JENOVA functionality remains intact.

**Final objective:** Deliver a polished, responsive, India-inspired
JENOVA homepage that captures the reference image's cinematic 3D look
while remaining a genuine, fast, accessible, and functional website.
