import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestPrincipal } from '../security/request-principal.interface';

export const CurrentPrincipal = createParamDecorator(
  (data: keyof RequestPrincipal | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const principal: RequestPrincipal | undefined = request.principal;

    if (!principal) return undefined;
    return data ? principal[data] : principal;
  },
);
