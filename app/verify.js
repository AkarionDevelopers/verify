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

function hash(key, value, salt) {
  if (!salt) {
    // salt has was removed -> entry sanitized
    return 'sanitized';
  }
  if (typeof value === 'undefined') {
    return 'entry-not-found';
  }
  if (key === 'genesisDate' || key === 'modificationDate' || key === 'endedDate') {
    return hashDate(value, salt);
  }
  if (value === null || value === undefined) {
    return hashNull(salt);
  } if (typeof value === 'boolean') {
    return hashBoolean(value, salt);
  } if (typeof value === 'number') {
    return hashInt(value, salt);
  } if (Array.isArray(value)) {
    return hashRaw(`[]${salt}`);
  } if (typeof value === 'object') {
    return hashRaw(`{}${salt}`);
  }
  return hashString(value, salt);
}

export function verifyObjectId(data) {
  return data.object.id === data.notarization.auditProofs[0].notarizedObject.chroniqlObjectId;
}

export function getInvalidProps(data) {
  const flattenedObject = flatten(data.object);
  return data.notarization.auditProofs[0].notarizedObject.notarizationEntries
    .filter((entry) => {
      const calcHash = hash(
        entry.name,
        flattenedObject[entry.name],
        entry.salt,
      );
      return calcHash !== entry.hash;
    })
    .map((entry) => entry.name);
}

export function verifyPropHashes(data) {
  return getInvalidProps(data).length === 0;
}

export function verifyCumulatedHash(data) {
  const flattenedObject = flatten(data.object);
  const cumulatedHash = data.notarization.auditProofs[0].notarizedObject.notarizationEntries
    .map((entry) => {
      const entryHash = hash(
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
