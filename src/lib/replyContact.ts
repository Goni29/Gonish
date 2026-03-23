const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_WITH_HYPHEN_PATTERN = /^\d{3}-\d{4}-\d{4}$/;
const PHONE_DIGITS_PATTERN = /^\d{11}$/;
export const REPLY_CONTACT_VALIDATION_MESSAGE =
  "연락처 형식을 확인해 주세요. 이메일 주소 또는 전화번호로 입력해 주세요.";

function normalize(value: string) {
  return value.trim();
}

export function isValidReplyEmail(value: string) {
  return EMAIL_PATTERN.test(normalize(value));
}

export function isValidReplyPhone(value: string) {
  const normalized = normalize(value);
  return PHONE_WITH_HYPHEN_PATTERN.test(normalized) || PHONE_DIGITS_PATTERN.test(normalized);
}

export function isValidReplyContact(value: string) {
  const normalized = normalize(value);
  if (!normalized) {
    return false;
  }
  return isValidReplyEmail(normalized) || isValidReplyPhone(normalized);
}
