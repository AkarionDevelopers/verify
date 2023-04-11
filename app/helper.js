function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  if (string === undefined) {
    return '';
  }
  return string.replace(reg, (match) => map[match]);
}

function formatDate(date) {
  const parsedDate = new Date(date);
  return (
    `${
      parsedDate.getFullYear()
    }/${
      (`0${parsedDate.getMonth() + 1}`).slice(-2)
    }/${
      (`0${parsedDate.getDate()}`).slice(-2)
    } | ${
      (`0${parsedDate.getHours()}`).slice(-2)
    }:${
      (`0${parsedDate.getMinutes()}`).slice(-2)}`
  );
}

function getObjectDataValue(objectData) {
  if (objectData === null || objectData.length === 0) {
    return 'null';
  }

  if (Array.isArray(objectData)) {
    let arrayAsStr = '';
    Object.keys(objectData).forEach((key) => {
      arrayAsStr += `${JSON.stringify(objectData[key])}, `;
    });
    return arrayAsStr;
  }

  if (objectData.toString() === '[object Object]') {
    let objAsStr = '';
    Object.keys(objectData).forEach((key) => {
      objAsStr += `${key}:${JSON.stringify(objectData[key])}, `;
    });
    return objAsStr;
  }

  return objectData.toString();
}

export function printDocumentDataSheet(data, i) {
  const $metaData = JSON.parse(data.get('data')[i].notarization.object.metaData);

  // row 1
  const res = `${'<div class="dataSheet documentDataSheet">'
    + '<div class="documentDataRow">'
    + '<div class="documentDataSet">'
    + '<div class="documentDataTitle">'
    + 'Type:'
    + '</div>'
    + '<div class="documentDataItem">  '}${
    sanitize($metaData.type)
  }</div>`
    + '</div>'
    + '<div class="documentDataSet documentDataCol2">'
    + '<div class="documentDataTitle">'
    + 'Document ID:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      // eslint-disable-next-line no-underscore-dangle
      sanitize($metaData._id)
    }</div>`
    + '</div>'
    + '</div>'
    // row 2
    + '<div class="documentDataRow">'
    + '<div class="documentDataSet">'
    + '<div class="documentDataTitle">'
    + 'Type Index:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      $metaData.typeIndex
    }</div>`
    + '</div>'
    + '<div class="documentDataSet documentDataCol2">'
    + '<div class="documentDataTitle">'
    + 'Timeline ID:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      sanitize($metaData.timelineId)
    }</div>`
    + '</div>'
    + '</div>'
    // row 3
    + '<div class="documentDataRow">'
    + '<div class="documentDataSet">'
    + '<div class="documentDataTitle">'
    + 'Created on:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      formatDate($metaData.genesisDate)
    }</div>`
    + '</div>'
    + '<div class="documentDataSet documentDataCol2">'
    + '<div class="documentDataTitle">'
    + 'Created by:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      sanitize($metaData.genesisUserId)
    }</div>`
    + '</div>'
    + '</div>'
    // row 4
    + '<div class="documentDataRow">'
    + '<div class="documentDataSet">'
    + '<div class="documentDataTitle">'
    + 'Last modified on:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      formatDate($metaData.modificationDate)
    }</div>`
    + '</div>'
    + '<div class="documentDataSet documentDataCol2">'
    + '<div class="documentDataTitle">'
    + 'Modified by:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      sanitize($metaData.modificationUserId)
    }</div>`
    + '</div>'
    + '</div>'
    // row 5
    + '<div class="documentDataRow lastRow">'
    + '<div class="documentDataSet">'
    + '<div class="documentDataTitle">'
    + 'Version:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      $metaData.modificationCount
    }</div>`
    + '</div>'
    + '<div class="documentDataSet documentDataCol2">'
    + '<div class="documentDataTitle">'
    + 'Predecessor ID:'
    + '</div>'
    + `<div class="documentDataItem">  ${
      sanitize($metaData.predecessorId)
    }</div>`
    + '</div>'
    + '</div>'
    + '</div>';

  return res;
}

function getObjectDataRows($objectData) {
  let res = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const itemName in $objectData) {
    if (
      $objectData[itemName] == null
      || !Array.isArray($objectData[itemName])
      || $objectData[itemName].length <= 1
    ) {
      // single line item or empty
      res
        += `${'<div class="objectDataRow">'
        + '<div class="objectDataItem objectDataCol1">'}${
          sanitize(itemName)
        }</div>`
        + `<div class="objectDataItem objectDataCol2">${
          getObjectDataValue($objectData[itemName])
        }</div>`
        + '</div>';
    } else {
      // multi line objectData
      res
        += `${'<div class="objectDataRow">'
        + '<div class="objectDataItem objectDataCol1">'}${
          sanitize(itemName)
        }</div>`
        + `<div class="objectDataItem objectDataCol2">${
          JSON.stringify($objectData[itemName])
        }</div>`
        + '</div>';
    }
  }

  return res;
}

export function printObjectDataSheet(data, i) {
  const $objectData = data.get('data')[i].notarization.object.objectDataProperties;
  return (
    `${'<div class="dataSheet objectDataSheet">'
    + '<div class="objectDataRow" style="border-top: 0px">'
    + '<div class="objectDataItem objectDataCol1" style="font-weight: 500">Name</div>'
    + '<div class="objectDataItem objectDataCol2" style="font-weight: 500">Value</div>'
    + '</div>'}${
      getObjectDataRows($objectData)
    }</div>`
  );
}

function getReferencesRows($references) {
  let res = '';

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const item in $references) {
    res
      += `${'<div class="objectDataRow">'
      + '<div class="objectDataItem referencesCol1">'}${
        sanitize($references[item].name)
      }</div>`
      + `<div class="objectDataItem referencesCol2">${
        sanitize($references[item].type)
      }</div>`
      + `<div class="objectDataItem referencesCol3">${
        sanitize($references[item].timelineId)
      }</div>`
      + `<div class="objectDataItem referencesCol4">${
        // eslint-disable-next-line no-underscore-dangle
        sanitize($references[item]._id)
      }</div>`
      + '</div>';
  }
  return res;
}

export function printReferences(data, i) {
  const $references = JSON.parse(data.get('data')[i].notarization.object.references);
  return (
    `${'<div class="dataSheet referencesSheet">'
    + '<div class="objectDataRow" style="border-top: 0px">'
    + '<div class="objectDataItem referencesCol1" style="font-weight: 500">Name</div>'
    + '<div class="objectDataItem referencesCol2" style="font-weight: 500">Type</div>'
    + '<div class="objectDataItem referencesCol3" style="font-weight: 500">Timeline ID</div>'
    + '<div class="objectDataItem referencesCol4" style="font-weight: 500">ID</div>'
    + '</div>'}${
      getReferencesRows($references)
    }</div>`
  );
}
