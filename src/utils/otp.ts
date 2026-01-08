export const generateOTP = (): string => {
  const length = parseInt(process.env.OTP_LENGTH || '6');
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
