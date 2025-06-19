import { Response } from "express";

interface CookieType {
  type: string;
  value: unknown;
  config: {
    expires: Date;
    httpOnly: boolean;
  };
}

interface StatusDataType {
  code: number;
  status: string;
  message: string;
}

interface OtherDataType {
  data?: unknown;
  error?: unknown;
}

export const sendResponse = (
  res: Response,
  statusData: StatusDataType,
  otherData: OtherDataType,
  cookie?: CookieType[]
) => {
  const { code, status, message } = statusData;
  const { data, error } = otherData;

  if (cookie && cookie.length > 0) {
    cookie.forEach((cookie) => {
      res.cookie(cookie.type, cookie.value, {
        expires: cookie.config.expires,
        httpOnly: cookie.config.httpOnly,
      });
    });
  }

  return res.status(code).send({
    status: status,
    message: message,
    data: data,
    error: error,
  });
};

export default sendResponse;
