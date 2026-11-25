import { forwardRef, useId, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./TreeView.css";
import { useText } from "../../lib/i18n";

export type TreeViewSize = "sm" | "md";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: TreeViewSize;
  /** Figma: Multiselect */
  multiselect?: boolean;
  /** Figma: HideLabel */
  hideLabel?: boolean;
  nodes?: TreeNode[];
  label?: string;
  defaultExpanded?: string[];
  onNodeSelect?: (ids: string[]) => void;
  children?: ReactNode;
}

interface Flat {
  node: TreeNode;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
}

function find(list: TreeNode[], id: string): TreeNode | undefined {
  for (const node of list) {
    if (node.id === id) return node;
    const hit = node.children ? find(node.children, id) : undefined;
    if (hit) return hit;
  }
  return undefined;
}

/**
 * A list of items nested in folders that open and close.
 *
 * WAI-ARIA tree pattern. The arrow keys mean something different than in a list.
 *   →  expands a collapsed branch; if it is already expanded, moves to its first child
 *   ←  collapses an expanded branch; if it is already collapsed, moves to its parent
 *   ↑↓ moves between visible items (children of collapsed branches are skipped)
 *
 * One press of Tab moves into the whole tree (roving tabindex), and inside it the arrow keys move.
 */
export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(function TreeView(
  { size = "md", multiselect = false, hideLabel = false, nodes = [], label: labelProp, defaultExpanded = [], onNodeSelect, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.tree;
  const base = useId();
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);
  const [selected, setSelected] = useState<string[]>([]);
  const [focusId, setFocusId] = useState<string>(nodes[0]?.id ?? "");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  // 보이는 항목만 펼쳐 놓는다 — 접힌 가지의 자식은 ↑↓ 이동 대상이 아니다.
  const visible = useMemo(() => {
    const out: Flat[] = [];
    const walk = (list: TreeNode[], depth: number, parentId: string | null) => {
      for (const node of list) {
        const hasChildren = Boolean(node.children?.length);
        out.push({ node, depth, parentId, hasChildren });
        if (hasChildren && expanded.includes(node.id)) walk(node.children ?? [], depth + 1, node.id);
      }
    };
    walk(nodes, 0, null);
    return out;
  }, [nodes, expanded]);

  const focusTo = (id: string) => {
    setFocusId(id);
    refs.current[id]?.focus();
  };

  const toggleExpand = (id: string, next: boolean) => {
    setExpanded((prev) => (next ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  };

  const select = (id: string) => {
    if (find(nodes, id)?.disabled) return;
    const next = multiselect
      ? selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
      : [id];
    setSelected(next);
    onNodeSelect?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>, item: Flat) => {
    const at = visible.findIndex((v) => v.node.id === item.node.id);
    const isOpen = expanded.includes(item.node.id);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = visible[at + 1];
      if (next) focusTo(next.node.id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = visible[at - 1];
      if (prev) focusTo(prev.node.id);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (item.hasChildren && !isOpen) toggleExpand(item.node.id, true);
      else if (item.hasChildren) {
        const child = visible[at + 1];
        if (child) focusTo(child.node.id);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (item.hasChildren && isOpen) toggleExpand(item.node.id, false);
      else if (item.parentId) focusTo(item.parentId);
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = visible[0];
      if (first) focusTo(first.node.id);
    } else if (e.key === "End") {
      e.preventDefault();
      const last = visible[visible.length - 1];
      if (last) focusTo(last.node.id);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(item.node.id);
    }
  };

  const classes = ["ds-treeview", `ds-treeview--${size}`, className].filter(Boolean).join(" ");
  const labelId = `${base}-label`;

  return (
    <div ref={ref} className={classes} data-testid="ds-treeview" {...rest}>
      <span id={labelId} className={hideLabel ? "ds-treeview__sr" : "ds-treeview__label"}>
        {label}
      </span>
      <div role="tree" aria-labelledby={labelId} aria-multiselectable={multiselect || undefined} className="ds-treeview__tree">
        {visible.map((item) => {
          const isOpen = expanded.includes(item.node.id);
          const isSelected = selected.includes(item.node.id);
          return (
            <div
              key={item.node.id}
              role="treeitem"
              ref={(node) => {
                refs.current[item.node.id] = node;
              }}
              className="ds-treeview__item"
              aria-level={item.depth + 1}
              aria-expanded={item.hasChildren ? isOpen : undefined}
              aria-selected={isSelected}
              aria-disabled={item.node.disabled || undefined}
              // roving tabindex — 트리 전체가 Tab 한 번에 들어온다.
              tabIndex={item.node.id === focusId ? 0 : -1}
              style={{ paddingInlineStart: `calc(var(--spacing) * ${3 + item.depth * 4})` }}
              // 가지는 눌러서 펼치고 접는다 — 키보드의 →/← 와 같은 일을 마우스로도 할 수 있어야 한다.
              onClick={() => {
                setFocusId(item.node.id);
                if (item.hasChildren) toggleExpand(item.node.id, !isOpen);
                select(item.node.id);
              }}
              onKeyDown={(e) => onKeyDown(e, item)}
            >
              {item.hasChildren ? (
                <svg className="ds-treeview__chevron" viewBox="0 0 16 16" width="12" height="12" aria-hidden focusable="false">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="ds-treeview__spacer" aria-hidden />
              )}
              <span className="ds-treeview__text">{item.node.label}</span>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
});
