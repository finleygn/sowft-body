import './style.css'
import { MassPoint, Spring } from './SowftBody/Sim';
import Vector2D from './SowftBody/Vector2D';

const root_canvas = document.getElementById("rootcvs") as HTMLCanvasElement;

const rect = root_canvas.getBoundingClientRect();
root_canvas.width = rect.width;
root_canvas.height = rect.height;

if(!root_canvas) {
  throw new Error("No canvas present");
}

const ctx = root_canvas.getContext('2d');

//

const point_count = 10;
const points: MassPoint[] = [];
const springs: Spring[] = [];

const createPressureStructure = () => {
  for (let i = 0; i < point_count; i++) {
    const vec = new Vector2D(
      0.5 + (Math.sin((i / point_count) * (Math.PI * 2))) / 5,
      0.5 + (Math.cos((i / point_count) * (Math.PI * 2))) / 5
    );
    points.push(new MassPoint(
      vec,
      1,
      0.05
    ));
  }

  for (let i = 0; i < points.length; i++) {
    springs.push(new Spring(
      points[i % (points.length)], points[(i + 1) % (points.length)],
      200,
      0.1,
      10
    ));
  }
}

const createBoxStructure = () => {
  points.push(new MassPoint(new Vector2D(0.4, 0.4), 0.5, 0.05));
  points.push(new MassPoint(new Vector2D(0.5, 0.4), 0.5, 0.05));
  points.push(new MassPoint(new Vector2D(0.6, 0.4), 0.5, 0.05));

  points.push(new MassPoint(new Vector2D(0.4, 0.5), 0.5, 0.05));
  points.push(new MassPoint(new Vector2D(0.5, 0.5), 0.5, 0.05));
  points.push(new MassPoint(new Vector2D(0.6, 0.5), 0.5, 0.05));

  points.push(new MassPoint(new Vector2D(0.4, 0.6), 0.5, 0.05));
  points.push(new MassPoint(new Vector2D(0.5, 0.6), 0.5, 0.05));
  points.push(new MassPoint(new Vector2D(0.6, 0.6), 0.5, 0.05));

  let stiffness = 20000;
  let len = 0.1;
  let damp = 100;

  const inner_len = Math.sqrt(Math.pow(len, 2) + Math.pow(len, 2));

  // top
  springs.push(new Spring(points[0], points[1], stiffness, len, damp));
  springs.push(new Spring(points[1], points[2], stiffness, len, damp));

  springs.push(new Spring(points[0], points[4], stiffness, inner_len, damp));
  springs.push(new Spring(points[3], points[1], stiffness, inner_len, damp));
  springs.push(new Spring(points[1], points[5], stiffness, inner_len, damp));
  springs.push(new Spring(points[2], points[4], stiffness, inner_len, damp));

  springs.push(new Spring(points[0], points[3], stiffness, len, damp));
  springs.push(new Spring(points[1], points[4], stiffness, len, damp));
  springs.push(new Spring(points[2], points[5], stiffness, len, damp));

  // middle
  springs.push(new Spring(points[3], points[4], stiffness, len, damp));
  springs.push(new Spring(points[4], points[5], stiffness, len, damp));

  springs.push(new Spring(points[3], points[7], stiffness, inner_len, damp));
  springs.push(new Spring(points[4], points[6], stiffness, inner_len, damp));
  springs.push(new Spring(points[4], points[8], stiffness, inner_len, damp));
  springs.push(new Spring(points[5], points[7], stiffness, inner_len, damp));

  springs.push(new Spring(points[3], points[6], stiffness, len, damp));
  springs.push(new Spring(points[4], points[7], stiffness, len, damp));
  springs.push(new Spring(points[5], points[8], stiffness, len, damp));

  // bottom
  springs.push(new Spring(points[6], points[7], stiffness, len, damp));
  springs.push(new Spring(points[7], points[8], stiffness, len, damp));

}


const createSustainedOrb = () => {
  for (let i = 0; i < point_count; i++) {
    const vec = new Vector2D(
      0.5 + (Math.sin((i / point_count) * (Math.PI * 2))) / 5,
      0.5 + (Math.cos((i / point_count) * (Math.PI * 2))) / 5
    );
    points.push(new MassPoint(
      vec,
      1,
      0.05
    ));
  }

  for (let i = 0; i < points.length; i++) {
    springs.push(new Spring(
      points[i % (points.length)], points[(i + 1) % (points.length)],
      10000,
      0.2,
      100
    ));
  }

  for (const [i, m] of points.entries()) {
    for (const [ii, mm] of points.entries()) {
      if(m !== mm && i + 1 !== ii && i - 1 !== ii) {
        springs.push(new Spring(
          m, mm,
          10000,
          0.2,
          100
        ));
      }
    }
  }
}



createBoxStructure();



function start() {
  let previous_time = Date.now() * 0.001;
  let clicked = false;
  let mp = { x:0, y: 0 };

  function loop() {
    let time = Date.now()* 0.001;
    if(!ctx) {
      throw new Error("No 2d ctx available");
    }
  
    const dt = time - previous_time;
    previous_time = time;

    // UPDATE

    if(clicked) {
      springs[0].A.position.x = mp.x / root_canvas.width;
      springs[0].A.position.y = mp.y / root_canvas.height;
    } else {
      springs.forEach(spring => spring.update(dt));
      points.forEach(point => point.update(dt, points));
    }
    

    // RENDER
    ctx.clearRect(0, 0, root_canvas.width, root_canvas.height);


    springs.forEach(spring => {
      ctx.beginPath();
      ctx.strokeStyle = "yellow"

      ctx.moveTo(spring.A.position.x * root_canvas.width, spring.A.position.y * root_canvas.height);
      ctx.lineTo(spring.B.position.x * root_canvas.width, spring.B.position.y * root_canvas.height)

      ctx.stroke()
    })


    points.forEach(point => {

      ctx.beginPath();
      ctx.fillStyle = "red"
      
      ctx.rect(
        root_canvas.width * point.position.x - 5, root_canvas.height * point.position.y - 5,
        5, 5,
      )

      ctx.fill()
    })

    window.requestAnimationFrame(loop);
  }

  let mousemove = (e: MouseEvent) => {
    mp = { x: e.clientX, y: e.clientY }
  }

  let mousedown = () => {
    clicked = true;
    window.addEventListener('mousemove', mousemove)
  }

  window.addEventListener("mousedown", mousedown);
  window.addEventListener("mouseup", () => {
    clicked = false;
    window.removeEventListener('mousemove', mousemove);
  });

  window.requestAnimationFrame(loop);
}


start();