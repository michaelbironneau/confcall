const input = document.querySelector('#hidden');
const output = document.querySelector('canvas');
var first = false;
const displaySize = { width: output.width, height: output.height }
var renderVideoToCanvas = true;
var modelLoaded = false;

async function loadModel(){
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    console.log('Loaded model!');
}
async function recognize_face(){
    const detections = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions());//.withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    if (!first){
        console.log('Detections', resizedDetections);
        first = true;
    }
    process(resizedDetections);
}

function render(){
    if (!modelLoaded){
        loadModel();
        modelLoaded = true;
    }
    recognize_face();
    requestAnimationFrame(render);
}

function process(detections){
    if (detections.length == 0){
        drawAwayBox();
        return;
    } 
    drawToCanvas(detections);
    //drawDebugInfo(detections);
    
}

function drawDebugInfo(detections){
    const buffer = output;
    const ctx = buffer.getContext('2d');
    ctx.clearRect(0, 0, output.width, output.height);
    faceapi.draw.drawDetections(output, detections);
}
function drawAwayBox(){
    var ctx = output.getContext('2d');
    ctx.clearRect(0, 0, 400, 300);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = "white";
    ctx.fillText("Away", 100, 130);
}

function changeEncoding(){
    const sender = pc1.getSender()[0];
    if (!parameters.encodings) {
        parameters.encodings = [{}];
    }

}

function drawToCanvas(detections) {
    const buffer = output; //don't clone - why would we need to clone?
    const ctx = buffer.getContext('2d');
    ctx.clearRect(0, 0, buffer.width, buffer.height);


    ctx.drawImage(videoHidden, 0, 0, buffer.width, buffer.height);


    //get main face to unblur
    var mainBox = detections[0].box;
    var face = ctx.getImageData(mainBox._x, mainBox._y, mainBox._width, mainBox._height);

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
    //superimpose face
    ctx.putImageData(face, mainBox._x, mainBox._y);

};

