declare module 'jwt-decode' {
  export function jwtDecode(token: string): any;
  export default function decode(token: string): any;
}
