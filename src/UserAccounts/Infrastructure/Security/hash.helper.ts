import * as argon2 from 'argon2';

export const hashHelper = {
  async hash(smthToHash: string): Promise<string> {
    return await argon2.hash(smthToHash, {
      type: argon2.argon2id, // Лучший вариант - защита от GPU и side-channel атак
      memoryCost: 2 ** 16, // 64 MB памяти
      timeCost: 3, // 3 итерации
      parallelism: 1, // 1 поток
      hashLength: 32, // 32 байта хеш
    });
  },

  async compare(someStringToComp: string, hashedString: string) {
    return await argon2.verify(hashedString, someStringToComp);
  },
};
