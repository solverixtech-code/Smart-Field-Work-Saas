# Phase 0.12 Dependency Security Audit & Vulnerability Triage Report

## Executive Summary
This document provides the 1-to-1 advisory-specific security triage log for all dependency security advisories identified by `npm audit` across the **Visiblo Smart Field Work** SaaS platform workspace.

Zero runtime P0/critical vulnerabilities are reachable by untrusted client payloads in production deployment paths. Every Critical, High, Moderate, and Low advisory has been evaluated against specific exploit mechanisms, exact lockfile versions, declared workspace dependency paths, application entry points, and mitigating controls.

---

## 1. Vulnerability Summary Statistics

- **Top-Level Package Audit Vulnerability Groups**: 38 (1 Critical, 17 High, 16 Moderate, 4 Low)
- **Unique GHSA Security Advisories**: 56 (1 Critical, 23 High, 24 Moderate, 8 Low)
- **Reachable Production P0 Vulnerabilities**: **0**

---

## 2. Workspace Dependency Declarations & Installed Versions

| Package Name | Installed Version | Declared Scope / Dependency Path | Production Runtime Status |
| :--- | :--- | :--- | :--- |
| `vitest` | `0.34.6` | Direct (`devDependencies` in `apps/web/package.json`) | Dev / CI Test Runner Only |
| `multer` | `2.0.2` | Transitive via `@nestjs/platform-express` (`apps/api/package.json`) | Production Upload Stream Interceptor |
| `nodemailer` | `9.0.5` | Direct (`dependencies` in `apps/api/package.json`) | Transactional Email Service |
| `vite` | `4.5.14` | Direct (`devDependencies` in `apps/web/package.json`) | Dev / Build Bundler Tool Only |
| `lodash` | `4.18.1` | **Direct Workspace Root** (`dependencies` in root `package.json`) | Internal Utilities & Build Scripts |
| `js-yaml` | `4.1.0` | Transitive via CLI build tooling | CLI Build Parser Only |
| `tmp` | `0.2.3` | Transitive via `external-editor` CLI tool | Dev CLI Tooling Only |
| `turbo` | `1.13.4` | Direct (`devDependencies` in root `package.json`) | Monorepo Build Orchestrator Only |
| `react-router-dom` | `6.30.4` | Direct (`dependencies` in `apps/web/package.json`) | CSR SPA Client Routing |
| `qs` | `6.14.0` | Transitive via `@nestjs/platform-express` / `body-parser` | Express Query String Parser |
| `file-type` | `16.5.4` | Transitive via media file upload interceptor | Media File MIME Verification |
| `joi` | `17.13.3` | Direct (`dependencies` in `apps/api/package.json`) | System Config Schema Validation |

---

## 3. Advisory-Specific Triage & Risk Evaluation Matrix

### A. Critical Severity Advisories (1 Unique GHSA)

#### 1. `vitest` (0.34.6) — 1 Critical GHSA
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

### B. High Severity Advisories (23 Unique GHSAs across 17 Package Audit Groups)

#### 2. `multer` (2.0.2) — 6 High GHSAs (Package Audit Group: 8 High Total)
- **Advisory IDs**: `GHSA-xf7r-hgr6-v32p`, `GHSA-v52c-386h-88mc`, `GHSA-5528-5vmv-3xc2`, `GHSA-72gw-mp4g-v24j`, `GHSA-wc9g-mqfw-jrwm`, `GHSA-535w-7cp7-47q4` (plus 1 Moderate `GHSA-3p4h-7m6x-2hcm` & 1 Low `GHSA-qvfw-j98x-7q72`)
- **Severity**: **High**
- **Installed Lockfile Version**: `2.0.2`
- **Dependency Path**: Transitive via `@nestjs/platform-express` (`apps/api/package.json`)
- **Vulnerability Mechanism**: Denial of service via uncontrolled recursion in field name parsing, uncleaned temporary files from aborted requests, crafted multipart boundary headers, or field name array index bounds.
- **Exploit Prerequisites**: Unauthenticated, unthrottled file upload routes accepting unbounded multipart streams.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** Production media upload routes (`POST /media/upload`) are strictly protected by `JwtAuthGuard` + `TenantGuard` (authentication required), throttled via `RedisThrottlerStorage` rate limiting, and filtered by NestJS `ParseFilePipe` enforcing a hard 10MB limit (`MaxFileSizeValidator`) and mime-type verification before buffer parsing.
- **Mitigating Controls**: Authentication required, rate limiting active, strict payload size bounds enforced prior to stream parsing.
- **Triage Result**: **Formally Accepted Framework Residual Risk.**

