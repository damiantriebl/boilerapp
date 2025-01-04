export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    console.log('SALT GENERATED:', salt);
  
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    console.log('KEY MATERIAL IMPORTED:', keyMaterial);
  
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'HMAC', hash: 'SHA-256', length: 256 },
      true,
      ['sign']
    );
    console.log('KEY DERIVED:', key);
  
    const hashBuffer = await crypto.subtle.exportKey('raw', key);
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
    console.log('SALT HEX:', saltHex);
    console.log('HASH HEX:', hashHex);
  
    return `${saltHex}:${hashHex}`;
  }
  
  export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [saltHex, storedHashHex] = hashedPassword.split(':');
    console.log('SALT HEX FROM HASH:', saltHex);
    console.log('STORED HASH HEX:', storedHashHex);
  
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const storedHash = new Uint8Array(storedHashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password);
    console.log('ENCODED PASSWORD:', encodedPassword);
  
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encodedPassword,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    console.log('KEY MATERIAL IMPORTED:', keyMaterial);
  
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      512
    );
    console.log('DERIVED BITS:', new Uint8Array(derivedBits));
  
    const derivedHash = new Uint8Array(derivedBits);
    console.log('DERIVED HASH:', derivedHash);
  
    const isMatch =
      storedHash.length === derivedHash.length &&
      storedHash.every((byte, i) => byte === derivedHash[i]);
    console.log('PASSWORD MATCHES?', isMatch);
  
    return isMatch;
  }
  