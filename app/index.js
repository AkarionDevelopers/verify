import {
  verifyObjectId,
  verifyPropHashes,
  verifyCumulatedHash,
  verifyBlockchainHash,
  getInvalidProps,
} from './verify.js';


const files = [];
const $buttonBrowse = document.getElementById('buttonBrowse');
const $buttonLearnMore = document.getElementById('buttonLearnMore');
const $buttonNewVerification = document.getElementById('buttonNewVerification');
const $uploadBox = document.getElementById('uploadBox');
const $fileList = document.getElementById('fileList');
const $instructionText = document.getElementById('instructionText');
const $buttonReturnVerifier = document.getElementById('buttonReturnVerifier');
const $arrowLeft = document.getElementById('arrowLeft');
const $descriptionTop = document.getElementById('descriptionTop');



function parseAttachment(file) {
  return window.pdfjsLib
    .getDocument(file)
    .promise
    .then((document) => document.getPage(1))
    .then((page) => page.getAnnotations())
    .then((annotations) => new TextDecoder().decode(annotations[0].file.content))
    .then((text) => JSON.parse(text));
}

async function verify(data) {
  if (!verifyObjectId(data)) {
    throw new Error('id of object and notarization does not match');
  }
  if (!verifyPropHashes(data)) {
    throw new Error('prop hashes don\'t match', getInvalidProps(data));
  }
  if (!verifyCumulatedHash(data)) {
    throw new Error('cumulated hash does not match');
  }
  //only works for transactions on ETH Mainnet
  const verifiedByBlockchain = await verifyBlockchainHash(data);
  if (!verifiedByBlockchain) throw new Error('hashes on blockchain do not match')
  
}

async function checkFile(file) {
  let promise = new Promise((resolve,reject) =>{
    file.arrayBuffer()
    .then(parseAttachment)
    .then(verify)
    .then(() => {
    resolve("verified");
    })
    .catch((error) => {
      console.log('Verification failed', error);
    reject("rejected");
    });  
  });
  return promise;
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('dragover', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    // eslint-disable-next-line no-param-reassign
    evt.dataTransfer.dropEffect = 'copy';
  });
  document.body.addEventListener('drop', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (files.length == 0) {
      for (let i = 0; i < evt.dataTransfer.files.length;i++) {
      files.push(evt.dataTransfer.files[i])
      }
    updateView();
    } 
  });

  document.getElementById('upload').addEventListener('change', (evt) => {
    for (var file in evt.target.files) {
      files[0].push(file)
    }
  }, false);
});

$buttonBrowse.addEventListener('click', (evt) => {
  openDialog();
});
  

function openDialog() {
  document.getElementById('manualSelection').click();
}

document.getElementById('manualSelection').addEventListener('change', handleFiles, false);

function handleFiles(){
  
  const selectedFiles = document.getElementById('manualSelection').files;
  for (var i = 0; i < selectedFiles.length;i++){
    files.push(selectedFiles.item(i));
  }

  updateView();
}

$buttonLearnMore.addEventListener('click', (evt) => {
  console.log("clicked Learn More");
});

$buttonNewVerification.addEventListener('click', (evt) => {
  files.length = 0;
  updateView();
});

$buttonReturnVerifier.addEventListener('click', (evt) => {
  files.length = 0;
  updateView();
});

$arrowLeft.addEventListener('click', (evt) => {
  files.length = 0;
  updateView();
});

function updateView() {
  if (files.length > 0) {
    $buttonBrowse.style.display = 'none';
    $buttonLearnMore.style.display = 'none';
    $uploadBox.style.display = 'none';
    $buttonReturnVerifier.style.visibility = 'visible';
    $arrowLeft.style.visibility = 'visible';
    $buttonNewVerification.style.display = 'block';
    $fileList.style.display = 'block';
    $descriptionTop.textContent = 'The results are calculated by comparing the PDF data to entries stored on the Ethereum Blockchain.';
    updateFileList();

  } else {
    $buttonBrowse.style.display = 'block';
    $buttonLearnMore.style.display = 'block';
    $uploadBox.style.display = 'block';
    $buttonNewVerification.style.display = 'none';
    $buttonReturnVerifier.style.visibility = 'hidden';
    $arrowLeft.style.visibility = 'hidden';
    $instructionText.textContent = "Select a source to import your files";
    $fileList.style.display = 'none';
    $descriptionTop.textContent = 'Select the Chroniql PDF files to verify the integrity of their contents. The data is embedded inside the PDF.';
    resetFileList();
  }
}

function updateFileList() {

  for (let i = 0; i < files.length; i++) {
    let $html = "";
    $html += "<div id=\"fileOutline\">";
    let isVerified, isPdf, isValidFormat;
    isPdf = files[i].name.substr(name.length-4) == ".pdf";
    isValidFormat = files[i].objectData != undefined;
    console.log(files[i])

    checkFile(files[i]).then((res) => {isVerified = true;}, (err) => {isVerified = false;}).then(() =>{
    $html += (isVerified ? 
        "<div id=\"fileSymbolOuterSuccess\"> <div id=\"fileSymbol\">&#10003;</div> </div>" :
        "<div id=\"fileSymbolOuterFailure\"> <div id=\"fileSymbol\">X</div> </div>") +
      "<div id=\"fileStatusOuter\"> <div id=\"fileStatus\">" + 
      (isVerified ? 
        "Succesfully verified!" : 
        "Verification failed!") +
      "</div><div id=\"fileName\">" + 
      files[i].name +
      "</div>   </div> <div id=\"fileRightSegment\">" + 
      (isVerified ?
        ""://"<div id=\"viewButton\"> View</div>" : 
        !isPdf ? 
          "<div id=\"noView\">Invalid file format</div>" : 
            
          "<div id=\"noView\">hashes don't match</div>")+//"<div id=\"viewButton\"> View</div>") +
      "</div></div>"
      $fileList.innerHTML += $html;

    //update status text
    if (files.length > 1) $instructionText.textContent = "Verification status of the uploaded documents.";
    else if (isVerified) $instructionText.textContent = "Verification of the uploaded file was successful."// View the content of the verified document.";
    else $instructionText.textContent = "The verification of the uploaded file failed."// View the content of the document for more details.";
    }); 
  }
}

function resetFileList() {
  $fileList.innerHTML = "";
}