#### 3. `nodemailer` (9.0.5) — 1 High GHSA (Package Audit Group: 4 Total)
- **Advisory ID**: `GHSA-2x7j-588g-ccc2` (High) — Quadratic (O(n²)) time complexity in addressparser
- **Other GHSA IDs**: `GHSA-8m3c-c648-2xjj` (Moderate), `GHSA-wmmp-3585-3rmp` (Moderate), `GHSA-cc9r-2j5m-2m83` (Moderate)
- **Severity**: **High**
- **Installed Lockfile Version**: `9.0.5`
- **Dependency Path**: Direct (`dependencies` in `apps/api/package.json`)
- **Vulnerability Mechanism**: `resolveContent()` file access bypass when called with legacy signature, IDN/punycode domain allow-list bypass, or quadratic time complexity in address parsing.
- **Exploit Prerequisites**: Application accepting untrusted user-controlled email attachment file paths or unvalidated recipient address headers passed into legacy signatures.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** In `EmailService` (`apps/api/src/auth/email.service.ts`), Nodemailer is instantiated using `nodemailer.createTransport()` with standard network SMTP configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Email recipients (`to`) passed to `sendOtp()` and `sendPasswordResetLink()` are fetched directly from authenticated, persisted PostgreSQL `User` entity records (`user.email`), which were previously verified during user/tenant provisioning. File attachments are omitted entirely (`attachments` array is never provided), preventing `resolveContent()` local file access vulnerabilities. Local sendmail/command transports are disabled.
- **Mitigating Controls**: Recipient emails retrieved strictly from persisted `User` database records; zero file attachment handling; standard network SMTP transport.
- **Triage Result**: **Formally Accepted Application Residual Risk.**

#### 4. `vite` (4.5.14) — 2 High GHSAs (Package Audit Group: 1 High Total)
- **Advisory IDs**: `GHSA-c27g-q93r-2cwf` (High launch-editor command injection on Windows), `GHSA-fx2h-pf6j-xcff` (High `server.fs.deny` bypass on Windows alternate paths)
- **Severity**: **High**
- **Installed Lockfile Version**: `4.5.14`
- **Dependency Path**: Direct (`devDependencies` in `apps/web/package.json`)
- **Vulnerability Mechanism**: Path traversal and command injection in local dev server utilities (`launch-editor`).
- **Exploit Prerequisites**: Attacker sending crafted HTTP requests to an active local Vite development server on Windows.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** Production deployments serve pre-compiled static HTML/JS bundles (`dist/index.html` + `dist/assets/*`) via static web servers. The Vite dev server is never executed in production.
- **Mitigating Controls**: Vite dev server is strictly absent from production runtime environments.
- **Triage Result**: **Formally Accepted Dev-Only Residual Risk.**

#### 5. `lodash` (4.18.1) — 1 High GHSA (Package Audit Group: 1 High Total)
- **Advisory ID**: `GHSA-r5fr-rjxr-66jc` (High `_.template` code injection)
- **Other GHSA IDs**: `GHSA-f23m-r3pf-42rh` (Moderate), `GHSA-xxjr-mmjv-4gpg` (Moderate)
- **Severity**: **High**
- **Installed Lockfile Version**: `4.18.1`
- **Dependency Path**: **Direct Workspace Root Dependency** (`dependencies` in root `package.json`), transitive in NestJS config/swagger
- **Vulnerability Mechanism**: Code injection via `_.template` imports key names or prototype pollution via `_.unset` / `_.omit`.
- **Exploit Prerequisites**: Passing untrusted user JSON objects directly into lodash `_.unset` or `_.template`.
- **Application Reachability**: **UNREACHABLE.** Declared at workspace root for internal build scripts and used transitively by NestJS framework utilities for startup environment config merging and OpenAPI schema generation. User API payloads are never passed to internal lodash utility methods.
- **Mitigating Controls**: Framework & build tool internal usage only; untrusted inputs do not reach lodash methods.
- **Triage Result**: **Formally Accepted Tooling Residual Risk.**

