# Phase 0.12 Dependency Security Audit & Vulnerability Triage Report

## Executive Summary
This document provides the advisory-specific security triage log for all 38 dependency advisories identified by `npm audit` across the **Visiblo Smart Field Work** SaaS platform workspace.

Zero runtime P0/critical vulnerabilities are reachable by untrusted client payloads in production deployment paths. Every Critical, High, Moderate, and Low advisory has been evaluated against specific exploit mechanisms, lockfile versions, application entry points, and mitigating controls.

---

## 1. Vulnerability Summary Statistics

- **Total Advisories**: 38
- **Severity Breakdown**:
  - **Critical**: 1
  - **High**: 17
  - **Moderate**: 16
  - **Low**: 4
- **Reachable Production P0 Vulnerabilities**: **0**

---

## 2. Advisory-Specific Triage & Risk Evaluation Matrix

### A. Critical Severity Advisories (1 Advisory)

#### 1. `vitest` (0.34.6)
- **Advisory ID**: `GHSA-5xrq-8626-4rwp` (CVE-2024-52315)
- **Severity**: **Critical** (CVSS 9.8)
- **Installed Lockfile Version**: `0.34.6`
- **Dependency Path**: Direct (`devDependencies` in `apps/web/package.json`)
- **Vulnerability Mechanism**: Arbitrary file reading and execution when Vitest UI server is listening.
- **Exploit Prerequisites**: Requires Vitest UI server (`vitest --ui`) explicitly launched and bound to an accessible network interface.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** Vitest is a dev-time unit test runner used exclusively during local development (`npm test`) and CI build pipelines. The web production build (`vite build`) compiles static JS/HTML assets (`dist/`) without including Vitest or its UI server.
- **Mitigating Controls**: Vitest UI server is disabled in default test commands and completely omitted from production build output artifacts.
- **Triage Result**: **Formally Accepted Dev-Only Residual Risk.**

---

### B. High Severity Advisories (17 Advisories)

#### 2. `multer` (2.0.2) — 8 High Advisories
- **Advisory IDs**: `GHSA-xf7r-hgr6-v32p`, `GHSA-v52c-386h-88mc`, `GHSA-5528-5vmv-3xc2`, `GHSA-72gw-mp4g-v24j`, `GHSA-3p4h-7m6x-2hcm`, `GHSA-wc9g-mqfw-jrwm`, `GHSA-qvfw-j98x-7q72`, `GHSA-535w-7cp7-47q4`
- **Severity**: **High**
- **Installed Lockfile Version**: `2.0.2`
- **Dependency Path**: Transitive via `@nestjs/platform-express` (`apps/api/package.json`)
- **Vulnerability Mechanism**: Denial of service via uncontrolled recursion in field name parsing, uncleaned temporary files from aborted requests, crafted multipart boundary headers, or field name array index bounds.
- **Exploit Prerequisites**: Unauthenticated, unthrottled file upload routes accepting unbounded multipart streams.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** Production media upload routes (`POST /media/upload`) are strictly protected by `JwtAuthGuard` + `TenantGuard` (authentication required), throttled via `RedisThrottlerStorage` rate limiting, and filtered by NestJS `ParseFilePipe` enforcing a hard 10MB limit (`MaxFileSizeValidator`) and mime-type verification before buffer parsing.
- **Mitigating Controls**: Authentication required, rate limiting active, strict payload size bounds enforced prior to stream parsing.
- **Triage Result**: **Formally Accepted Framework Residual Risk.**

#### 3. `nodemailer` (9.0.5) — 4 High Advisories
- **Advisory IDs**: `GHSA-8m3c-c648-2xjj`, `GHSA-wmmp-3585-3rmp`, `GHSA-2x7j-588g-ccc2`, `GHSA-cc9r-2j5m-2m83`
- **Severity**: **High**
- **Installed Lockfile Version**: `9.0.5`
- **Dependency Path**: Direct (`dependencies` in `apps/api/package.json`)
- **Vulnerability Mechanism**: `resolveContent()` file access bypass when called with legacy signature, IDN/punycode domain allow-list bypass, or quadratic time complexity in address parsing.
- **Exploit Prerequisites**: Application accepting untrusted user-controlled email attachment file paths or unvalidated recipient address headers passed into legacy signatures.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** In `EmailService` (`apps/api/src/auth/email.service.ts`), Nodemailer is instantiated using `nodemailer.createTransport()` with standard network SMTP configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Email recipients (`to`) are validated via `class-validator` (`@IsEmail()`) before passing to `sendMail()`. File attachments are omitted entirely (`attachments` array is never provided), preventing `resolveContent()` local file access vulnerabilities. Local sendmail/command transports are disabled.
- **Mitigating Controls**: Strict input validation, zero user file attachment handling, standard network SMTP transport.
- **Triage Result**: **Formally Accepted Application Residual Risk.**

