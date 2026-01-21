# Exemplo de Integração com Banco de Dados

Este arquivo mostra como integrar com banco de dados real (PostgreSQL + TypeORM).

## Instalação

```bash
npm install @nestjs/typeorm typeorm pg
```

## Configuração em app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Unit, Department],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    // ... outros módulos
  ],
})
export class AppModule {}
```

## Exemplo de Entity (Usuário)

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  usr_codigo: number;

  @Column({ unique: true })
  usr_email: string;

  @Column()
  usr_nome: string;

  @Column()
  usr_senha: string; // HASHEADA com bcrypt!

  @Column()
  id_funcionario: number;

  @Column()
  id_unidade: number;

  @Column()
  id_secretaria: number;

  @Column()
  id_funcao: number;

  @Column()
  tecnicoas: boolean;

  @Column()
  created_at: Date;
}
```

## Service com Banco de Dados

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { usr_email: email },
    });

    if (!user) return null;

    // Validar senha com bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.usr_senha);
    if (!isPasswordValid) return null;

    // Retornar dados para JWT
    return {
      id: user.usr_codigo,
      email: user.usr_email,
      usuario: user.usr_nome,
      idFuncionario: user.id_funcionario,
      // ... outros campos
    };
  }
}
```

## .env para Banco de Dados

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=sipas_db
```

## Query SQL Original para Referência

Adaptada do seu sistema ASP:

```sql
SELECT 
  u.usr_codigo,
  u.usr_nome,
  u.usr_email,
  u.id_funcionario,
  u.id_unidade,
  u.id_secretaria,
  u.id_funcao,
  u.tecnicoas,
  un.unidade_nome,
  un.tipo_unidade,
  un.unidade_blindada,
  un.cidade_lat,
  un.cidade_long,
  c.cidade_nome AS cidade,
  c.uf,
  s.des_secretaria
FROM usuarios u
LEFT JOIN unidades un ON u.id_unidade = un.id_unidade
LEFT JOIN cidades c ON un.cidade_id = c.cidade_id
LEFT JOIN secretarias s ON u.id_secretaria = s.id_secretaria
WHERE u.usr_email = $1
AND u.usr_ativo = true
```
