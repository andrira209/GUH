export type MakeTransactionInputData = {
  account: string;
};

export type MakeTransactionGetResponse = {
  label: string;
  icon: string;
};

export type MakeTransactionOutputData = {
  transaction: string;
  message: string;
};

export type ErrorOutput = {
  error: string;
};

export type MyTransactionStatus = {
  status: boolean;
  message: string;
};
