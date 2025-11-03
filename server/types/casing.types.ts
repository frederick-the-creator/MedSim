// Type-level key casing utilities and shallow runtime converters

export type CamelCase<S extends string> = S extends `${infer H}_${infer R}`
	? `${H}${Capitalize<CamelCase<R>>}`
	: S;

export type SnakeCase<S extends string> = S extends `${infer H}${infer T}`
	? `${H extends Lowercase<H> ? H : `_${Lowercase<H>}`}${SnakeCase<T>}`
	: S;

export type SnakeToCamelKeys<T> = {
	[K in keyof T as CamelCase<K & string>]: T[K];
};

export type CamelToSnakeKeys<T> = {
	[K in keyof T as SnakeCase<K & string>]: T[K];
};

export function camelToSnakeObject<T extends Record<string, unknown>>(obj: T) {
	const out: Record<string, unknown> = {};
	for (const key in obj) {
		const snake = key.replace(/[A-Z]/g, (m: string) => `_${m.toLowerCase()}`);
		out[snake] = obj[key as keyof T] as unknown;
	}
	return out as CamelToSnakeKeys<T>;
}

export function snakeToCamelObject<T extends Record<string, unknown>>(obj: T) {
	const out: Record<string, unknown> = {};
	for (const key in obj) {
		const camel = key.replace(/_([a-z])/g, (_: string, c: string) =>
			c.toUpperCase(),
		);
		out[camel] = obj[key as keyof T] as unknown;
	}
	return out as SnakeToCamelKeys<T>;
}
