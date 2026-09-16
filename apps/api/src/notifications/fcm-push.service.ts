import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushMessagePayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  actionUrl?: string;
  imageUrl?: string;
}

export interface PushDispatchResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  simulationMode: boolean;
  messageIds: string[];
  errors: { token: string; error: string }[];
}

@Injectable()
export class FcmPushService implements OnModuleInit {
  private readonly logger = new Logger(FcmPushService.name);
  private firebaseApp: any = null;
  private isSimulationMode = true;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeFirebase();
  }

  private async initializeFirebase() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.isSimulationMode = true;
      this.logger.warn(
        'FCM Push Service: Firebase credentials not configured. Operating in SIMULATION / DRY-RUN mode.',
      );
      return;
    }

    try {
      // Unescape newlines if privateKey was passed in env as single-line string with \n
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      // Dynamic import to support environments where firebase-admin is optional
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const adminModule: any = await import('firebase-admin');
      const admin: any = adminModule.default || adminModule;
      
      if (admin.apps && admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0];
      } else {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }

      this.isSimulationMode = false;
      this.logger.log(
        `FCM Push Service: Initialized Firebase Admin successfully for project [${projectId}].`,
      );
    } catch (err: any) {
      this.isSimulationMode = true;
      this.logger.error(
        `FCM Push Service: Failed to initialize Firebase Admin SDK (${err?.message}). Falling back to SIMULATION mode.`,
      );
    }
  }

  get isInSimulationMode(): boolean {
    return this.isSimulationMode;
  }

  /**
   * Dispatches push notification to an array of device tokens (handles batches of up to 500 per FCM limits)
   */
  async sendMulticast(
    tokens: string[],
    payload: PushMessagePayload,
  ): Promise<PushDispatchResult> {
    if (!tokens || tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
        simulationMode: this.isSimulationMode,
        messageIds: [],
        errors: [],
      };
    }

    const uniqueTokens = Array.from(new Set(tokens.filter(Boolean)));

    if (this.isSimulationMode) {
      this.logger.log(
        `[SIMULATION PUSH] Dispatched to ${uniqueTokens.length} device(s) | Title: "${payload.title}" | Action: ${payload.actionUrl ?? 'none'}`,
      );
      return {
        successCount: uniqueTokens.length,
        failureCount: 0,
        invalidTokens: [],
        simulationMode: true,
        messageIds: uniqueTokens.map((_, i) => `sim-msg-${Date.now()}-${i + 1}`),
        errors: [],
      };
    }

    // Real Firebase Admin SDK execution
    const results: PushDispatchResult = {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
      simulationMode: false,
      messageIds: [],
      errors: [],
    };

    // FCM sendEachForMulticast allows maximum 500 tokens per call
    const CHUNK_SIZE = 500;
    for (let i = 0; i < uniqueTokens.length; i += CHUNK_SIZE) {
      const chunk = uniqueTokens.slice(i, i + CHUNK_SIZE);
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const adminModule: any = await import('firebase-admin');
        const admin: any = adminModule.default || adminModule;
        const messaging = admin.messaging(this.firebaseApp);

        const dataPayload: Record<string, string> = {
          title: payload.title,
          body: payload.body,
          ...(payload.actionUrl ? { actionUrl: payload.actionUrl } : {}),
          ...(payload.data ?? {}),
        };

        const response = await messaging.sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.imageUrl,
          },
          data: dataPayload,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              clickAction: payload.actionUrl,
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          },
          webpush: {
            notification: {
              title: payload.title,
              body: payload.body,
              icon: '/favicon.ico',
            },
            fcmOptions: {
              link: payload.actionUrl || '/',
            },
          },
        });

        results.successCount += response.successCount;
        results.failureCount += response.failureCount;

        response.responses.forEach((resp, idx) => {
          const currentToken = chunk[idx];
          if (resp.success && resp.messageId) {
            results.messageIds.push(resp.messageId);
          } else if (resp.error) {
            const errorCode = resp.error.code;
            results.errors.push({
              token: currentToken,
              error: resp.error.message,
            });

            // If token is invalid or uninstalled, mark for deactivation
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              results.invalidTokens.push(currentToken);
            }
          }
        });
      } catch (batchErr: any) {
        this.logger.error(`Failed to send push batch: ${batchErr?.message}`);
        results.failureCount += chunk.length;
        chunk.forEach((t) => {
          results.errors.push({ token: t, error: batchErr?.message || 'Batch send failed' });
        });
      }
    }

    return results;
  }
}
