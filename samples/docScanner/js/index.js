let utils = new Utils('errorMessage');
let controls = {};

let videoConstraint;
let streaming = false;
let videoTrack = null;
let imageCapturer = null;

let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

let videoCapturer = null;
let src = null;
let dst = null;

let startDocProcessing = false;


function initOpencvObjects() {
  videoCapturer = new cv.VideoCapture(video);
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  let mainContent = document.getElementById('mainContent');

  cameraBar.style.width = mainContent.style.width = `${video.videoWidth}px`;

  document.querySelector('.canvas-wrapper').style.height =
    `${video.videoHeight}px`;

  mainContent.classList.remove('hidden');

  document.getElementById('takePhotoButton').disabled = false;
}

function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    } else if (startDocProcessing) {
      return;
    }
    videoCapturer.read(src);
    cv.imshow('canvasOutput', src);
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
}

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);

  // Event listener for threshold blockSize parameter.
  let thresholdBlockSizeInput = document.getElementById('thresholdBlockSize');
  let thresholdBlockSizeOutput =
    document.getElementById('thresholdBlockSizeOutput');
  thresholdBlockSizeInput.addEventListener('input', function () {
    thresholdBlockSize = thresholdBlockSizeOutput.value
      = parseInt(thresholdBlockSizeInput.value);
    if (showingScannedDoc) processDocument(src, approxCoords);
  });
  thresholdBlockSizeInput.addEventListener('change', function () {
    thresholdBlockSize = thresholdBlockSizeOutput.value
      = parseInt(thresholdBlockSizeInput.value);
    if (showingScannedDoc) processDocument(src, approxCoords);
  });
  thresholdBlockSizeOutput.value =
    thresholdBlockSizeInput.value = thresholdBlockSize;

  // Event listener for threshold offset parameter.
  let thresholdOffsetInput = document.getElementById('thresholdOffset');
  let thresholdOffsetOutput =
    document.getElementById('thresholdOffsetOutput');
  thresholdOffsetInput.addEventListener('input', function () {
    thresholdOffset = thresholdOffsetOutput.value
      = parseInt(thresholdOffsetInput.value);
    if (showingScannedDoc) processDocument(src, approxCoords);
  });
  thresholdOffsetInput.addEventListener('change', function () {
    thresholdOffset = thresholdOffsetOutput.value
      = Number(thresholdOffsetInput.value);
    if (showingScannedDoc) processDocument(src, approxCoords);
  });
  thresholdOffsetOutput.value =
    thresholdOffsetInput.value = thresholdOffset;

  createTakePhotoListener();
}

function startCamera() {
  utils.startCamera(videoConstraint, 'videoInput', onVideoStarted);
}

function cleanupAndStop() {
  src.delete();
  utils.stopCamera();
}

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
