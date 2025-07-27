import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface OptionJSON<T> {
  none: boolean;
  value?: T;
}

// Rewrite rust in js
export class Option<T> {
  private none: boolean;
  private value: T | undefined;

  private constructor(value: T | undefined) {
    if (typeof value !== "undefined") {
      this.none = false;
      this.value = value;
      return;
    }
    this.none = true;
  }

  static some<T>(value: T) {
    return new Option<T>(value);
  }

  static none<T>() {
    return new Option<T>(undefined);
  }

  isSome(): boolean {
    return !this.none;
  }

  isNone(): boolean {
    return this.none;
  }

  unwrap(): T {
    if (this.none) {
      throw new Error("[PANIC] Tried to unwrap None");
    }
    return this.value!;
  }

  unwrapOr(defaultValue: T): T {
    return this.none ? defaultValue : this.value!;
  }

  // When the Option<T> gets dehydrated after SSR, we loose all functions and become a plain object
  toJSON(): OptionJSON<T> {
    return {
      none: this.none,
      ...(this.none ? {} : { value: this.value }),
    };
  }

  static fromJSON<T>(json: OptionJSON<T>): Option<T> {
    return json.none ? (Option.none() as Option<T>) : Option.some(json.value!);
  }
}
