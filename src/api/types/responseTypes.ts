export type ServicesResponse<T> = SuccessResponse<T> | FailedResponse;

type SuccessResponse<T> = {
  success: true;
  msg: string;
  status: number;
  data: T;
};

type FailedResponse = {
  success: false;
  msg: string;
  status: number;
};
