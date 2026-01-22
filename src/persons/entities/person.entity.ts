export class Person {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  updatedBy?: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  genderId?: number;
  genderIdentityId?: number;
  cpf?: string;
}
