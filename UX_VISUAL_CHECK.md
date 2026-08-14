# Theme and motion visual check

## Findings

The light theme renders as an intentional editorial paper surface rather than a token-inverted dark screen. The amber signal color remains legible against the warm canvas, while the generated control-room imagery preserves dark contrast with its existing overlay.

The desktop shell has clear active navigation, a live desk indicator, and a visible light/dark toggle. The generator shows an animated progress glow and stronger card depth. Settings keeps the AI connection controls legible and touchable.

At the mobile viewport, the horizontal workspace rail remains usable, the theme toggle stays visible in the top bar, and the generator stacks compose, pipeline, editor, and footer in a readable order. Long labels truncate in the horizontal rail by design; the main page content remains accessible through the scrollable route.

Reduced motion remains covered by the global `prefers-reduced-motion` rule, disabling non-essential animation while retaining state changes and focus visibility.