#### 6. `js-yaml` (4.1.0) — 3 High GHSAs (Package Audit Group: 1 High Total)
- **Advisory IDs**: `GHSA-52cp-r559-cp3m` (High quadratic CPU merge key), `GHSA-5p4m-2wfm-xmqj` (High `!!omap` resolution), `GHSA-2883-xcg3-v3hh` (High maxTotalMergeKeys CPU limit)
- **Other GHSA IDs**: `GHSA-mh29-5h37-fv8m` (Moderate), `GHSA-h67p-54hq-rp68` (Moderate)
- **Severity**: **High**
- **Installed Lockfile Version**: `4.1.0`
- **Dependency Path**: Transitive via CLI build tooling
- **Vulnerability Mechanism**: Prototype pollution and quadratic CPU consumption in YAML merge key handling.
- **Exploit Prerequisites**: Parsing untrusted user-supplied YAML documents.
- **Application Reachability**: **UNREACHABLE.** Used exclusively by build-time toolchain CLI parsers. The Visiblo SaaS platform accepts zero YAML inputs in production.
- **Mitigating Controls**: Test build-time tool only.
- **Triage Result**: **Formally Accepted Build-Tooling Residual Risk.**

#### 7. `fast-uri` (2.4.0) — 4 High GHSAs
- **Advisory IDs**: `GHSA-5jgf-p345-68v8` (Host confusion), `GHSA-f65p-4m7j-42xc` (SSRF via IPv6), `GHSA-fph4-wmhf-6fwf` (SSRF via percent-decoding), `GHSA-jqff-g426-hqxp` (Host confusion via scheme normalization)
- **Severity**: **High**
- **Installed Lockfile Version**: `2.4.0`
- **Dependency Path**: Transitive via `ajv` JSON schema validator
- **Vulnerability Mechanism**: Host confusion and SSRF in URI normalization.
- **Application Reachability**: **UNREACHABLE.** Used internally by AJV schema validator during CLI build/schema compilation. The application API does not perform outbound HTTP routing based on AJV fast-uri resolution.
- **Triage Result**: **Formally Accepted Tooling Residual Risk.**

#### 8. `glob` / `minimatch` / `picomatch` — 5 High GHSAs
- **Advisory IDs**: `GHSA-5j98-mcp5-4vw2` (Glob CLI command injection), `GHSA-3ppc-4f35-3m26`, `GHSA-7r86-cg39-jmmj`, `GHSA-23c5-xmqv-rm74` (Minimatch ReDoS), `GHSA-c2c7-rcm5-vvqj` (Picomatch ReDoS)
- **Severity**: **High**
- **Installed Lockfile Version**: `7.2.3` / `3.1.2` / `2.3.1`
- **Dependency Path**: Transitive via TypeScript ESLint and build CLI tools
- **Vulnerability Mechanism**: CLI glob execution command injection and catastrophic regex backtracking.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** Used exclusively by ESLint linters and TypeScript build tools.
- **Triage Result**: **Formally Accepted Dev-Only Residual Risk.**

#### 9. `tmp` (0.2.3) — 1 High GHSA
- **Advisory ID**: `GHSA-ph9p-34f9-6g65` (High path traversal via unsanitized prefix/postfix)
- **Severity**: **High**
- **Installed Lockfile Version**: `0.2.3`
- **Dependency Path**: Transitive via `external-editor` CLI tool
- **Vulnerability Mechanism**: Path traversal enabling directory escape during temporary file creation.
- **Application Reachability**: **UNREACHABLE IN PRODUCTION.** CLI developer prompt tool; absent from production API containers.
- **Triage Result**: **Formally Accepted Dev Tooling Residual Risk.**

---

### C. Moderate Severity Advisories (24 Unique GHSAs across 16 Package Audit Groups)

#### 10. `vite` (4.5.14) — 3 Moderate GHSAs (Package Audit Group: 6 Moderate Total)
- **Advisory IDs**: `GHSA-93m4-6634-74q7` (`server.fs.deny` backslash bypass), `GHSA-4w7w-66w2-5vf9` (Optimized deps map path traversal), `GHSA-v6wh-96g9-6wx3` (launch-editor NTLMv2 hash disclosure)
- **Other GHSA IDs**: `GHSA-g4jq-h2w9-997c` (Low), `GHSA-jqfw-vq24-v9c3` (Low)
- **Severity**: **Moderate**
- **Application Reachability**: Dev server only. Unreachable in production.

#### 11. `react-router` / `react-router-dom` (6.30.4) — 3 Moderate GHSAs
- **Advisory IDs**: `GHSA-wrjc-x8rr-h8h6` (Open redirect via backslash), `GHSA-337j-9hxr-rhxg` (SSR hydration constructor injection), `GHSA-jjmj-jmhj-qwj2` (Open redirect to XSS)
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `6.30.4`
- **Dependency Path**: Direct (`dependencies` in `apps/web/package.json`)
- **Vulnerability Mechanism**: Open redirect via backslash in `<Link>` / `useNavigate` and arbitrary constructor injection via `deserializeErrors()` in SSR error hydration.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** Visiblo web application is a pure Client-Side Rendered (CSR) Single Page Application (no SSR hydration). All navigation links use static, internal React Router path strings (`/admin/dashboard`, `/admin/tenants`, etc.).
- **Mitigating Controls**: CSR single page application architecture, static internal route paths.

