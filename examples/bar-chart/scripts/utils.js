//  Get the path of the rounded version of a rect
export function getRoundedRectPath(rect, radius, offset, referenceRect) {
  const x = rect.x - (referenceRect?.x || 0) - offset;
  const y = rect.y - (referenceRect?.y || 0) - offset;
  const width = rect.width + 2 * offset;
  const height = rect.height + 2 * offset;

  const r = Math.min(radius, width / 2, height / 2);

  return `
    M ${x + r},${y}
    H ${x + width - r}
    Q ${x + width},${y} ${x + width},${y + r}
    V ${y + height - r}
    Q ${x + width},${y + height} ${x + width - r},${y + height}
    H ${x + r}
    Q ${x},${y + height} ${x},${y + height - r}
    V ${y + r}
    Q ${x},${y} ${x + r},${y}
    Z
  `;
}