export function printDocumentDataSheet(data, i) {
  console.log(data)
  const $metaData = JSON.parse(data.get('data')[i].notarization.object.metaData);
  //row 1
  let res =
    '<div class="dataSheet" id="documentDataSheet">' +
    '<div class="documentDataRow">' +
    '<div class="documentDataSet">' +
    '<div class="documentDataTitle">' +
    'Type:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    sanitize($metaData['type']) +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Document ID:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    sanitize($metaData['_id']) +
    '</div>' +
    '</div>' +
    '</div>' +
    //row 2
    '<div class="documentDataRow">' +
    '<div class="documentDataSet">' +
    '<div class="documentDataTitle">' +
    'Type Index:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $metaData['typeIndex'] +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Timeline ID:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    sanitize($metaData['timelineId']) +
    '</div>' +
    '</div>' +
    '</div>' +
    //row 3
    '<div class="documentDataRow">' +
    '<div class="documentDataSet">' +
    '<div class="documentDataTitle">' +
    'Created on:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    formatDate($metaData['genesisDate']) +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Created by:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    sanitize($metaData['genesisUserId']) +
    '</div>' +
    '</div>' +
    '</div>' +
    //row 4
    '<div class="documentDataRow">' +
    '<div class="documentDataSet">' +
    '<div class="documentDataTitle">' +
    'Last modified on:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    formatDate($metaData['modificationDate']) +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Modified by:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    sanitize($metaData['modificationUserId']) +
    '</div>' +
    '</div>' +
    '</div>' +
    //row 5
    '<div class="documentDataRow" id="lastRow">' +
    '<div class="documentDataSet">' +
    '<div class="documentDataTitle">' +
    'Version:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $metaData['modificationCount'] +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Predecessor ID:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    sanitize($metaData['predecessorId']) +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  return res;
}

export function printObjectDataSheet(data, i) {
  const $objectData = JSON.parse(data.get('data')[i].notarization.object.objectData);
  const $isVerified = data.get('isVerified')[i];
  return (
    '<div class="dataSheet" id="objectDataSheet">' +
    '<div class="objectDataRow" style="border-top: 0px">' +
    '<div class="objectDataItem" id="objectDataCol1" style="font-weight: 500">Name</div>' +
    '<div class="objectDataItem" id="objectDataCol2" style="font-weight: 500">Value</div>' +
    //   '<div class="objectDataItem" id="objectDataCol3" style="font-weight: 500">State</div>' +
    '</div>' +
    getObjectDataRows($objectData, $isVerified) +
    '</div>'
  );
}

function getObjectDataRows($objectData, $isVerified) {
  let res = '';
  for (let itemName in $objectData) {
    if (
      $objectData[itemName] == null ||
      !Array.isArray($objectData[itemName]) ||
      $objectData[itemName].length <= 1
    ) {
      //single line item or empty
      res +=
        '<div class="objectDataRow">' +
        '<div class="objectDataItem" id="objectDataCol1">' +
        sanitize(itemName) +
        '</div>' +
        '<div class="objectDataItem" id="objectDataCol2">' +
        getObjectDataValue($objectData[itemName]) +
        '</div>' +
        // ($isVerified
        //    ? '<div class="successCircle"></div>'
        //   : '<div class="failCircle"></div>') +
        '</div>';
    } else {
      //multi line objectData
      res +=
        '<div class="objectDataRow">' +
        '<div class="objectDataItem" id="objectDataCol1">' +
        sanitize(itemName) +
        '</div>' +
        '<div class="objectDataItem" id="objectDataCol2">' +
        JSON.stringify($objectData[itemName]) +
        '</div>' +
        // ($isVerified
        //    ? '<div class="successCircle"></div>'
        //   : '<div class="failCircle"></div>') +
        '</div>';
    }
  }

  return res;
}
export function printReferences(data, i) {
  const $references = JSON.parse(data.get('data')[i].notarization.object.metaData)
    .references;
  const $isVerified = data.get('isVerified')[i];
  return (
    '<div class="dataSheet" id="referencesSheet">' +
    '<div class="objectDataRow" style="border-top: 0px">' +
    '<div class="objectDataItem" id="referencesCol1" style="font-weight: 500">Name</div>' +
    '<div class="objectDataItem" id="referencesCol2" style="font-weight: 500">Type</div>' +
    '<div class="objectDataItem" id="referencesCol3" style="font-weight: 500">Timeline ID</div>' +
    '<div class="objectDataItem" id="referencesCol4" style="font-weight: 500">ID</div>' +
    //  '<div class="objectDataItem" id="referencesCol5" style="font-weight: 500">State</div>' +
    '</div>' +
    getReferencesRows($references, $isVerified) +
    '</div>'
  );
}

function getReferencesRows($references, $isVerified) {
  let res = '';

  for (let item in $references) {
    res +=
      '<div class="objectDataRow">' +
      '<div class="objectDataItem" id="referencesCol1">' +
      sanitize($references[item]['name']) +
      '</div>' +
      '<div class="objectDataItem" id="referencesCol2">' +
      sanitize($references[item]['type']) +
      '</div>' +
      '<div class="objectDataItem" id="referencesCol3">' +
      sanitize($references[item]['timelineId']) +
      '</div>' +
      '<div class="objectDataItem" id="referencesCol4">' +
      sanitize($references[item]['_id']) +
      '</div>' +
      // ($isVerified
      //   ? '<div class="successCircle"></div>'
      //   : '<div class="failCircle"></div>') +
      '</div>';
  }
  return res;
}

function formatDate(date) {
  let parsedDate = new Date(date);
  return (
    '' +
    parsedDate.getFullYear() +
    '/' +
    ('0' + (parsedDate.getMonth() + 1)).slice(-2) +
    '/' +
    ('0' + parsedDate.getDate()).slice(-2) +
    ' | ' +
    ('0' + parsedDate.getHours()).slice(-2) +
    ':' +
    ('0' + parsedDate.getMinutes()).slice(-2)
  );
}

function getObjectDataValue(objectData) {
  if (
    objectData == null ||
    objectData.length == 0 ||
    objectData.toString() == '[object Object]'
  ) {
    return '-';
  }

  return objectData.toString();
}

function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, match => map[match]);
}
