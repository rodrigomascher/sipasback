import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for JWT payload
 * Contains only non-sensitive data required for authorization
 * PATTERN: camelCase for all names in English
 */
export class JwtPayloadDto {
  /**
   * ID do usuário (Standard JWT: subject)
   */
  @ApiProperty({ example: 1 })
  sub: number;

  /**
   * Email do usuário
   */
  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  /**
   * User name
   */
  @ApiProperty({ example: 'John Smith' })
  name: string;

  /**
   * Employee ID (optional)
   */
  @ApiProperty({ example: 123, nullable: true })
  employeeId?: number | null;

  /**
   * Unit ID
   */
  @ApiProperty({ example: 1 })
  unitId: number;

  /**
   * Unit name
   */
  @ApiProperty({ example: 'headquarters' })
  unitName: string;

  /**
   * Unit type
   */
  @ApiProperty({ example: 'Main' })
  unitType: string;

  /**
   * Department ID
   */
  @ApiProperty({ example: 1 })
  departmentId: number;

  /**
   * Department name
   */
  @ApiProperty({ example: 'Administration Department' })
  departmentName: string;

  /**
   * Role/Function ID (optional)
   */
  @ApiProperty({ example: 5, nullable: true })
  roleId?: number | null;

  /**
   * Role/Function name
   */
  @ApiProperty({ example: 'Administrator' })
  roleName: string;

  /**
   * Is technician specialist (optional)
   */
  @ApiProperty({ example: false })
  isTechnician?: boolean;

  /**
   * Is armored unit (optional)
   */
  @ApiProperty({ example: false })
  isArmoredUnit?: boolean;

  /**
   * City
   */
  @ApiProperty({ example: 'São Paulo' })
  city: string;

  /**
   * State abbreviation
   */
  @ApiProperty({ example: 'SP' })
  state: string;

  /**
   * Timestamp de emissão do token (definido automaticamente)
   */
  @ApiProperty({ example: 1674345600 })
  iat?: number;

  /**
   * Timestamp de expiração do token (definido automaticamente)
   */
  @ApiProperty({ example: 1674349200 })
  exp?: number;
}

/**
 * ENGLISH NAMING PATTERN:
 *
 * IDs:         unitId, roleId, departmentId
 * Names:       name, unitName, roleName, departmentName
 * Booleans:    isTechnician, isArmoredUnit (with "is" prefix)
 * Timestamps:  iat, exp (standard JWT)
 *
 * Portuguese → English Mapping:
 * usr_codigo       → sub
 * usr_nome         → name
 * unidade_nome     → unitName
 * des_secretaria   → departmentName
 * FUNCAO           → roleName
 * unidade_blindada → isArmoredUnit
 * tecnicoas        → isTechnician
 * cidade           → city
 * uf               → state
 */
