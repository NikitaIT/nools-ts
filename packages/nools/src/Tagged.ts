export type Tagged<T, K extends keyof any> = T & Record<K, never>;
