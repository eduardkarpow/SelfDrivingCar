const canvas=document.querySelector("#carCanvas");
canvas.width=200;
const networkCanvas = document.querySelector("#networkCanvas");
networkCanvas.width=300;
const counter = document.querySelector("#counter");
const bestCounter = document.querySelector("#best");

const ctx = canvas.getContext("2d");
const nCtx = networkCanvas.getContext("2d");
const road=new Road(canvas.width/2,canvas.width*0.9);
const cars=generateCars(100);
let bestCar = cars[0];
let hTime = 0;
if(localStorage.getItem("bestBrain")){
    for(let i = 0; i<cars.length; i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain")
        );
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain, 0.17);
        }
    }
    
}
if(localStorage.getItem("bestScore")){
    bestCounter.innerHTML = `best Score: ${localStorage.getItem("bestScore")}`;
} else {
    bestCounter.innerHTML = `best Score: 0`;
}
let traffic=[
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2)
];

animate();

function save(){
    localStorage.setItem("bestBrain",JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars = [];
    for(let i = 0; i < N; i++) {
        cars.unshift(new Car(road.getLaneCenter(1), 100,30,50, "AI"));
    }
    return cars;
}
function generateTraffic(traffic){
    traffic.push(new Car(road.getLaneCenter(Math.random()*2),
        bestCar.y-Math.random()*300-300, 30, 50, "DUMMY"))

    return traffic
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i = 0; i<cars.length; i++){
        cars[i].update(road.borders,traffic);
    }
    
    bestCar = cars.find(car => car.y == Math.min(...cars.map(car =>car.y)));

    canvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    ctx.save();
    ctx.translate(0,-bestCar.y+canvas.height*0.7);

    road.draw(ctx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(ctx,"red");
    }
    ctx.globalAlpha=0.2;
    for(let i = 0; i<cars.length; i++){
        cars[i].draw(ctx,"blue");
    }
    ctx.globalAlpha=1;
    bestCar.draw(ctx,"blue",true);
    ctx.restore();
    if(bestCar.y<traffic[0].y && Math.floor(time/1500)>hTime){
        console.log(time);
        hTime = Math.floor(time/1500);
        traffic=generateTraffic(traffic);
    }
    if(!cars.some(car => car.damaged == false)){
        discard();
        save();
        window.location.reload();
        localStorage.setItem("bestScore", Math.floor(-bestCar.y));
    }
    counter.innerHTML = `Count: ${Math.floor(-bestCar.y)}`;
    nCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(nCtx, cars[1].brain);
    requestAnimationFrame(animate);
}