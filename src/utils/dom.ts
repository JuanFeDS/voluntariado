/** Construye elementos vía DOM API (no innerHTML) para que el texto de usuario nunca se interprete como HTML. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]>,
  children?: (Node | string)[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props) Object.assign(node, props);
  children?.forEach((child) => node.append(child));
  return node;
}
