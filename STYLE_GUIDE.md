# UI/UX Style Guide

This document outlines the visual identity and design principles for the AI transcription comparison application. The goal is to create a visually engaging, modern, and memorable user experience.

## 1. Core Philosophy

The UI will embody a **"Futuristic Neon"** aesthetic. It will be characterized by:

-   **Dark Mode First:** A dark, immersive background to make vibrant elements pop.
-   **Vibrant Accents:** Bright, glowing colors for interactive elements and highlights.
-   **Clean & Minimal:** A focus on clean lines, generous spacing, and uncluttered layouts to ensure usability.
-   **Engaging Micro-interactions:** Subtle animations and hover effects to make the interface feel alive and responsive.

## 2. Color Palette

The palette is designed for high contrast and visual appeal on a dark background.

-   **Background:** `~#0D0C1D` (A deep, dark indigo)
-   **Primary Text:** `~#F0F2F5` (A soft, off-white)
-   **Secondary Text:** `~#A8A29E` (A muted, light gray for less important text)
-   **Borders/Dividers:** `~#374151` (A subtle dark gray)

### Accent Colors (for glows, buttons, and highlights)

-   **Electric Blue:** `~#00FFFF` (Cyan)
-   **Hot Pink:** `~#FF00FF` (Magenta)
-   **Lime Green:** `~#39FF14` (Neon Green)
-   **Vibrant Purple:** `~#9D00FF` (Bright Purple)

These colors should be used sparingly to draw attention to key actions and information. Each transcription service's card can be accented with one of these colors for easy differentiation.

## 3. Typography

-   **Font Family:** **Inter** (from Google Fonts). It's a clean, highly-readable sans-serif font that works well for UIs.
-   **Headings:** `font-bold`, using the Primary Text color.
-   **Body Text:** `font-normal`, using the Primary Text color.
-   **Labels/Metadata:** `font-light`, using the Secondary Text color.

## 4. Component Styling

### Buttons

-   **Base Style:** Dark background, accent-colored text.
-   **Hover/Focus State:** The button will emit a "glow" effect. This can be achieved in Tailwind CSS using a colored `box-shadow`.
    -   *Example CSS:* `box-shadow: 0 0 15px 3px var(--accent-color);`

### File Uploader

-   **Default State:** A large, dashed-border container with instructional text.
-   **Drag-Over State:** The border becomes solid and glows with the Electric Blue accent color. A subtle, glowing background grid can appear inside the dropzone.
-   **Uploading State:** A progress bar, styled with a gradient of the accent colors.

### Transcription Cards

-   **Container:** A card with a semi-transparent background (`rgba(23, 22, 42, 0.5)`), rounded corners, and a thin, 1px border using one of the accent colors.
-   **Header:** Displays the Service Logo and Name, with the name colored to match the card's border accent.
-   **Body:** The transcription text itself, displayed in the Primary Text color.

## 5. Glows & Effects

The signature "glow" effect will be applied primarily using the `box-shadow` and `drop-shadow` filter properties in CSS. This creates a soft, emissive look without being distracting. Effects should be paired with smooth transitions (`transition-all duration-300`) to feel polished.
