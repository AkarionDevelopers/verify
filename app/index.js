import {
  verifyObjectId,
  verifyPropHashes,
  verifyCumulatedHash,
  verifyBlockchainHash,
  getInvalidProps
} from './verify.js';
import {
  printDocumentDataSheet,
  printObjectDataSheet,
  printReferences
} from './helper.js';

const files = [];
const data = new Map();
data.set('data', []);
data.set('isVerified', []);
const $buttonBrowse = document.getElementById('buttonBrowse');
const $buttonLearnMore = document.getElementById('buttonLearnMore');
const $buttonNewVerification = document.getElementById('buttonNewVerification');
const $detailsButtonNewVerification = document.getElementById(
  'detailsButtonNewVerification'
);
const $uploadBox = document.getElementById('uploadBox');
const $fileList = document.getElementById('fileList');
const $instructionText = document.getElementById('instructionText');
const $buttonReturnVerifier = document.getElementById('buttonReturnVerifier');
const $arrowLeft = document.getElementById('arrowLeft');
const $descriptionTop = document.getElementById('descriptionTop');
const $main = document.getElementById('main');

const $details = document.getElementById('details');
const $buttonBack = document.getElementById('buttonBack');
const $detailsScrollPanel = document.getElementById('detailsScrollPanel');

function parseAttachment(file) {
  return window.pdfjsLib
    .getDocument(file)
    .promise.then(document => document.getPage(1))
    .then(page => page.getAnnotations())
    .then(annotations => new TextDecoder().decode(annotations[0].file.content))
    .then(text => JSON.parse(text))
    .catch(() => {
      throw new Error('invalid file content');
    });
}

async function verify($data) {
  data.get('data').push($data);
  if (!verifyObjectId($data)) {
    throw new Error('id of object and notarization does not match');
  }
  if (!verifyPropHashes($data)) {
    throw new Error("prop hashes don't match", getInvalidProps($data));
  }
  if (!verifyCumulatedHash($data)) {
    throw new Error('cumulated hash does not match');
  }
  //only works for transactions on ETH Mainnet
  const verifiedByBlockchain = await verifyBlockchainHash($data);
  if (!verifiedByBlockchain)
    throw new Error('hashes on blockchain do not match');
}

async function checkFile(file) {
  let promise = new Promise((resolve, reject) => {
    file
      .arrayBuffer()
      .then(parseAttachment)
      .then(verify)
      .then(() => {
        resolve('verified');
      })
      .catch(error => {
        console.log('Verification failed', error);
        reject(error.toString().substr(7));
      });
  });
  return promise;
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('dragover', evt => {
    evt.stopPropagation();
    evt.preventDefault();
    // eslint-disable-next-line no-param-reassign
    evt.dataTransfer.dropEffect = 'copy';
  });
  document.body.addEventListener('drop', evt => {
    evt.stopPropagation();
    evt.preventDefault();
    if (files.length == 0) {
      for (let i = 0; i < evt.dataTransfer.files.length; i++) {
        files.push(evt.dataTransfer.files[i]);
      }
      updateView();
    }
  });

  document.getElementById('upload').addEventListener(
    'change',
    evt => {
      for (var file in evt.target.files) {
        files[0].push(file);
      }
    },
    false
  );
});

$buttonBrowse.addEventListener('click', evt => {
  openDialog();
});

function openDialog() {
  document.getElementById('manualSelection').click();
}

document
  .getElementById('manualSelection')
  .addEventListener('change', handleFiles, false);

function handleFiles() {
  const selectedFiles = document.getElementById('manualSelection').files;
  for (var i = 0; i < selectedFiles.length; i++) {
    files.push(selectedFiles.item(i));
  }

  updateView();
}

$buttonLearnMore.addEventListener('click', evt => {
  window.open('https://akarion.com/en/trust-layer', '_blank');
});

$buttonNewVerification.addEventListener('click', evt => {
  files.length = 0;
  updateView();
});
$detailsButtonNewVerification.addEventListener('click', evt => {
  files.length = 0;
  $main.style.display = 'block';
  $details.style.display = 'none';
  updateView();
});

$buttonReturnVerifier.addEventListener('click', evt => {
  files.length = 0;
  updateView();
});

$arrowLeft.addEventListener('click', evt => {
  files.length = 0;
  updateView();
});

