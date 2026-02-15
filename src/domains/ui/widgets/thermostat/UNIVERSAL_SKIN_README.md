# Universal Thermostat Skin

A responsive, theme-aware thermostat skin for the Evolusion dashboard.

## Features

- **Responsive**: Adapts to 1x1, 2x1, 1x2, and 2x2 grid sizes automatically.
- **Theming**: Uses global CSS variables for colors, ensuring it fits any dashboard theme.
- **Universal**: Designed to be the default fallback for thermostat entities.

## integration

The skin is integrated into `ThermostatWidget.svelte`.

```svelte
<ThermostatUniversal {entity} {controller} />
```

## API Contract

The skin expects a `ThermostatController` instance which provides:

- `targetTemp`: number
- `hvacMode`: string ('off', 'heat', 'cool', 'auto')
- `minTemp`: number
- `maxTemp`: number
- `step`: number
- `setTemperature(val: number)`: void

## Theme Variables

The skin relies on the following global CSS variables:

| Variable | Description |
|----------|-------------|
| `--theme-bg` | Background color |
| `--theme-surface` | Surface color for cards/elements |
| `--theme-text` | Primary text color |
| `--theme-muted` | Muted/Secondary text color |
| `--theme-accent` | Primary accent color (Heating/Active) |
| `--theme-accent-2` | Secondary accent color (Cooling) |
| `--theme-border` | Border color |
| `--theme-shadow` | Box shadow |

## Interaction

- **1x1**: Displays current temp and dial.
- **2x1**: Adds controls (+/-).
- **1x2**: Large dial, controls at bottom.
- **2x2**: Full view with extra info.

## Accessibility

- `aria-label` on buttons.
- `role="application"` for the widget.
- Support for `prefers-reduced-motion` via CSS transitions.
