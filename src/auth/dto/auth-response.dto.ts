import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acesso',
  })
  access_token: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Tipo de token',
  })
  token_type: string;

  @ApiProperty({
    example: 3600,
    description: 'Tempo de expiração em segundos',
  })
  expires_in: number;

  @ApiProperty({
    example: {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe',
      units: [
        {
          id: 1,
          name: 'Unit A',
          type: 'Branch',
          city: 'São Paulo',
          state: 'SP',
        },
      ],
    },
    description: 'Dados do usuário autenticado com suas unidades',
  })
  user: {
    id: number;
    email: string;
    name: string;
    roleName?: string;
    unitName?: string;
    unitId?: number | null;
    units?: Array<{
      id: number;
      name: string;
      type: string;
      city: string;
      state: string;
    }>;
  };
}
