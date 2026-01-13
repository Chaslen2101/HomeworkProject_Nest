export abstract class IUnitOfWork {
  abstract runInTransaction<T>(work: (manager: any) => Promise<T>): Promise<T>;
}
