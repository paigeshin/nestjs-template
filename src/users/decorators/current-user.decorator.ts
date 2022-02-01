import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// if you assign `never` type to data, it won't receive any arguments
// ex) @CurrentUser('abcd') => error
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log(request.session.userId); // we can get session
    return request.currentUser;
  },
);