$buttonBack.addEventListener('click', evt => {
  $main.style.display = 'block';
  $details.style.display = 'none';
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
    $descriptionTop.textContent =
      'The results are calculated by comparing the PDF data to entries stored on the Ethereum Blockchain.';
    updateFileList();
  } else {
    $buttonBrowse.style.display = 'block';
    $buttonLearnMore.style.display = 'block';
    $uploadBox.style.display = 'block';
    $buttonNewVerification.style.display = 'none';
    $buttonReturnVerifier.style.visibility = 'hidden';
    $arrowLeft.style.visibility = 'hidden';
    $instructionText.textContent = 'Select a source to import your files';
    $fileList.style.display = 'none';
    $descriptionTop.textContent =
      'Select the Chroniql PDF files to verify the integrity of their contents. The data is embedded inside the PDF.';
    resetFileList();
  }
}

function updateFileList() {
  for (let i = 0; i < files.length; i++) {
    let $html = '';
    $html += '<div id="fileOutline">';
    let $isVerified, $isPdf, $isValidFormat;
    $isPdf = files[i].name.substr(name.length - 4) == '.pdf';
    $isValidFormat = files[i].objectData != undefined;

    checkFile(files[i])
      .then(
        res => {
          $isVerified = true;
          data.get('isVerified')[i] = true;
        },
        err => {
          $isVerified = false;
          data.get('isVerified')[i] = false;
          $isValidFormat = err != 'invalid file content';
        }
      )
      .then(() => {
        $html +=
          ($isVerified
            ? '<div id="fileSymbolOuterSuccess"> <div id="fileSymbol"> <img src="images/check.svg" width="25" height="25" alt="OK"></div> </div>'
            : !$isPdf
            ? '<div id="fileSymbolOuterFailure"> <div id="fileSymbol"> <img src="images/refresh.svg" width="25" height="25" alt="OK"></div> </div>'
            : !$isValidFormat
            ? '<div id="fileSymbolOuterFailure"> <div id="fileSymbol"> <img src="images/exclamation-triangle-light.svg" width="25" height="25" alt="OK"></div> </div>'
            : '<div id="fileSymbolOuterFailure"> <div id="fileSymbol"><img src="images/times.svg" width="25" height="25" alt="X"></div> </div>') +
          '<div id="fileStatusOuter"> <div id="fileStatus">' +
          ($isVerified ? 'Succesfully verified!' : 'Verification failed!') +
          '</div><div id="fileName">' +
          sanitizeHTML(files[i].name) +
          '</div>   </div> <div id="fileRightSegment">' +
          ($isVerified
            ? '<div id="viewButton"> View</div>'
            : !$isPdf
            ? '<div id="noView"><span>Invalid file format</span></div>'
            : !$isValidFormat
            ? '<div id="noView"><span>Invalid file content</span></div>'
            : '<div id="viewButton"> View</div>') +
          '</div></div>';
        $fileList.innerHTML += $html;
        console.log($fileList);

        if (document.getElementById('viewButton') != null) {
          document
            .getElementById('viewButton')
            .addEventListener('click', evt => {
              viewDetails(i);
            });
        }

        //update status text
        if (files.length > 1)
          $instructionText.textContent =
            'Verification status of the uploaded documents.';
        else if ($isVerified)
          $instructionText.textContent =
            'Verification of the uploaded file was successful.';
        // View the content of the verified document.";
        else
          $instructionText.textContent =
            'The verification of the uploaded file failed.'; // View the content of the document for more details.";
      });
  }
}

function resetFileList() {
  $fileList.innerHTML = '';
}

function sanitizeHTML(text) {
  const element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
}

function viewDetails(i) {
  $main.style.display = 'none';
  $details.style.display = 'block';
  const $isVerified = data.get('isVerified')[i];
  console.log(data.get('data')[i]);

  document.getElementById('detailsStatusBox').innerHTML = $isVerified
    ? '<div class="detailsStatusSuccess">Successful</div>'
    : '<div class="detailsStatusFail">Failed</div>';

  $detailsScrollPanel.innerHTML = printDocumentDataSheet(data, i);
  $detailsScrollPanel.innerHTML += printObjectDataSheet(data, i);
  $detailsScrollPanel.innerHTML += printReferences(data, i);
  $detailsScrollPanel.innerHTML += '<div style="height: 20px"> </div>';
}
