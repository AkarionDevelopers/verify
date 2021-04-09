import {
  verifyObjectId,
  verifyPropHashes,
  verifyCumulatedHash,
  getInvalidProps,
} from './verify.js';

function parseAttachment(file) {
  return window.pdfjsLib
    .getDocument(file)
    .promise
    .then((document) => document.getPage(1))
    .then((page) => page.getAnnotations())
    .then((annotations) => JSON.parse(
      String.fromCharCode.apply(null, new Uint16Array(annotations[0].file.content)),
    ));
}

function verify(data) {
  console.log('Object to verify:', data.object);
  console.log('Notarization data:', data.notarization);
  if (!verifyObjectId(data)) {
    console.warn('id of object and notarization does not match');
    return false;
  }
  if (!verifyPropHashes(data)) {
    console.warn('prop hashes don\'t match', getInvalidProps(data));
    return false;
  }
  if (!verifyCumulatedHash(data)) {
    console.warn('cumulated hash does not match');
    return false;
  }

  // TODO: verify blockchain entry

  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('upload').addEventListener('change', (evt) => {
    evt.target.files[0]
      .arrayBuffer()
      .then(parseAttachment)
      .then(verify)
      .then((success) => {
        const $result = document.getElementById('result');
        if (success) {
          $result.innerText = 'SUCCESS';
        } else {
          $result.innerText = 'FAILED';
        }
      })
      .catch((error) => {
        console.error(error);
        const $result = document.getElementById('result');
        $result.innerText = 'ERROR';
      });
  }, false);
});
