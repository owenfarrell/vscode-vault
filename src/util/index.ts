'use strict';

export const ANY_LEADING_SLASHES = /^\/+/;
export const OPTIONAL_TRAILING_SLASH = /\/?$/;
export const PATH_SEGMENT = /[^\\/]+\/?/g;

export const PATH_SEPARATOR = '/';

export function formatPath(path: string): string {
    return path.replace(ANY_LEADING_SLASHES, '').replace(OPTIONAL_TRAILING_SLASH, '/');
}

export function splitPath(path: string): RegExpMatchArray {
    return path.match(PATH_SEGMENT);
}
