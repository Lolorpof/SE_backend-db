export type ServicesResponse<T> = {
  success: boolean;
  msg: string;
  data?: T;
  status: number;
};
