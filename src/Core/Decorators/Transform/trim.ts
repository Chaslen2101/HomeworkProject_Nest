import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim() : value,
  );
