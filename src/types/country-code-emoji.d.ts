declare module 'country-code-emoji' {
    export const flag: (isoCode: string) => string;
    export default function emoji(isoCode: string): string;
}
