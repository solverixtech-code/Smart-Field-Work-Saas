# Phase 0.10 media security contract

Status: implemented candidate contract, with final validation pending. Real AWS readiness is an unverified deployment gate.

The adapter follows the official [S3 PutObject conditional-write/checksum contract](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html) and [HeadObject checksum-mode contract](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html). KMS deployments must supply the corresponding checksum-read permissions. Real S3 calls are not represented by the recording adapter tests.

Inventory: `common/services/StorageService` uses existing `@aws-sdk/client-s3`, explicit S3_ACCESS_KEY/S3_SECRET_KEY values, PutObjectCommand and permanent avatar URLs. AuthModule provides it; AuthService.uploadAvatar persists User.avatarUrl. Attendance DTO/repository and PunchLog.photoUrl carry legacy URLs; TenantBranding.logoUrl is a separate legacy contract. Do not migrate these URLs, infer Tenant ownership, or alter their responses. New private assets use the SDK dependency through a separate private adapter, not the legacy public-URL behavior. SDK presigner is the only justified additional storage helper if not already installed.

| Fields | Authority / producer | Scope / consumer | Retention / security | Transaction / frozen owner |
| --- | --- | --- | --- | --- |
| id, tenantId, creatorUserId, creatorMembershipId | UUID server and selected membership | Tenant only / media service | Membership must belong to Tenant and actor; no null Tenant assets | Immutable ownership and FK constraints; 0.3 remains authority |
| provider, bucket, objectKey | Validated server configuration and random key | Internal adapter only | Never ordinary metadata/audit/job output; no public ACL | Immutable; unique object identity |
| displayName, mimeType, expectedBytes, checksumSha256 | Strict upload-intent validation | Tenant / signer and trusted HEAD validation | Safe attachment name, configured MIME/size allowlist; SHA-256 not ETag as checksum | Positive bounded bytes, no extension-based MIME authority |
| status, uploadExpiresAt, completedAt, deletedAt, revision | Service and fenced job handler | UPLOAD_PENDING, READY, DELETE_PENDING, DELETED, FAILED | Soft lifecycle; expired pending not downloadable; cleanup/retention deferred | Conditional updates; delete intent and job commit atomically |
| observed bytes/type/checksum, ETag | Trusted S3 HEAD | Internal completion checks | Do not trust client completion metadata | Repeat READY completion checks object still matches |

Key: `tenants/<tenantId>/media/<assetId>/<randomUUID>` under a validated optional configured prefix. Never accept bucket/key/provider/Tenant from request body. Signed URLs necessarily encode object location but DTOs do not expose independent raw bucket/key fields.

Configuration: disabled by default; when enabled require explicit region, bucket, size cap, safe MIME allowlist, encryption mode, bounded PUT/GET TTLs. Use AWS default credential chain; no hard-coded credential requirement and no test-adapter production fallback. Initially safe allowlist choices are image/jpeg, image/png, image/webp, application/pdf; configured subset required, no implicit production allow-all. Reject HTML/JS/executable and SVG until separate review. Deployment owner reviews actual MIME/size/bucket/IAM/encryption/public-access policy. No malware scanning claim.

Tenant APIs reuse JWT -> principal -> membership -> permission -> subscription guards. `system.media.manage` for upload/complete/delete, `system.media.view` for private download. Tenant admin follows existing registry grants; other roles receive no blanket delete. Platform support has no implicit tenant-media access.

POST `/tenant/media/assets/upload-intent`: persist scoped UPLOAD_PENDING and safe audit, issue short signed PUT for fixed content type/length/SHA-256 with conditional create-only write protection. POST `/:id/complete`: scope first, HEAD expected object, exact size/type/checksum; READY only on match. GET `/:id/download-url`: READY and scoped, short signed GET with sanitized attachment disposition. DELETE `/:id`: mark DELETE_PENDING + idempotent media.delete-object job + audit atomically, no synchronous external deletion. Known foreign UUID returns 404 before provider operation. Repeated delete returns same lifecycle/intent without new destructive job.

Readiness: shared readiness endpoint checks database and enabled S3 config plus non-destructive HeadBucket; never uploads/deletes health objects. CI uses strict recording adapter through explicit test injection. Production adapter genuinely signs/HEADs/deletes S3 objects. Bucket public access block, IAM least privilege, encryption and browser S3 CORS require external deployment evidence; no AWS credentials required in CI and no fabricated PASS.
