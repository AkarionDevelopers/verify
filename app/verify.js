function flatten(data) {
  const result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      const l = cur.length;
      for (let i = 0; i < l; i += 1) {
        recurse(cur[i], prop ? `${prop}[${i}]` : `${i}`);
      }
      if (l === 0) {
        result[prop] = [];
      }
    } else {
      let isEmpty = true;
      Object.keys(cur).forEach((p) => {
        isEmpty = false;
        recurse(cur[p], prop ? `${prop}.${p}` : p);
      });
      if (isEmpty) {
        result[prop] = {};
      }
    }
  }
  recurse(data, '');
  return result;
}

function normalizeDate(date) {
  return new Date(date).toISOString();
}
function hashRaw(value) {
  if (!value) {
    return null;
  }
  // eslint-disable-next-line new-cap
  const shaObj = new window.jsSHA('SHA-256', 'TEXT');
  shaObj.update(value || '');
  return shaObj.getHash('HEX');
}

function hashString(value, salt) {
  return hashRaw(`"${value}"${salt}`);
}

function hashInt(value, salt) {
  return hashRaw(value + salt);
}

function hashDate(value, salt) {
  return hashRaw(`"${normalizeDate(value)}"${salt}`);
}

function hashBoolean(value, salt) {
  return hashRaw(value + salt);
}

function hashNull(salt) {
  return hashRaw(salt);
}

function getHash(key, value, salt) {
  if (!salt) {
    // salt has was removed -> entry sanitized
    return 'sanitized';
  }
  if (typeof value === 'undefined') {
    return 'entry-not-found';
  }
  if (
    key === 'genesisDate'
    || key === 'modificationDate'
    || key === 'endedDate'
  ) {
    return hashDate(value, salt);
  }
  if (value === null || value === undefined) {
    return hashNull(salt);
  }
  if (typeof value === 'boolean') {
    return hashBoolean(value, salt);
  }
  if (typeof value === 'number') {
    return hashInt(value, salt);
  }
  if (Array.isArray(value)) {
    return hashRaw(`[]${salt}`);
  }
  if (typeof value === 'object') {
    return hashRaw(`{}${salt}`);
  }
  return hashString(value, salt);
}

function fromHex(h) {
  let s = '';
  for (let i = 0; i < h.length; i += 2) {
    s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
  }
  return decodeURIComponent(escape(s));
}

export function verifyObjectDataProperties(data) {
  const props = data.object.objectDataProperties;
  let errorsFound = false;
  Object.keys(props).forEach((key) => {
    const keyAndHash = `"${key}":"${hashRaw(props[key])}"`;
    if (!data.object.objectData.includes(keyAndHash)) {
      errorsFound = true;
      console.log('ObjectDataProperty', key, 'verification failed');
    } else {
      console.debug('ObjectDataProperty', key, 'verified successfully');
    }
  });
  return !errorsFound;
}

export function verifyObjectData(data) {
  const secretStep = data.hashing.steps[0];
  if (secretStep === null) return false;
  const hash = hashRaw(data.object.objectData + secretStep.postfix);
  return hash === secretStep.output;
}

export function verifyReferences(data) {
  const metaDataAndReferencesStep = data.hashing.steps[1];
  if (metaDataAndReferencesStep === null) return false;
  return hashRaw(data.object.references) === metaDataAndReferencesStep.postfix;
}

export function verifyMetaData(data) {
  const metaDataAndReferencesStep = data.hashing.steps[1];
  const secretStep = data.hashing.steps[0];
  if (metaDataAndReferencesStep === null || secretStep === null) return false;
  // prefix of metaData should be hash of metaData, check if true
  if (hashRaw(data.object.metaData) !== metaDataAndReferencesStep.prefix) return false;
  const hash = hashRaw(
    metaDataAndReferencesStep.prefix
    + secretStep.output
    + metaDataAndReferencesStep.postfix,
  );
  return hash === metaDataAndReferencesStep.output;
}

export function verifyHashingSteps(data) {
  const { steps } = data.hashing;
  for (let i = 2; i < steps.length; i += 1) {
    const prefix = steps[i].prefix || '';
    const previousOutput = steps[i - 1].output;
    const postfix = steps[i].postfix || '';
    const { output } = steps[i];
    const hash = hashRaw(prefix + previousOutput + postfix);
    if (hash !== output) return false;
    // additional check from last step to hash in notarization
    if (i === steps.length - 1 && hash !== data.notarization.hash) return false;
  }
  return true;
}

export function verifyCumulatedHash(data) {
  const flattenedObject = flatten(data.object);
  const cumulatedHash = data.notarization.auditProofs[0].notarizedObject.notarizationEntries
    .map((entry) => {
      const entryHash = getHash(
        entry.name,
        flattenedObject[entry.name],
        entry.salt,
      );
      if (entryHash === 'sanitized') {
        return entry.hash;
      }
      return entryHash;
    })
    .join('');
  return hashRaw(cumulatedHash);
}

export async function verifyBlockchainHash(data) {
  const { hash } = data.notarization;
  const txHash = data.notarization.id;

  try {
    const response = await fetch(`https://api.blockcypher.com/v1/eth/main/txs/${txHash}`);
    const responseData = await response.json();
    const message = JSON.parse(fromHex(responseData.outputs[0].script));
    return message.hash === hash;
  } catch (error) {
    console.log('Could not find blockchain transaction', txHash, 'on Ethereum Mainnet.');
    return false;
  }
}
