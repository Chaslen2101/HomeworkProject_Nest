import { CreateUpdateBlogInputDTO } from '../Api/InputDTOValidators/blog-input-dto.validator';
import { randomUUID } from 'node:crypto';

export class Blog {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: Date,
    public isMembership: boolean,
  ) {}

  static createNew(newBlogData: CreateUpdateBlogInputDTO): Blog {
    return new this(
      randomUUID(),
      newBlogData.name,
      newBlogData.description,
      newBlogData.websiteUrl,
      new Date(),
      false,
    );
  }

  updateBlogData(newBlogData: CreateUpdateBlogInputDTO): boolean {
    this.name = newBlogData.name;
    this.description = newBlogData.description;
    this.websiteUrl = newBlogData.websiteUrl;
    return true;
  }
}
