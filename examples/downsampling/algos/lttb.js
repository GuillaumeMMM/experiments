
// Function from https://rajnandan.com/posts/largest-triangle-three-buckets-downsampling/
export function largestTriangleThreeBuckets(
    data,
    bucketSize
) {
    const dataLength = data.length;
    const sampled = [];

    // Always include the first point
    sampled.push(data[0]);

    // Bucket size. Leave room for start and endpoints
    const threshold = (dataLength - 2) / bucketSize;

    // Index of currently selected point in previous bucket
    let a = 0;

    for (let i = 0; i < threshold - 2; i++) {
        // Calculate point average for next bucket (used as point C in triangle)
        let avgX = 0;
        let avgY = 0;

        const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
        const avgRangeEnd = Math.min(
            Math.floor((i + 2) * bucketSize) + 1,
            dataLength
        );
        const avgRangeLength = avgRangeEnd - avgRangeStart;

        for (let j = avgRangeStart; j < avgRangeEnd; j++) {
            avgX += data[j].x;
            avgY += data[j].y;
        }
        avgX /= avgRangeLength;
        avgY /= avgRangeLength;

        // Get the range for this bucket
        const rangeStart = Math.floor(i * bucketSize) + 1;
        const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

        // Point a is the previously selected point
        const pointA = data[a];

        let maxArea = -1;
        let maxAreaPoint = 0;

        // Find point in current bucket that forms largest triangle
        for (let j = rangeStart; j < rangeEnd; j++) {
            // Calculate triangle area using the cross product formula
            // area = |x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)| / 2
            const area = Math.abs(
                (pointA.x - avgX) * (data[j].y - pointA.y) -
                (pointA.x - data[j].x) * (avgY - pointA.y)
            ) * 0.5;

            if (area > maxArea) {
                maxArea = area;
                maxAreaPoint = j;
            }
        }

        sampled.push(data[maxAreaPoint]);
        a = maxAreaPoint; // This point is the next "point A"
    }

    // Always include the last point
    sampled.push(data[dataLength - 1]);

    return sampled;
}