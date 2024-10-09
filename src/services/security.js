import * as OTPAuth from 'otpauth';

const OPT_KEY = process.env.OPT_KEY;
const WINDOW_SIZE = 60;

export const totp = new OTPAuth.TOTP({
    issuer: 'DNN',
    label: 'Lock Screen',
    algorithm: 'SHA1',
    digits: 6,
    period: WINDOW_SIZE,
    secret: OPT_KEY,
});