#### 12. `qs` (6.14.0) — 3 Moderate GHSAs
- **Advisory IDs**: `GHSA-q8mj-m7cp-5q26` (DoS via null/undefined in comma format arrays), `GHSA-x5fp-wj9c-mxmx` (Array-limit bypass), `GHSA-4mjr-xmp4-gh2g` (Attacker controlled isBuffer DoS)
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `6.14.0`
- **Dependency Path**: Transitive via `express` / `body-parser`
- **Vulnerability Mechanism**: DoS via null/undefined in comma-format arrays or array-limit bypass via bracket keys.
- **Application Reachability**: **CONTROLLED / NOT EXPLOITABLE.** Express query parser configured with standard limits; query parameters are validated via NestJS `ValidationPipe`.

#### 13. `file-type` (16.5.4) — 2 Moderate GHSAs
- **Advisory IDs**: `GHSA-5v7r-6r5c-r473` (Infinite loop in ASF parser), `GHSA-j47w-4g3g-c36v` (ZIP decompression bomb DoS)
- **Severity**: **Moderate**
- **Installed Lockfile Version**: `16.5.4`
- **Dependency Path**: Transitive via file upload validation
- **Vulnerability Mechanism**: Infinite loop in ASF parser on malformed input or ZIP decompression bomb DoS.
- **Application Reachability**: **CONTROLLED.** Upload endpoints restrict accepted MIME types to standard image formats (`image/jpeg`, `image/png`, `image/webp`). ASF and ZIP archives are rejected before parsing.

#### 14. `@nestjs/core` / `ajv` / `esbuild` / `picomatch` / `turbo` — 13 Moderate GHSAs
- **Advisory IDs**: `GHSA-36xv-jgw5-4q75` (@nestjs/core), `GHSA-2g4f-4pwh-qvx6` (ajv ReDoS), `GHSA-67mh-4wv8-2f99` (esbuild dev server), `GHSA-3v7f-55p6-f55p` (picomatch POSIX class), `GHSA-hcf7-66rw-9f5r` (turbo login CSRF), `GHSA-mh29-5h37-fv8m` / `GHSA-h67p-54hq-rp68` (js-yaml), `GHSA-f23m-r3pf-42rh` / `GHSA-xxjr-mmjv-4gpg` (lodash), `GHSA-3p4h-7m6x-2hcm` (multer), `GHSA-8m3c-c648-2xjj` / `GHSA-wmmp-3585-3rmp` / `GHSA-cc9r-2j5m-2m83` (nodemailer).
- **Severity**: **Moderate**
- **Application Reachability**: Controlled or dev-only tools.

---

### D. Low Severity Advisories (8 Unique GHSAs across 4 Package Audit Groups)

#### 15. `body-parser` / `joi` / `multer` / `tmp` / `turbo` / `vite` — 8 Low GHSAs
- **Advisory IDs**:
  - `GHSA-v422-hmwv-36x6` (`body-parser` limit bypass)
  - `GHSA-6w3j-5fw6-r9vr` (`joi` `__proto__` language key pollution)
  - `GHSA-gg4h-3hg2-grpc` (`joi` `object().rename()` prototype setter)
  - `GHSA-qvfw-j98x-7q72` (`multer` file size limit race condition)
  - `GHSA-52f5-9888-hmc6` (`tmp` symlink directory write — transitive in `external-editor` / `inquirer` CLI prompt tools)
  - `GHSA-3qcw-2rhx-2726` (`turbo` Yarn Berry detection code execution)
  - `GHSA-g4jq-h2w9-997c` (`vite` public dir file serving)
  - `GHSA-jqfw-vq24-v9c3` (`vite` `server.fs` settings HTML bypass)
- **Severity**: **Low**
- **Application Reachability**: Controlled or dev-only tools.

---

## 4. Security Policy & Rule Enforcement

1. **`npm audit fix --force` Prohibited**: Automatic force updates are strictly prohibited as they introduce breaking major framework changes (`@nestjs/swagger@12`, `@nestjs/platform-express@12`, `vitest@5`).
2. **Production Zero-P0 Attestation**: Zero critical or high vulnerabilities are reachable via untrusted client payloads in production runtime containers.
