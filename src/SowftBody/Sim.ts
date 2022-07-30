import Vector2D from "./Vector2D";

class MassPoint {
  public position: Vector2D;
  public velocity: Vector2D;
  public force: Vector2D;
  public size: number;
  public mass: number;
  public fixed: boolean;

  // Value for storing deltas etc without reinitalising
  private _mem: Vector2D;

  constructor(position: Vector2D, mass: number, size: number, fixed = false) {
    this.position = position;
    this.velocity = new Vector2D(0, 0);
    this.force = new Vector2D(0, 0);
    this.mass = mass;
    this.size = size;
    this.fixed = fixed;

    this._mem = new Vector2D(0, 0);
  }

  collisionAction(masses: MassPoint[]): Vector2D | null {
    // Clone base position
    const position = Vector2D.from(this.position);
    let bounce: boolean = true;

    if(this.position.y > 1) {
      this.position.y = 1;
    } else if(this.position.y < 0) {
      this.position.y = 0;
    } else if(this.position.x < 0) {
      this.position.x = 0;
    } else if(this.position.x > 1) {
      this.position.x = 1;
    } else {
      bounce = false;
    }

    if(bounce) {
      return position.direction(this.position).unit()
    } else {
      return null;
    }
    
    // for (const mass of masses) {
    //   if(mass === this) break;
    //   if(this.position.direction(mass.position).mag() > this.size)
    // }
    
  }

  addForce(appliedForce: Vector2D) {
    this.force.add(appliedForce);
  }

  update(dt: number, masses: MassPoint[]) {
    if(this.fixed) return;
    
    // Gravity
    this.force.add(
      new Vector2D(0.0, 0.5)
    );
    
    // Euler integration
    let velocity_diff = this.force.multiply(dt);
    this.velocity.add(velocity_diff);

    const unit_reflect = this.collisionAction(masses);
    
    // Bounce force
    if(unit_reflect) {
      this.velocity.subtract(unit_reflect.im_multiply(2 * this.velocity.dot(unit_reflect))).divide(2.0);
    }

    let position_diff = this.velocity.im_multiply(this.mass).multiply(dt);
    this.position.add(position_diff);

    this.force.clear();
  }
}

class Spring {
  public A: MassPoint;
  public B: MassPoint;
  public stiffness: number;
  public resting_length: number;
  public damping: number;

  constructor(A: MassPoint, B: MassPoint, stiffness: number, resting_length: number, damping: number) {
    this.A = A;
    this.B = B;
    this.stiffness = stiffness;
    this.resting_length = resting_length;
    this.damping = damping;
  }

  dampen() {
    const direction = this.A.position.direction(this.B.position).unit();
    const velocity_difference = this.B.velocity.im_subtract(this.A.velocity);
    return velocity_difference.dot(direction) * this.damping;
  }

  force() {
    const current_length = this.A.position.direction(this.B.position).mag();
    const diff = current_length - this.resting_length;
    return diff * this.stiffness;
  }

  update(dt: number) {
    const applied_force = this.force() + this.dampen();
    
    const a_applied = this.A.position.direction(this.B.position).unit().multiply(applied_force);
    const b_applied = this.B.position.direction(this.A.position).unit().multiply(applied_force);

    // console.log(b_applied);
    // console.log(a_applied);
    this.A.addForce(a_applied.multiply(dt));
    this.B.addForce(b_applied.multiply(dt));
  }
}

export {
  Spring, MassPoint
}