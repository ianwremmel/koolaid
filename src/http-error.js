import extendError from 'extend-error';

const HttpError = extendError({
  subTypeName: `HttpError`
});

export default HttpError;

export function middleware() {
  return function handler(err, req, res, next) {
    if (!(err instanceof HttpError)) {
      return next(err);
    }

    return res
      .status(err.code)
      .json({
        error: err.toString()
      })
      .end();
  };
}

export const BadRequest = extendError(HttpError, {
  subTypeName: `BadRequest`,
  properties: {
    code: 400
  }
});

export const Unauthorized = extendError(BadRequest, {
  subTypeName: `Unauthorized`,
  properties: {
    code: 401
  }
});

export const PaymentRequired = extendError(BadRequest, {
  subTypeName: `PaymentRequired`,
  properties: {
    code: 402
  }
});

export const Forbidden = extendError(BadRequest, {
  subTypeName: `Forbidden`,
  properties: {
    code: 403
  }
});

export const NotFound = extendError(BadRequest, {
  subTypeName: `NotFound`,
  properties: {
    code: 404
  }
});

export const MethodNotAllowed = extendError(BadRequest, {
  subTypeName: `MethodNotAllowed`,
  properties: {
    code: 405
  }
});

export const NotAcceptable = extendError(BadRequest, {
  subTypeName: `NotAcceptable`,
  properties: {
    code: 406
  }
});

export const ProxyAuthenticationRequired = extendError(BadRequest, {
  subTypeName: `ProxyAuthenticationRequired`,
  properties: {
    code: 407
  }
});

export const RequestTimeout = extendError(BadRequest, {
  subTypeName: `RequestTimeout`,
  properties: {
    code: 408
  }
});

export const Conflict = extendError(BadRequest, {
  subTypeName: `Conflict`,
  properties: {
    code: 409
  }
});

export const Gone = extendError(BadRequest, {
  subTypeName: `Gone`,
  properties: {
    code: 410
  }
});

export const LengthRequired = extendError(BadRequest, {
  subTypeName: `LengthRequired`,
  properties: {
    code: 411
  }
});

export const PreconditionFailed = extendError(BadRequest, {
  subTypeName: `PreconditionFailed`,
  properties: {
    code: 412
  }
});

export const RequestEntityTooLarge = extendError(BadRequest, {
  subTypeName: `RequestEntityTooLarge`,
  properties: {
    code: 413
  }
});

export const RequestUriTooLong = extendError(BadRequest, {
  subTypeName: `RequestUriTooLong`,
  properties: {
    code: 414
  }
});

export const UnsupportedMediaType = extendError(BadRequest, {
  subTypeName: `UnsupportedMediaType`,
  properties: {
    code: 415
  }
});

export const RequestRangeNotSatisfiable = extendError(BadRequest, {
  subTypeName: `RequestRangeNotSatisfiable`,
  properties: {
    code: 416
  }
});

export const ExpectationFailed = extendError(BadRequest, {
  subTypeName: `ExpectationFailed`,
  properties: {
    code: 417
  }
});

export const InternalServerError = extendError(HttpError, {
  subTypeName: `InternalServerError`,
  properties: {
    code: 500
  }
});

export const NotImplemented = extendError(InternalServerError, {
  subTypeName: `NotImplemented`,
  properties: {
    code: 501
  }
});

export const BadGateway = extendError(InternalServerError, {
  subTypeName: `BadGateway`,
  properties: {
    code: 502
  }
});

export const ServiceUnavailable = extendError(InternalServerError, {
  subTypeName: `ServiceUnavailable`,
  properties: {
    code: 503
  }
});

export const GatewayTimeout = extendError(InternalServerError, {
  subTypeName: `GatewayTimeout`,
  properties: {
    code: 504
  }
});

export const HttpVersionNotSupported = extendError(InternalServerError, {
  subTypeName: `HttpVersionNotSupported`,
  properties: {
    code: 505
  }
});
