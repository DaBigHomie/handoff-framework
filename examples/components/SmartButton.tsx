/**
 * SmartButton — Reference Implementation
 *
 * This is a reference component for target projects using the handoff framework.
 * It demonstrates DS-compliant patterns: semantic tokens, GSAP micro-interactions,
 * prefers-reduced-motion, data-testid, and proper TypeScript types.
 *
 * Copy this into your project's src/components/ and adapt to your token system.
 *
 * @see docs/DS-REFERENCE.md — Token Registry
 * @see docs/DS-WORKFLOW.md — GSAP Rules
 */

import { useRef, useEffect } from "react"
import gsap from "gsap"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"

interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant — maps to DS token classes */
  variant?: ButtonVariant
  children: React.ReactNode
}

/**
 * Token-based class map — uses semantic tokens from DS-REFERENCE.
 * No hardcoded hex or px values.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-on-brand hover:bg-brand-primary-hover focus-visible:ring-brand-primary",
  secondary:
    "bg-surface-secondary text-content-primary hover:bg-surface-hover border border-default focus-visible:ring-brand-primary",
  ghost:
    "bg-transparent text-content-primary hover:bg-surface-hover focus-visible:ring-brand-primary",
  destructive:
    "bg-danger text-on-danger hover:bg-danger-hover focus-visible:ring-danger",
}

export function SmartButton({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: SmartButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion (WCAG 2.1 AA)
    const prefersReduced =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : true

    if (prefersReduced || !ref.current || disabled) return

    const el = ref.current
    const onEnter = () => gsap.to(el, { scale: 1.03, duration: 0.15, ease: "power2.out" })
    const onLeave = () => gsap.to(el, { scale: 1, duration: 0.15, ease: "power2.out" })
    const onDown = () => gsap.to(el, { scale: 0.97, duration: 0.08 })
    const onUp = () => gsap.to(el, { scale: 1.03, duration: 0.08 })

    // GSAP context for proper cleanup (DS-WORKFLOW § Required Cleanup)
    const ctx = gsap.context(() => {
      el.addEventListener("mouseenter", onEnter)
      el.addEventListener("mouseleave", onLeave)
      el.addEventListener("mousedown", onDown)
      el.addEventListener("mouseup", onUp)
    })

    return () => {
      el.removeEventListener("mouseenter", onEnter)
      el.removeEventListener("mouseleave", onLeave)
      el.removeEventListener("mousedown", onDown)
      el.removeEventListener("mouseup", onUp)
      ctx.revert()
    }
  }, [disabled])

  return (
    <button
      ref={ref}
      type="button"
      data-testid="smart-button"
      data-variant={variant}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md px-4 py-2",
        "font-medium text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}

export default SmartButton
