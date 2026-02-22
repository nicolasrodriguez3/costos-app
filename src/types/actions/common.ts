export type ActionState = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export type JoinState = {
  error?: string;
  success?: boolean;
};

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export type WaitlistState = {
  message?: string;
  success?: boolean;
};