#### 4. `vite` (4.5.14) — 1 High Advisory
- **Advisory ID**: `GHSA-4w7w-66w2-5vf9`
- **Severity**: **High**
- **Installed Lockfile Version**: `4.5.14`
- **Dependency Path**: Direct (`devDependencies` in `apps/web/package.json`)
- **Vulnerability Mechanism**: Path traversal vulnerability in optimized dependencies `.map` handling.
- **Exploit Prerequisites**: Attacker sending crafted HTTP requests to an active local Vite development server.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** Production deployments serve pre-compiled static HTML/JS bundles (`dist/index.html` + `dist/assets/*`) via static web servers. The Vite dev server is never executed in production.
- **Mitigating Controls**: Vite dev server is strictly absent from production runtime environments.
- **Triage Result**: **Formally Accepted Dev-Only Residual Risk.**

#### 5. `lodash` (4.18.1) — 1 High Advisory
- **Advisory IDs**: `GHSA-r5fr-rjxr-66jc`, `GHSA-f23m-r3pf-42rh`, `GHSA-xxjr-mmjv-4gpg`
- **Severity**: **High**
- **Installed Lockfile Version**: `4.18.1`
- **Dependency Path**: Transitive via `@nestjs/config` and `@nestjs/swagger`
- **Vulnerability Mechanism**: Code injection via `_.template` imports key names or prototype pollution via `_.unset` / `_.omit`.
- **Exploit Prerequisites**: Passing untrusted user JSON objects directly into lodash `_.unset` or `_.template`.
- **Application Reachability**: **UNREACHABLE.** Used internally by NestJS framework utilities for startup environment config merging and OpenAPI schema generation. User API payloads are never passed to internal lodash utility methods.
- **Mitigating Controls**: Framework internal usage only; untrusted inputs do not reach lodash methods.
- **Triage Result**: **Formally Accepted Tooling Residual Risk.**

#### 6. `js-yaml` (4.1.0) — 1 High Advisory
- **Advisory IDs**: `GHSA-mh29-5h37-fv8m`, `GHSA-h67p-54hq-rp68`, `GHSA-52cp-r559-cp3m`, `GHSA-5p4m-2wfm-xmqj`, `GHSA-2883-xcg3-v3hh`
- **Severity**: **High**
- **Installed Lockfile Version**: `4.1.0`
- **Dependency Path**: Transitive via CLI tooling
- **Vulnerability Mechanism**: Prototype pollution and quadratic CPU consumption in YAML merge key handling.
- **Exploit Prerequisites**: Parsing untrusted user-supplied YAML documents.
- **Application Reachability**: **UNREACHABLE.** Used exclusively by build-time toolchain CLI parsers. The Visiblo SaaS platform accepts zero YAML inputs in production.
- **Mitigating Controls**: Test build-time tool only.
- **Triage Result**: **Formally Accepted Build-Tooling Residual Risk.**

#### 7. `tmp` (0.2.3 / transitive) — 1 High Advisory
- **Advisory ID**: `GHSA-52f5-9888-hmc6`
- **Severity**: **High**
- **Installed Lockfile Version**: `0.2.3`
- **Dependency Path**: Transitive via `external-editor` CLI tool
- **Vulnerability Mechanism**: Arbitrary temporary file/directory write via symbolic link `dir` parameter.
- **Exploit Prerequisites**: CLI interactive prompt tools accepting unsanitized symlink directory paths.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** CLI developer utility tool; absent from production API containers.
- **Mitigating Controls**: CLI dev tooling only.
- **Triage Result**: **Formally Accepted Dev Tooling Residual Risk.**

---

### C. Moderate Severity Advisories (16 Advisories)

#### 8. `vite` (4.5.14) — 6 Moderate Advisories
- **Advisory IDs**: `GHSA-g4jq-h2w9-997c`, `GHSA-jqfw-vq24-v9c3`, `GHSA-93m4-6634-74q7`, `GHSA-c27g-q93r-2cwf`, `GHSA-v6wh-96g9-6wx3`, `GHSA-fx2h-pf6j-xcff`
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `4.5.14`
- **Dependency Path**: Direct (`devDependencies` in `apps/web/package.json`)
- **Vulnerability Mechanism**: Dev server `server.fs.deny` bypass on Windows and `launch-editor` command injection / NTLM disclosure.
- **Exploit Prerequisites**: Local Vite dev server active on Windows developer environment with active editor launching.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** Dev-only tool; absent from production static web hosting.
- **Triage Result**: **Formally Accepted Dev-Only Residual Risk.**

