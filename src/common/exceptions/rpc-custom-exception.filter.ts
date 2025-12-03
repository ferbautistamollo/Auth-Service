import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';
import { ErrorDto } from '../dtos/error.dto';
import { throwError } from 'rxjs';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcCustomExceptionFilter');
  catch(exception: RpcException, host: ArgumentsHost) {
    this.logger.debug('RpcCustomExceptionFilter');

    const context = host.switchToRpc();

    const error = new ErrorDto();
    error.message = Object(exception.getError()).message;
    error.statusCode = Object(exception.getError()).code;
    error.data = context.getData();
    error.args = context.getContext().args?.filter((e) => {
      if (e != null) return e;
    });
    this.logger.error(JSON.stringify(error));
    return throwError(() => error ?? 'Internal server error');
  }
}
