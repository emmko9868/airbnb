import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import "./Navigation.css";

export interface NavigationSection {
  id: string;
  label: string;
  placeholder: string;
}

export interface NavigationProps extends HTMLAttributes<HTMLDivElement> {
  sections?: NavigationSection[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  onSearch?: () => void;
  disabled?: boolean;
}

const defaultSections: NavigationSection[] = [
  { id: "where", label: "Where", placeholder: "Search destinations" },
  { id: "checkin", label: "Check-in", placeholder: "Add dates" },
  { id: "checkout", label: "Check-out", placeholder: "Add dates" },
  { id: "who", label: "Who", placeholder: "Add guests" },
];

const Divider = () => (
  <div className="ds-navigation__divider" aria-hidden="true">
    <svg
      width="25"
      height="1"
      viewBox="0 0 25 1"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line y1="0.5" x2="25" y2="0.5" stroke="currentColor" />
    </svg>
  </div>
);

const SearchIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="24" fill="currentColor" className="ds-navigation__search-bg" />
    <circle cx="22.5" cy="22.5" r="5.98611" stroke="white" strokeWidth="2.97222" />
    <line x1="31.9492" y1="32.5508" x2="25.5852" y2="26.1869" stroke="white" strokeWidth="2.97222" />
  </svg>
);

export const Navigation = forwardRef<HTMLDivElement, NavigationProps>(function Navigation(
  {
    sections = defaultSections,
    activeSection,
    onSectionClick,
    onSearch,
    disabled = false,
    className,
    ...rest
  },
  ref,
) {
  const classes = ["ds-navigation", disabled && "ds-navigation--disabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-navigation" {...rest}>
      {sections.map((section, index) => (
        <div key={section.id} className="ds-navigation__section-wrapper">
          <button
            type="button"
            className={[
              "ds-navigation__section",
              activeSection === section.id && "ds-navigation__section--active",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            onClick={() => onSectionClick?.(section.id)}
            data-testid={`ds-navigation-section-${section.id}`}
          >
            <span className="ds-navigation__label">{section.label}</span>
            <span className="ds-navigation__placeholder">{section.placeholder}</span>
          </button>
          {index < sections.length - 1 && <Divider />}
        </div>
      ))}
      <button
        type="button"
        className="ds-navigation__search"
        disabled={disabled}
        onClick={onSearch}
        data-testid="ds-navigation-search"
        aria-label="Search"
      >
        <SearchIcon />
      </button>
    </div>
  );
});
