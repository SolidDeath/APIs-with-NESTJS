import {
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';

// This decorator adds an another layer of abstraction.
// It is used to get the user object from the request object.
// It is agnostic of the authentication strategy.
export const GetUser = createParamDecorator(
    (
        data: string | undefined,
        ctx: ExecutionContext,
    ) => {
        const request = ctx
            .switchToHttp()
            .getRequest();
        if (data) {
            return request.user[data];
        }
        return request.user;
    },
);
