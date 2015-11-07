import extendError from 'extend-error';

const HttpError = extendError({
  subTypeName: `HttpError`
});

export function middleware() {
  return function(err, req, res, next) {
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

const BadRequest = extendError(HttpError, {
  subTypeName: `BadRequest`,
  properties: {
    code: 400
  }
});

const Unauthorized = extendError(BadRequest, {
  subTypeName: `Unauthorized`,
  properties: {
    code: 401
  }
});

const PaymentRequired = extendError(BadRequest, {
  subTypeName: `PaymentRequired`,
  properties: {
    code: 402
  }
});

const Forbidden = extendError(BadRequest, {
  subTypeName: `Forbidden`,
  properties: {
    code: 403
  }
});

const NotFound = extendError(BadRequest, {
  subTypeName: `NotFound`,
  properties: {
    code: 404
  }
});

const MethodNotAllowed = extendError(BadRequest, {
  subTypeName: `MethodNotAllowed`,
  properties: {
    code: 405
  }
});

const NotAcceptable = extendError(BadRequest, {
  subTypeName: `NotAcceptable`,
  properties: {
    code: 406
  }
});

const ProxyAuthenticationRequired = extendError(BadRequest, {
  subTypeName: `ProxyAuthenticationRequired`,
  properties: {
    code: 407
  }
});

const RequestTimeout = extendError(BadRequest, {
  subTypeName: `RequestTimeout`,
  properties: {
    code: 408
  }
});

const Conflict = extendError(BadRequest, {
  subTypeName: `Conflict`,
  properties: {
    code: 409
  }
});

const Gone = extendError(BadRequest, {
  subTypeName: `Gone`,
  properties: {
    code: 410
  }
});

const LengthRequired = extendError(BadRequest, {
  subTypeName: `LengthRequired`,
  properties: {
    code: 411
  }
});

const PreconditionFailed = extendError(BadRequest, {
  subTypeName: `PreconditionFailed`,
  properties: {
    code: 412
  }
});

const RequestEntityTooLarge = extendError(BadRequest, {
  subTypeName: `RequestEntityTooLarge`,
  properties: {
    code: 413
  }
});

const RequestUriTooLong = extendError(BadRequest, {
  subTypeName: `RequestUriTooLong`,
  properties: {
    code: 414
  }
});

const UnsupportedMediaType = extendError(BadRequest, {
  subTypeName: `UnsupportedMediaType`,
  properties: {
    code: 415
  }
});

const RequestRangeNotSatisfiable = extendError(BadRequest, {
  subTypeName: `RequestRangeNotSatisfiable`,
  properties: {
    code: 416
  }
});

const ExpectationFailed = extendError(BadRequest, {
  subTypeName: `ExpectationFailed`,
  properties: {
    code: 417
  }
});

const InternalServerError = extendError(HttpError, {
  subTypeName: `InternalServerError`,
  properties: {
    code: 500
  }
});

const NotImplemented = extendError(InternalServerError, {
  subTypeName: `NotImplemented`,
  properties: {
    code: 501
  }
});

const BadGateway = extendError(InternalServerError, {
  subTypeName: `BadGateway`,
  properties: {
    code: 502
  }
});

const ServiceUnavailable = extendError(InternalServerError, {
  subTypeName: `ServiceUnavailable`,
  properties: {
    code: 503
  }
});

const GatewayTimeout = extendError(InternalServerError, {
  subTypeName: `GatewayTimeout`,
  properties: {
    code: 504
  }
});

const HttpVersionNotSupported = extendError(InternalServerError, {
  subTypeName: `HttpVersionNotSupported`,
  properties: {
    code: 505
  }
});

export default HttpError;
export {
  BadRequest,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  ProxyAuthenticationRequired,
  RequestTimeout,
  Conflict,
  Gone,
  LengthRequired,
  PreconditionFailed,
  RequestEntityTooLarge,
  RequestUriTooLong,
  UnsupportedMediaType,
  RequestRangeNotSatisfiable,
  ExpectationFailed,
  InternalServerError,
  NotImplemented,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout,
  HttpVersionNotSupported
};
