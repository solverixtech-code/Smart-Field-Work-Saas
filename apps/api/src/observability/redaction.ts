/** Shared fail-closed JSON boundary for durable audit and structured diagnostics. */
export type SafeJson =
  null | boolean | number | string | SafeJson[] | { [key: string]: SafeJson };
export const REDACTION_VERSION = 1;
const secretKeys = new Set([
  "password",
  "passwordhash",
  "passwordresettokenhash",
  "resettoken",
  "resettokenhash",
  "accesstoken",
  "accessjwt",
  "refreshtoken",
  "refreshjwt",
  "refreshtokenhash",
  "token",
  "tokenhash",
  "jwt",
  "jwtaccesssecret",
  "jwtrefreshsecret",
  "otp",
  "otphash",
  "otpcode",
  "challenge",
  "challengehash",
  "authorization",
  "cookie",
  "setcookie",
  "headers",
  "secret",
  "secretkey",
  "apikey",
  "accesskey",
  "accesskeyid",
  "secretaccesskey",
  "sessiontoken",
  "privatekey",
  "databaseurl",
  "connectionstring",
  "credentials",
  "paymentcredentials",
  "providersecret",
  "signedurl",
  "uploadurl",
  "downloadurl",
  "presignedurl",
  "signature",
  "xamzsignature",
  "xamzcredential",
  "xamzsecuritytoken",
  "s3accesskey",
  "s3secretkey",
  "currentpassword",
  "newpassword",
  "confirmpassword",
  "passwordconfirmation",
  "accesstokenhash",
  "jwtsecret",
  "dburl",
  "mongourl",
  "smtppass",
  "smtppassword",
  "smsapikey",
  "providertoken",
  "webhooksecret",
  "cardnumber",
  "cvv",
  "cvc",
]);
const normalizeKey = (key: string) =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");
function cleanString(value: string): string {
  if (
    /Bearer\s+\S+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|(?:postgres(?:ql)?|mongodb(?:\+srv)?|redis):\/\/|[?&](?:X-Amz-(?:Signature|Credential|Security-Token)|signature|token)=|-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(
      value,
    )
  )
    return "[REDACTED]";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 2000);
}

export function redact(value: unknown): SafeJson {
  const ancestors = new Set<object>();
  let nodes = 0;
  function visit(input: unknown, depth: number): SafeJson {
    if (++nodes > 2000 || depth > 8) throw new Error("REDACTION_BOUNDS");
    if (input === null || input === undefined) return null;
    if (typeof input === "string") return cleanString(input);
    if (typeof input === "boolean") return input;
    if (typeof input === "number" && Number.isFinite(input)) return input;
    if (input instanceof Date && Number.isFinite(input.getTime()))
      return input.toISOString();
    if (typeof input !== "object" || input === null || ancestors.has(input))
      throw new Error("REDACTION_INVALID_JSON");
    if (
      !Array.isArray(input) &&
      Object.getPrototypeOf(input) !== Object.prototype &&
      Object.getPrototypeOf(input) !== null
    )
      throw new Error("REDACTION_INVALID_OBJECT");
    ancestors.add(input);
    let result: SafeJson;
    if (Array.isArray(input)) {
      if (input.length > 50) throw new Error("REDACTION_ARRAY_BOUNDS");
      result = input.map((entry) => visit(entry, depth + 1));
    } else {
      const entries = Object.getOwnPropertyDescriptors(input);
      const keys = Object.keys(entries);
      if (keys.length > 50) throw new Error("REDACTION_OBJECT_BOUNDS");
      const output: { [key: string]: SafeJson } = Object.create(null);
      for (const key of keys) {
        if (key.length > 100 || /[\u0000-\u001f\u007f]/.test(key))
          throw new Error("REDACTION_KEY_BOUNDS");
        const descriptor = entries[key];
        if (!("value" in descriptor)) throw new Error("REDACTION_ACCESSOR");
        output[key] = secretKeys.has(normalizeKey(key))
          ? "[REDACTED]"
          : visit(descriptor.value, depth + 1);
      }
      result = output;
    }
    ancestors.delete(input);
    return result;
  }
  const result = visit(value, 0);
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > 32768)
    throw new Error("REDACTION_BYTES");
  return result;
}

export function redactDiagnostic(value: unknown): SafeJson {
  try {
    return redact(value);
  } catch {
    return { redactionError: true };
  }
}
