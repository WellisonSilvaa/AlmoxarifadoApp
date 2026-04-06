# Design System Strategy: Precision Logistics & Tonal Depth

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Architect"**

Logistics is a symphony of movement, precision, and reliability. To elevate this design system beyond the generic "admin dashboard" aesthetic, we are moving away from flat, boxed-in layouts toward a style defined by **Tonal Architecture**. This approach utilizes layered surfaces and high-performance typography to create an environment that feels both industrial and premium.

The design breaks the "template" look by favoring intentional white space and **Asymmetric Balance**. We avoid rigid, grid-locked borders in favor of a "flowing" interface where data is grouped by depth rather than lines. This reflects the high-performance nature of warehouse management: fast, fluid, and focused.

---

## 2. Colors & Surface Philosophy
The palette is rooted in **Corporate Red (#E31B23)** for action and urgency, balanced by a sophisticated spectrum of greys that provide a calm, professional backdrop.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. To define boundaries, designers must use **Background Color Shifts**. 
*   Place a `surface-container-low` component on a `surface` background to define a zone.
*   Use `surface-container-highest` only for the most critical floating utility panels.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
*   **Base Layer:** `surface` (#F8F9FA) - The warehouse floor.
*   **Secondary Zones:** `surface-container-low` (#F3F4F5) - Sub-navigation or grouping areas.
*   **Interactive Cards:** `surface-container-lowest` (#FFFFFF) - These should sit "on top" of lower-tier surfaces to naturally draw the eye.

### Signature Textures: Glass & Gradients
To provide a "soul" to the corporate aesthetic:
*   **The Velocity Gradient:** For entry screens and hero CTAs, use a linear gradient from `primary` (#B90014) to `primary_container` (#E31B23) at a 135-degree angle.
*   **The Glass Overlay:** Floating action buttons or top-bar navigations should utilize `surface_container_lowest` with a 80% opacity and a `20px` backdrop-blur. This keeps the user grounded in their current context.

---

## 3. Typography: The Editorial Scale
We use a dual-font system to balance industrial authority with functional readability.

*   **Display & Headlines (Manrope):** Chosen for its modern, geometric structure. Large scales (Display-LG to Headline-SM) should be used with tight letter-spacing (-0.02em) to create an "Editorial" feel that commands attention in warehouse environments.
*   **Body & Labels (Inter):** The workhorse font. Inter’s high x-height ensures that part numbers, quantities, and SKU codes remain legible under harsh lighting or on the move.

**Hierarchy Intent:** 
Use `display-md` for high-level metrics (e.g., "Total Shipments"). Use `label-md` in all-caps with 5% letter-spacing for category headers to create a professional, structured metadata look.

---

## 4. Elevation & Depth
In this system, depth is a functional tool, not a decoration.

### The Layering Principle
Achieve hierarchy through **Tonal Layering**. Instead of drawing a box around a list, change the background of the list container to `surface-container-low`. The contrast between `#F8F9FA` and `#F3F4F5` is enough to signal a functional shift without adding visual clutter.

### Ambient Shadows
Shadows are reserved for "Floating" elements only (Modals, FABs). 
*   **Specs:** Blur: `24px`, Y-Offset: `8px`, Spread: `0`.
*   **Color:** Use the `on_surface` color at `6%` opacity. Never use pure black shadows; they feel "dirty" against the `surface_bright` background.

### The "Ghost Border" Fallback
If a border is required (e.g., high-density data tables), use a **Ghost Border**:
*   **Stroke:** 1px
*   **Color:** `outline_variant` at `20%` opacity.
*   **Result:** A whisper of a line that guides the eye without trapping the content.

---

## 5. Components

### Buttons & Inputs
*   **Primary Action:** Use the "Velocity Gradient" with `DEFAULT` (18px) rounded corners. Text should be `on_primary`.
*   **Secondary Action:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Input Fields:** Use `surface_container_highest` for the field background. When focused, use a 2px `primary` ghost-border (20% opacity).

### Cards & Lists
*   **Forbidden:** Horizontal divider lines.
*   **Solution:** Use `24px` vertical spacing (from the spacing scale) or alternate `surface` and `surface-container-low` backgrounds for list items.
*   **Rounding:** All cards must use `DEFAULT` (1rem/18px) or `md` (1.5rem) rounding to soften the "Corporate Grey" aesthetic and make the app feel modern.

### Logistics-Specific Components
*   **The Status Pill:** High-contrast chips using `primary_fixed` for background and `on_primary_fixed` for text. These represent "Urgent" or "High Priority" items.
*   **The Progress Track:** A thick, `xl` rounded track using `surface_dim` with a `primary` fill. Avoid thin lines; the track should feel substantial.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use white space as a structural element. If an element feels crowded, increase the padding rather than adding a border.
*   **Do** use `manrope` for numbers. In logistics, numbers are data points; they should feel bold and intentional.
*   **Do** leverage `surface_container_lowest` for elements the user needs to touch/interact with most.

### Don’t:
*   **Don’t** use 100% opaque black for text. Use `on_surface` or `on_secondary_fixed_variant` to maintain a high-end, softened contrast.
*   **Don’t** use "Sharp" corners. The 18px (`DEFAULT`) radius is mandatory to maintain the system's approachable yet professional tone.
*   **Don’t** stack more than three layers of depth. If you need a fourth layer, use a color shift, not a shadow.

### Accessibility Note:
Ensure that all `primary` red text on `surface` backgrounds meets WCAG AA standards. When in doubt, use `primary_fixed_variant` for text-based alerts to ensure legibility for operators in low-light warehouse conditions.