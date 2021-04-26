import {
  verifyObjectId,
  verifyPropHashes,
  verifyCumulatedHash,
  verifyBlockchainHash,
  getInvalidProps,
} from './verify.js';

function parseAttachment(file) {
  return window.pdfjsLib
    .getDocument(file)
    .promise
    .then((document) => document.getPage(1))
    .then((page) => page.getAnnotations())
    .then((annotations) => new TextDecoder().decode(annotations[0].file.content))
    .then((text) => JSON.parse(text));
}

function verify(data) {
  console.log('Object to verify:', data.object);
  console.log('Notarization data:', data.notarization);
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
  if (!verifyBlockchainHash(data)) {
    throw new Error('hash on blockchain does not match');
  }
  return true;
}

function checkFile(file) {
  const $resultSuccess = document.getElementById('result-success');
  const $resultFail = document.getElementById('result-fail');
  const $resultText = document.getElementById('result-text');
  return file.arrayBuffer()
    .then(parseAttachment)
    .then(verify)
    .then(() => {
      $resultSuccess.style.display = 'initial';
      $resultFail.style.display = 'none';
      $resultText.innerText = 'Verification successful. Check console for contents of verified object';
    })
    .catch((error) => {
      console.log('Verification failed', error);
      $resultSuccess.style.display = 'none';
      $resultFail.style.display = 'initial';
      $resultText.innerText = 'Verification failed. Check console for details';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('dragover', (evt) => {
    console.log('dragover');
    evt.stopPropagation();
    evt.preventDefault();
    // eslint-disable-next-line no-param-reassign
    evt.dataTransfer.dropEffect = 'copy';
  });
  document.body.addEventListener('drop', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    checkFile(evt.dataTransfer.files[0]);
  });

  document.getElementById('upload').addEventListener('change', (evt) => {
    checkFile(evt.target.files[0]);
  }, false);
});
