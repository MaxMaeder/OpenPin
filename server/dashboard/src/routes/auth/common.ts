export const emailValidation = {
  required: true,
  pattern: {
    value: /^\S+@\S+$/i,
    message: "Email is invalid"
  }
};