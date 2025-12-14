/**
 * Tailwind CSS Configuration
 *
 * Extends Tailwind with GitHub Primer design system tokens.
 * CSS variables are defined in src/index.css
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /**
       * GitHub Primer color palette
       * Uses CSS variables for theming support
       */
      colors: {
        // Canvas (backgrounds)
        canvas: {
          DEFAULT: 'var(--color-canvas-default)',
          subtle: 'var(--color-canvas-subtle)',
          inset: 'var(--color-canvas-inset)',
          overlay: 'var(--color-canvas-overlay)',
        },
        // Border
        border: {
          DEFAULT: 'var(--color-border-default)',
          muted: 'var(--color-border-muted)',
          subtle: 'var(--color-border-subtle)',
        },
        // Foreground (text)
        fg: {
          DEFAULT: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
          'on-emphasis': 'var(--color-fg-on-emphasis)',
        },
        // Accent (blue)
        accent: {
          fg: 'var(--color-accent-fg)',
          emphasis: 'var(--color-accent-emphasis)',
          muted: 'var(--color-accent-muted)',
          subtle: 'var(--color-accent-subtle)',
        },
        // Success (green)
        success: {
          fg: 'var(--color-success-fg)',
          emphasis: 'var(--color-success-emphasis)',
          muted: 'var(--color-success-muted)',
          subtle: 'var(--color-success-subtle)',
        },
        // Danger (red)
        danger: {
          fg: 'var(--color-danger-fg)',
          emphasis: 'var(--color-danger-emphasis)',
          muted: 'var(--color-danger-muted)',
          subtle: 'var(--color-danger-subtle)',
        },
        // Attention (yellow)
        attention: {
          fg: 'var(--color-attention-fg)',
          emphasis: 'var(--color-attention-emphasis)',
          muted: 'var(--color-attention-muted)',
          subtle: 'var(--color-attention-subtle)',
        },
        // Done (purple)
        done: {
          fg: 'var(--color-done-fg)',
          emphasis: 'var(--color-done-emphasis)',
          muted: 'var(--color-done-muted)',
          subtle: 'var(--color-done-subtle)',
        },
        // Neutral
        neutral: {
          emphasis: 'var(--color-neutral-emphasis)',
          'emphasis-plus': 'var(--color-neutral-emphasis-plus)',
          muted: 'var(--color-neutral-muted)',
          subtle: 'var(--color-neutral-subtle)',
        },
      },

      /**
       * GitHub system fonts
       */
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },

      /**
       * GitHub font sizes
       */
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.4' }],
        xl: ['24px', { lineHeight: '1.3' }],
        '2xl': ['32px', { lineHeight: '1.25' }],
      },

      /**
       * GitHub border radius
       */
      borderRadius: {
        DEFAULT: '6px',
        sm: '3px',
        md: '6px',
        lg: '12px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
