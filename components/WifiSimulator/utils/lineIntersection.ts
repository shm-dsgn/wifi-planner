// Line segment intersection detection using the cross-product method

interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
  
  /**
   * Determines if two line segments intersect
   * @param line1 First line segment
   * @param line2 Second line segment
   * @returns Boolean indicating whether the lines intersect
   */
  export const lineIntersect = (line1: Line, line2: Line): boolean => {
    // Calculate direction vectors
    const dx1 = line1.x2 - line1.x1;
    const dy1 = line1.y2 - line1.y1;
    const dx2 = line2.x2 - line2.x1;
    const dy2 = line2.y2 - line2.y1;
    
    // Calculate the determinant
    const determinant = dx1 * dy2 - dy1 * dx2;
    
    // Lines are parallel if determinant is zero (or very close to zero)
    if (Math.abs(determinant) < 0.001) {
      return false;
    }
    
    // Calculate the parameters (t, s) for the intersection point
    const t = ((line2.x1 - line1.x1) * dy2 - (line2.y1 - line1.y1) * dx2) / determinant;
    const s = ((line2.x1 - line1.x1) * dy1 - (line2.y1 - line1.y1) * dx1) / determinant;
    
    // Check if the intersection point is within both line segments
    return t >= 0 && t <= 1 && s >= 0 && s <= 1;
  };
  
  /**
   * Finds the intersection point of two lines
   * @param line1 First line segment
   * @param line2 Second line segment
   * @returns The intersection point or null if lines don't intersect
   */
  export const getIntersectionPoint = (line1: Line, line2: Line): { x: number, y: number } | null => {
    if (!lineIntersect(line1, line2)) {
      return null;
    }
    
    // Calculate direction vectors
    const dx1 = line1.x2 - line1.x1;
    const dy1 = line1.y2 - line1.y1;
    const dx2 = line2.x2 - line2.x1;
    const dy2 = line2.y2 - line2.y1;
    
    // Calculate the determinant
    const determinant = dx1 * dy2 - dy1 * dx2;
    
    // Calculate the parameter t for the intersection point
    const t = ((line2.x1 - line1.x1) * dy2 - (line2.y1 - line1.y1) * dx2) / determinant;
    
    // Calculate the intersection point
    return {
      x: line1.x1 + t * dx1,
      y: line1.y1 + t * dy1
    };
  };
  
  /**
   * Calculates the distance between a point and a line segment
   * @param x Point x-coordinate
   * @param y Point y-coordinate
   * @param line Line segment
   * @returns Distance from point to line
   */
  export const pointToLineDistance = (x: number, y: number, line: Line): number => {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const lineLength = Math.sqrt(dx * dx + dy * dy);
    
    // If line is just a point, return distance to that point
    if (lineLength < 0.001) {
      return Math.sqrt((x - line.x1) ** 2 + (y - line.y1) ** 2);
    }
    
    // Calculate distance from point to line using the formula:
    // distance = |cross_product(line_vector, point_vector)| / |line_vector|
    const crossProduct = Math.abs((x - line.x1) * dy - (y - line.y1) * dx);
    return crossProduct / lineLength;
  };
  
  /**
   * Calculates the closest point on a line segment to a given point
   * @param x Point x-coordinate
   * @param y Point y-coordinate
   * @param line Line segment
   * @returns The closest point on the line segment
   */
  export const closestPointOnLine = (x: number, y: number, line: Line): { x: number, y: number } => {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const lineLength = dx * dx + dy * dy;
    
    // If line is just a point, return that point
    if (lineLength < 0.001) {
      return { x: line.x1, y: line.y1 };
    }
    
    // Calculate the projection of the point onto the line
    const t = ((x - line.x1) * dx + (y - line.y1) * dy) / lineLength;
    
    // Clamp t to [0, 1] to ensure the point is on the line segment
    const clampedT = Math.max(0, Math.min(1, t));
    
    // Calculate the closest point
    return {
      x: line.x1 + clampedT * dx,
      y: line.y1 + clampedT * dy
    };
  };