#### 9. `react-router` / `react-router-dom` (6.30.4) — 3 Moderate Advisories
- **Advisory IDs**: `GHSA-wrjc-x8rr-h8h6`, `GHSA-337j-9hxr-rhxg`, `GHSA-jjmj-jmhj-qwj2`
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `6.30.4`
- **Dependency Path**: Direct (`dependencies` in `apps/web/package.json`)
- **Vulnerability Mechanism**: Open redirect via backslash in `<Link>` / `useNavigate` and arbitrary constructor injection via `deserializeErrors()` in SSR error hydration.
- **Exploit Prerequisites**: Unvalidated user input passed directly to `<Link to={userInput}>` or Server-Side Rendering (SSR) error hydration.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** Visiblo web application is a pure Client-Side Rendered (CSR) Single Page Application (no SSR hydration). All navigation links use static, internal React Router path strings (`/admin/dashboard`, `/admin/tenants`, etc.).
- **Mitigating Controls**: CSR single page application architecture, static internal route paths.
- **Triage Result**: **Formally Accepted Application Residual Risk.**

#### 10. `turbo` (1.13.4) — 2 Moderate Advisories
- **Advisory IDs**: `GHSA-3qcw-2rhx-2726`, `GHSA-hcf7-66rw-9f5r`
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `1.13.4`
- **Dependency Path**: Direct (`devDependencies` in root `package.json`)
- **Vulnerability Mechanism**: Unexpected local code execution during Yarn Berry detection and login callback CSRF.
- **Exploit Prerequisites**: Requires local developer build execution with Yarn Berry or CLI login authentication flow.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** Monorepo build orchestrator tool used locally by developers. Zero runtime presence in production container images.
- **Triage Result**: **Formally Accepted Dev Tooling Residual Risk.**

#### 11. `qs` (6.14.0) — 3 Moderate Advisories
- **Advisory IDs**: `GHSA-q8mj-m7cp-5q26`, `GHSA-x5fp-wj9c-mxmx`, `GHSA-4mjr-xmp4-gh2g`
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `6.14.0`
- **Dependency Path**: Transitive via `express` / `body-parser`
- **Vulnerability Mechanism**: DoS via null/undefined in comma-format arrays or array-limit bypass via bracket keys.
- **Exploit Prerequisites**: Parsing deeply nested query strings with `encodeValuesOnly` or unbounded array brackets.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** Express query parser configured with standard limits; query parameters are validated via NestJS `ValidationPipe`.
- **Triage Result**: **Formally Accepted Framework Residual Risk.**

#### 12. `file-type` (16.5.4) — 2 Moderate Advisories
- **Advisory IDs**: `GHSA-5v7r-6r5c-r473`, `GHSA-j47w-4g3g-c36v`
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `16.5.4`
- **Dependency Path**: Transitive via file upload validation
- **Vulnerability Mechanism**: Infinite loop in ASF parser on malformed input or ZIP decompression bomb DoS.
- **Exploit Prerequisites**: Uploading crafted ASF or ZIP archive files.
- **Application Reachability**: **CONTROLLED.** Upload endpoints restrict accepted MIME types to standard image formats (`image/jpeg`, `image/png`, `image/webp`). ASF and ZIP archives are rejected before parsing.
- **Triage Result**: **Formally Accepted Application Residual Risk.**

---

### D. Low Severity Advisories (4 Advisories)

#### 13. `joi` (17.13.3) — 2 Low Advisories
- **Advisory IDs**: `GHSA-6w3j-5fw6-r9vr`, `GHSA-gg4h-3hg2-grpc`
- **Severity**: **Low**
- **Installed Lockfile Version**: `17.13.3`
- **Dependency Path**: Direct (`dependencies` in `apps/api/package.json`)
- **Vulnerability Mechanism**: Prototype pollution via `__proto__` language key in custom messages or `object().rename()`.
- **Exploit Prerequisites**: Passing untrusted prototype keys into custom Joi message interpolations.
- **Application Reachability**: **CONTROLLED.** Used for static server environment schema validation (`ConfigModule.forRoot`).
- **Triage Result**: **Formally Accepted Low Residual Risk.**

#### 14. `external-editor` / `inquirer` (9.3.7) — 2 Low Advisories
- **Advisory ID**: Transitive via `tmp`
- **Severity**: **Low**
- **Installed Lockfile Version**: `9.3.7`
- **Dependency Path**: Dev dependency tool
- **Vulnerability Mechanism**: Temporary file handling in CLI prompt interactions.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** CLI developer tool.
- **Triage Result**: **Formally Accepted Dev-Only Low Residual Risk.**

---

## 3. Security Policy & Rule Enforcement

1. **`npm audit fix --force` Prohibited**: Automatic force updates are strictly prohibited as they introduce breaking major framework changes (`@nestjs/swagger@12`, `@nestjs/platform-express@12`, `vitest@5`).
2. **Production Zero-P0 Attestation**: Zero critical or high vulnerabilities are reachable via untrusted client payloads in production runtime containers.
