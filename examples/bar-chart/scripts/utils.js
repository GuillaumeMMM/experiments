//  Transforms a rect into a rounded path data
export function fullyRoundedRectPath(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);

    return `
    M ${x + radius},${y}
    H ${x + w - radius}
    Q ${x + w},${y} ${x + w},${y + radius}
    V ${y + h - radius}
    Q ${x + w},${y + h} ${x + w - radius},${y + h}
    H ${x + radius}
    Q ${x},${y + h} ${x},${y + h - radius}
    V ${y + radius}
    Q ${x},${y} ${x + radius},${y}
    Z
  `;
}