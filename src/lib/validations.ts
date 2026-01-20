export const emailRegex = /\S+@\S+\.\S+/;
export const phoneRegex = /^(05)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;

export function validateEmail(email: string) {
    return emailRegex.test(email);
}

export function validatePassword(password: string) {
    return password.length >= 6;
}

export function validatePhone(phone: string) {
    // Saudi Phone Validation (Simple)
    return phone.length >= 10;
}
