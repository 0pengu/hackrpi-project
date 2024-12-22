type Point = { x: number; y: number };

export class QuadTree {
  private capacity: number; // Max points a node can hold before subdividing
  private bounds: { xMin: number; yMin: number; xMax: number; yMax: number }; // Bounding box
  private points: Point[]; // Points in this node
  private divided: boolean; // Whether this node is divided into sub-quadrants
  private northwest?: QuadTree; // Top-left quadrant
  private northeast?: QuadTree; // Top-right quadrant
  private southwest?: QuadTree; // Bottom-left quadrant
  private southeast?: QuadTree; // Bottom-right quadrant

  constructor(
    xMin: number,
    yMin: number,
    xMax: number,
    yMax: number,
    capacity: number
  ) {
    this.bounds = { xMin, yMin, xMax, yMax };
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  // Insert a point into the QuadTree
  insert(point: Point): boolean {
    // Check if the point is outside the bounds of this node
    if (!this.containsPoint(point)) {
      return false;
    }

    // If there's room and the node is not divided, add the point
    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    // Subdivide if necessary
    if (!this.divided) {
      this.subdivide();
    }

    // Recursively insert into appropriate quadrant
    return (
      this.northwest!.insert(point) ||
      this.northeast!.insert(point) ||
      this.southwest!.insert(point) ||
      this.southeast!.insert(point)
    );
  }

  // Check if a point is within this node's bounds
  private containsPoint(point: Point): boolean {
    const { x, y } = point;
    const { xMin, yMin, xMax, yMax } = this.bounds;
    return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
  }

  // Subdivide this node into four child quadrants
  private subdivide(): void {
    const { xMin, yMin, xMax, yMax } = this.bounds;
    const midX = (xMin + xMax) / 2;
    const midY = (yMin + yMax) / 2;

    this.northwest = new QuadTree(xMin, yMin, midX, midY, this.capacity); // Top-left
    this.northeast = new QuadTree(midX, yMin, xMax, midY, this.capacity); // Top-right
    this.southwest = new QuadTree(xMin, midY, midX, yMax, this.capacity); // Bottom-left
    this.southeast = new QuadTree(midX, midY, xMax, yMax, this.capacity); // Bottom-right

    this.divided = true;
  }

  // Query points within a range
  query(
    range: { xMin: number; yMin: number; xMax: number; yMax: number },
    found: Point[] = []
  ): Point[] {
    // If the range does not intersect this node, return empty
    if (!this.intersectsRange(range)) {
      return found;
    }

    // Check points in this node
    for (const point of this.points) {
      if (
        point.x >= range.xMin &&
        point.x <= range.xMax &&
        point.y >= range.yMin &&
        point.y <= range.yMax
      ) {
        found.push(point);
      }
    }

    // Recursively query children if divided
    if (this.divided) {
      this.northwest!.query(range, found);
      this.northeast!.query(range, found);
      this.southwest!.query(range, found);
      this.southeast!.query(range, found);
    }

    return found;
  }

  // Check if a range intersects this node's bounds
  private intersectsRange(range: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  }): boolean {
    const { xMin, yMin, xMax, yMax } = this.bounds;
    return !(
      (
        range.xMin > xMax || // Range is to the right
        range.xMax < xMin || // Range is to the left
        range.yMin > yMax || // Range is below
        range.yMax < yMin
      ) // Range is above
    );
  }
}
