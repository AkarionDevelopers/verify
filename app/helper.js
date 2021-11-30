export function printDocumentDataSheet($data) {
  //row 1
  let res =
    '<div class="dataSheet" id="documentDataSheet">' +
    '<div class="documentDataRow">' +
    '<div class="documentDataSet">' +
    '<div class="documentDataTitle">' +
    'Type:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $data.object['type'] +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Document ID:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $data.object['id'] +
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
    $data.object['typeIndex'] +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Timeline ID:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $data.object['timelineId'] +
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
    formatDate($data.object['genesisDate']) +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Created by:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $data.object['genesisUserId'] +
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
    formatDate($data.object['modificationDate']) +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Modified by:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $data.object['modificationUserId'] +
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
    $data.object['modificationCount'] +
    '</div>' +
    '</div>' +
    '<div class="documentDataSet" id="documentDataCol2">' +
    '<div class="documentDataTitle">' +
    'Predecessor ID:' +
    '</div>' +
    '<div class="documentDataItem">  ' +
    $data.object['predecessorId'] +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  return res;
}

export function printObjectDataSheet($data) {
  return (
    '<div class="dataSheet" id="objectDataSheet">' +
    '<div class="objectDataRow" style="border-top: 0px">' +
    '<div class="objectDataItem" id="objectDataCol1" style="font-weight: 500">Name</div>' +
    '<div class="objectDataItem" id="objectDataCol2" style="font-weight: 500">Value</div>' +
    '<div class="objectDataItem" id="objectDataCol3" style="font-weight: 500">State</div>' +
    '</div>' +
    getObjectDataRows($data) +
    '</div>'
  );
}

function getObjectDataRows($data) {
  let res = '';
  for (let link in $data.object['links']) {
    res +=
      '<div class="objectDataRow">' +
      '<div class="objectDataItem" id="objectDataCol1">' +
      link +
      '</div>' +
      '<div class="objectDataItem" id="objectDataCol2">' +
      getValueFromLink(link, $data) +
      '</div>' +
      '</div>';
  }
  return res;
}
export function printReferences($data) {
  return '<div class="dataSheet" id="referenceSheet">' + '</div>';
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

function getValueFromLink(item, $data) {
  let link = $data.object['links'][item];
  if (link == '') return '';
  if (item == 'referencedBy')
    return link.substring(
      link.indexOf('referencedBy/') + 'referencedBy/'.length,
      link.indexOf('referencedBy/') + 24 + 'referencedBy/'.length
    );
  if (item == 'genesisUser' || item == 'modificationUser')
    return link.substring(
      link.indexOf('users/') + 'users/'.length,
      link.indexOf('users/') + 24 + 'users/'.length
    );
  if (item == 'latest')
    return link.substring(
      link.indexOf('timelines/') + 'timelines/'.length,
      link.indexOf('timelines/') + 24 + 'timelines/'.length
    );

  return link.substring(link.indexOf('base')).replace('/objects/', '.');
}
