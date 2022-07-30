class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static from(vector: Vector2D) {
    return new Vector2D(vector.x, vector.y);
  }

  public clear() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public steal(vector: Vector2D) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  public add(vector: Vector2D) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  public im_add(vector: Vector2D) {
    return Vector2D.from(this).add(vector);
  }

  public subtract(vector: Vector2D) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  public im_subtract(vector: Vector2D) {
    return Vector2D.from(this).subtract(vector);
  }

  public multiply(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public im_multiply(s: number) {
    return Vector2D.from(this).multiply(s);
  }

  public divide(s: number) {
    this.x /= s;
    this.y /= s;
    return this;
  }

  public im_divide(s: number) {
    return Vector2D.from(this).divide(s);
  }

  public direction(vector: Vector2D): Vector2D {
    return Vector2D.from(vector).subtract(this);
  }

  public dot(vector: Vector2D): number {
    return vector.x * this.x + vector.y * this.y;
  }

  public angle() {
    return Math.atan2(this.y, this.x);
  }

  public mag(): number {
    return Math.sqrt(this.dot(this));
  }

  public unit() {
    return this.divide(this.mag());
  }
}

export default Vector2D;