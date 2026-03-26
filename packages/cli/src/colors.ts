/**
 * Minimal ANSI color helpers — zero dependencies.
 */

const ENABLED = process.stdout.isTTY !== false;

function wrap(code: string, resetCode: string) {
  return (text: string) =>
    ENABLED ? `\x1b[${code}m${text}\x1b[${resetCode}m` : text;
}

export const bold = wrap('1', '22');
export const dim = wrap('2', '22');
export const italic = wrap('3', '23');
export const underline = wrap('4', '24');

export const red = wrap('31', '39');
export const green = wrap('32', '39');
export const yellow = wrap('33', '39');
export const blue = wrap('34', '39');
export const magenta = wrap('35', '39');
export const cyan = wrap('36', '39');
export const white = wrap('37', '39');
export const gray = wrap('90', '39');

export const bgRed = wrap('41', '49');
export const bgGreen = wrap('42', '49');
export const bgYellow = wrap('43', '49');
