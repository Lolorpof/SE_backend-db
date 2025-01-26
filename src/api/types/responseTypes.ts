type SerivcesResponse<T> = {
  success: boolean;
  msg: string;
  data?: T;
  status: number;
};
