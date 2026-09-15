import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { ZodError } from "zod";
/** Keep the Nest envelope while avoiding query URLs, input values and unknown keys in validation errors. */
@Catch(ZodError)
export class CrmValidationFilter implements ExceptionFilter {
  catch(error: ZodError, host: ArgumentsHost) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message:
        issue.code === "unrecognized_keys"
          ? "Remove unsupported fields."
          : issue.code === "invalid_enum_value"
            ? "Choose a supported value."
            : issue.message,
    }));
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(400)
      .json({
        statusCode: 400,
        error: "Bad Request",
        message: "CRM validation failed",
        details,
      });
  }
}
