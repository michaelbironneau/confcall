//const input = document.querySelector('#hidden');
const input = document.getElementById('buffer');
var first = false;
const displaySize = { width: output.width, height: output.height }
var renderVideoToCanvas = true;
var modelLoaded = false;

async function loadModel(){
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
    console.log('Loaded models!');
}
async function recognize_face(){
    const tinyModel = true;
    const detections = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);    
    if (!first && detections){
        console.log('Detections', detections);
        first = true;
    }
    process(detections);
}

let start = null;
function render(timestamp){
    if (!modelLoaded){
        loadModel();
        modelLoaded = true;
        requestAnimationFrame(render);
        return;
    }
    if (!start) start=timestamp;
    if (timestamp-start < 100){
        requestAnimationFrame(render); //throttle
        return;
    } 
    start = timestamp;
    const buffer = document.getElementById('buffer');
    //const buffer = output.cloneNode(); //don't clone - why would we need to clone?
    const ctx = buffer.getContext('2d');
    ctx.clearRect(0, 0, buffer.width, buffer.height);
    ctx.drawImage(videoHidden, 0, 0, buffer.width, buffer.height);
    recognize_face();
    requestAnimationFrame(render);
}

function process(detections){
    if (!detections || !detections.detection){
        drawAwayBox();
        return;
    }
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    drawToCanvas(resizedDetections);
    //drawDebugInfo(detections);
    
}

function drawDebugInfo(detection){
    const buffer = output;
    const ctx = buffer.getContext('2d');
    ctx.clearRect(0, 0, output.width, output.height);
    faceapi.draw.drawDetections(output, detection);
}
function drawAwayBox(){
    var ctx = output.getContext('2d');
    ctx.clearRect(0, 0, 400, 300);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = "white";
}

function changeEncoding(){
    const sender = pc1.getSender()[0];
    if (!parameters.encodings) {
        parameters.encodings = [{}];
    }

}

function drawToCanvas(detection) {
    const buffer = document.getElementById('buffer');
    //const buffer = output.cloneNode(); //don't clone - why would we need to clone?
    const ctx = buffer.getContext('2d');
    //ctx.clearRect(0, 0, buffer.width, buffer.height);


    //ctx.drawImage(videoHidden, 0, 0, buffer.width, buffer.height);


    //get main face to unblur
    var mainBox = detection.detection.box;
    if (document.getElementById('debug').checked){
        faceapi.draw.drawDetections(buffer, detection);
        faceapi.draw.drawFaceLandmarks(buffer, detection);
    }
    var face = ctx.getImageData(mainBox._x, mainBox._y, mainBox._width, mainBox._height);


    /**
    if (document.getElementById('hidebg').checked){
        ctx.clearRect(0, 0, buffer.width, buffer.height);
        ctx.putImageData(face, mainBox._x, mainBox._y);
        return;
    }
     

    //blur
    if (!document.getElementById('compress').checked){
        return;
    }
    boxBlurCanvas(buffer, 0, 0, buffer.width, buffer.height, 30, 1 );
    */

    //superimpose face
    const final = document.getElementById('output');
    
    const fCtx = final.getContext('2d');
    fCtx.clearRect(0, 0, final.width, final.height);
    //fCtx.putImageData(face, mainBox._x, mainBox._y);
    fCtx.drawImage(buffer, mainBox._x, mainBox._y, mainBox._width, mainBox._height,0 , 0, final.width, final.height);
};

