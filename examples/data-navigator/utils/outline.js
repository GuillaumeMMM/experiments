import { curveLinearClosed, line, polygonHull } from "d3";

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

//  Get the path of the hull around a group of rects
export function getRoundedPolygonHull(rects, offset, referenceRect) {
    const points = rects.map(rect => {
        return [
            [rect.x - offset, rect.y - offset],
            [rect.x + rect.width + offset, rect.y + rect.height + offset],
            [rect.x + rect.width + offset, rect.y - offset],
            [rect.x - offset, rect.y + rect.height + offset]]
    }).flat(1).map(point => [point[0] - (referenceRect?.x || 0), point[1] - (referenceRect?.y || 0)])

    const lineGenerator = line().curve(curveLinearClosed);

    return lineGenerator(polygonHull(points));
}