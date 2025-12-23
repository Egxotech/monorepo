import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPayload } from "../types/request-with-user.type";

export const CurrentUser = createParamDecorator((data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as UserPayload;
  return data ? user[data as string] : user;
}); 