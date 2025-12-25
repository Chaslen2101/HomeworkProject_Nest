export class Extension {
  constructor(
    public message: string,
    public key: string,
  ) {}
}

export class DomainException extends Error {
  constructor(
    public message: string,
    public code: number,
    public field?: string,
  ) {
    super(message);
  }
}
