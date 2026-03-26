import { MONO_FONT } from '@/styles/tokens'

const HEADING_STYLE = { fontFamily: MONO_FONT, color: '#1a1a1a' } as const
const BODY_STYLE = { color: '#555', lineHeight: 1.7 } as const
const STRONG_COLOR = '#333'

export default function HowItWorks() {
  return (
    <article className="w-full max-w-[720px] flex flex-col gap-12 pb-16">
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={HEADING_STYLE}
      >
        How it works
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold" style={HEADING_STYLE}>
          What this tool does
        </h2>
        <p className="text-[14px]" style={BODY_STYLE}>
          Colour Systems takes your brand colour and turns it into a complete
          set of design tokens — the exact colour values your app needs for
          backgrounds, text, buttons, status indicators, and more. It generates
          both light and dark mode, checks accessibility automatically, and
          exports code you can drop into your project.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold" style={HEADING_STYLE}>
          The colour wheel
        </h2>
        <p className="text-[14px]" style={BODY_STYLE}>
          The wheel shows all possible hues (colour directions) at a given
          lightness level. The dots on the wheel are your{' '}
          <strong style={{ color: STRONG_COLOR }}>anchors</strong> — they define
          the key hues in your system. Everything else is derived from these
          anchor points.
        </p>
        <p className="text-[14px]" style={BODY_STYLE}>
          <strong style={{ color: STRONG_COLOR }}>Drag an anchor</strong> to
          change where your hues sit on the colour spectrum. The system
          recalculates in real time.
        </p>
        <p className="text-[14px]" style={BODY_STYLE}>
          The faint line connecting the anchors shows the{' '}
          <strong style={{ color: STRONG_COLOR }}>interpolation path</strong> —
          the tool generates intermediate hues along this curve. The easing
          controls (under Configure) change the shape of this path.
        </p>
        <p className="text-[14px]" style={BODY_STYLE}>
          The subtle boundary line shows the{' '}
          <strong style={{ color: STRONG_COLOR }}>gamut limit</strong> — the
          edge of what screens can actually display at this lightness level.
          Colours outside this boundary would be clipped.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold" style={HEADING_STYLE}>
          The scale strips
        </h2>
        <p className="text-[14px]" style={BODY_STYLE}>
          Each hue produces a{' '}
          <strong style={{ color: STRONG_COLOR }}>scale</strong> — a set of 10
          colour steps from very light to very dark. These steps are your raw
          palette. The numbers on each swatch show the WCAG contrast ratio
          between pairs of steps — this tells you which combinations are safe
          for text on backgrounds.
        </p>
        <p className="text-[14px]" style={BODY_STYLE}>
          Steps marked with a purple bar were{' '}
          <strong style={{ color: STRONG_COLOR }}>adjusted</strong> by the
          contrast optimizer — the tool nudged their lightness slightly to
          ensure they meet your chosen accessibility standard.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold" style={HEADING_STYLE}>
          The token preview
        </h2>
        <p className="text-[14px]" style={BODY_STYLE}>
          The preview card shows your colour system applied to real UI patterns:
          surfaces at different depths, a text hierarchy, buttons, status
          badges, an input field, and typography. If this preview looks right,
          your token system will work in production.
        </p>
        <p className="text-[14px]" style={BODY_STYLE}>
          Every colour in the preview comes from a{' '}
          <strong style={{ color: STRONG_COLOR }}>semantic token</strong> — a
          purpose-based name like <code style={{ fontFamily: MONO_FONT, fontSize: 13 }}>text.primary</code>{' '}
          or <code style={{ fontFamily: MONO_FONT, fontSize: 13 }}>accent.primary</code>. These tokens are
          what you export and use in your code.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold" style={HEADING_STYLE}>
          The readiness checklist
        </h2>
        <p className="text-[14px]" style={BODY_STYLE}>
          The coloured pills below the preview are automated quality checks.
          Each one verifies a specific aspect of your colour system:
        </p>
        <ul className="text-[14px] flex flex-col gap-2 pl-5 list-disc" style={BODY_STYLE}>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Text contrast</strong> —
            Can users read body text on your backgrounds?
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Surface hierarchy</strong> —
            Are your background layers visually distinct?
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Status distinguishability</strong> —
            Can users tell success, warning, error, and info apart?
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>On-colour pairs</strong> —
            Does every filled surface have a readable text colour?
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Dark mode coverage</strong> —
            Does dark mode define every role that light mode uses?
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Focus ring visibility</strong> —
            Can keyboard users see where focus is?
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Status token sources</strong> —
            Which status colours come from your palette vs. were generated
            automatically?
          </li>
        </ul>
        <p className="text-[14px]" style={BODY_STYLE}>
          Hover any pill to see the detail.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold" style={HEADING_STYLE}>
          Exporting
        </h2>
        <p className="text-[14px]" style={BODY_STYLE}>
          The Export sheet gives you production-ready code in four formats:
        </p>
        <ul className="text-[14px] flex flex-col gap-2 pl-5 list-disc" style={BODY_STYLE}>
          <li>
            <strong style={{ color: STRONG_COLOR }}>shadcn</strong> — Drop-in
            CSS variables for shadcn/ui + Tailwind. Copy into your{' '}
            <code style={{ fontFamily: MONO_FONT, fontSize: 13 }}>index.css</code> and your entire
            component library works.
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>Tailwind</strong> — Raw
            palette scales as CSS custom properties for direct Tailwind usage.
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>CSS</strong> — Standard CSS
            custom properties.
          </li>
          <li>
            <strong style={{ color: STRONG_COLOR }}>JSON</strong> — Structured
            token data with palette, semantic, and component layers.
          </li>
        </ul>
      </section>
    </article>
  )
}
