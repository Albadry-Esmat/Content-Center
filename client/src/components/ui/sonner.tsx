import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "../../contexts/ThemeContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-surface-raised)",
          "--normal-text": "var(--color-text)",
          "--normal-border": "var(--color-border-strong)",
          "--success-bg": "color-mix(in srgb, var(--color-success) 16%, var(--color-surface-raised))",
          "--success-text": "var(--color-success)",
          "--success-border": "color-mix(in srgb, var(--color-success) 58%, var(--color-border))",
          "--info-bg": "color-mix(in srgb, var(--color-info) 16%, var(--color-surface-raised))",
          "--info-text": "var(--color-info)",
          "--info-border": "color-mix(in srgb, var(--color-info) 58%, var(--color-border))",
          "--warning-bg": "color-mix(in srgb, var(--color-warning) 16%, var(--color-surface-raised))",
          "--warning-text": "var(--color-warning)",
          "--warning-border": "color-mix(in srgb, var(--color-warning) 62%, var(--color-border))",
          "--error-bg": "color-mix(in srgb, var(--color-danger) 16%, var(--color-surface-raised))",
          "--error-text": "var(--color-danger)",
          "--error-border": "color-mix(in srgb, var(--color-danger) 68%, var(--color-border))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
