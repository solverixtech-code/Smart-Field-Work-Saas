import * as Joi from 'joi';

export interface EnvironmentVariables {
  NODE_ENV?: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  FRONTEND_URL?: string;
  PORT?: number;
  THROTTLE_ENABLED?: boolean;
  RATE_LIMIT_TTL_MS: number;
  RATE_LIMIT_LIMIT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  REDIS_KEY_PREFIX: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  SMS_PROVIDER_URL?: string;
  SMS_USERNAME?: string;
  SMS_API_KEY?: string;
  SMS_ROUTE?: string;
  SMS_SENDER?: string;
}

export const validationSchemaForEnv = Joi.object<EnvironmentVariables, true>({
  NODE_ENV: Joi.string().default('development'),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  FRONTEND_URL: Joi.string().uri().allow('').optional(),
  PORT: Joi.number().integer().positive().default(5002),
  THROTTLE_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  RATE_LIMIT_TTL_MS: Joi.number().integer().positive().default(60000),
  RATE_LIMIT_LIMIT: Joi.number().integer().positive().default(120),
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().integer().positive().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().integer().min(0).default(0),
  REDIS_KEY_PREFIX: Joi.string().default('visiblo:'),
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().integer().positive().default(587),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  SMTP_FROM: Joi.string().allow('').default('noreply@visibloai.com'),
  SMS_PROVIDER_URL: Joi.string().uri().allow('').optional(),
  SMS_USERNAME: Joi.string().allow('').optional(),
  SMS_API_KEY: Joi.string().allow('').optional(),
  SMS_ROUTE: Joi.string().allow('').optional(),
  SMS_SENDER: Joi.string().allow('').optional(),
});
