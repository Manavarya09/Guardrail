import * as c from './colors.js';

const BANNER = `
   ____                     _           _ _
  / ___|_   _  __ _ _ __ __| |_ __ __ _(_) |
 | |  _| | | |/ _\` | '__/ _\` | '__/ _\` | | |
 | |_| | |_| | (_| | | | (_| | | | (_| | | |
  \\____|\\__,_|\\__,_|_|  \\__,_|_|  \\__,_|_|_|
`;

export function printBanner(): void {
  console.log(c.cyan(BANNER));
}
