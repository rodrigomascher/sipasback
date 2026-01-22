/**
 * Example of how to access JWT session data in any controller
 *
 * This file demonstrates how to use the @GetUser() decorator
 * to access the JWT payload in protected controllers
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('example')
@Controller('example')
export class ExampleController {
  /**
   * Example endpoint: access JWT session data
   *
   * The @GetUser() decorator extracts the JWT payload
   * and returns it as an object with all session data
   */
  @Get('session-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Example: Get JWT session data',
    description: `
      This endpoint demonstrates how to access session data
      stored in the JWT token.
      
      Response includes:
      - sub: User ID
      - email: User email
      - name: Full user name
      - unitId: Unit ID
      - unitName: Unit name
      - departmentId: Department ID
      - roleName: User role/function
      - And other context data...
    `,
  })
  getSessionData(@GetUser() user: any) {
    // The 'user' object contains the entire JWT payload
    return {
      success: true,
      message: 'Session data obtained successfully',
      data: {
        userId: user.sub,
        email: user.email,
        name: user.name,
        employeeId: user.employeeId,
        unitId: user.unitId,
        unitName: user.unitName,
        unitType: user.unitType,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        roleId: user.roleId,
        roleName: user.roleName,
        isTechnician: user.isTechnician,
        isArmoredUnit: user.isArmoredUnit,
        city: user.city,
        state: user.state,
        // Automatic JWT timestamps
        issuedAt: new Date(user.iat * 1000).toISOString(),
        expiresAt: new Date(user.exp * 1000).toISOString(),
      },
    };
  }

  /**
   * Example 2: Access specific user context data
   * Useful for logic that needs information about authenticated user
   */
  @Get('user-context')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Example: User context',
    description:
      'Returns an object with structured context to use in business logic',
  })
  getUserContext(@GetUser() user: any) {
    // Structure the data as needed for your business logic
    const userContext = {
      identification: {
        id: user.sub,
        email: user.email,
        name: user.name,
      },
      unit: {
        id: user.unitId,
        name: user.unitName,
        type: user.unitType,
        isArmored: user.isArmoredUnit,
        location: {
          city: user.city,
          state: user.state,
        },
      },
      organization: {
        departmentId: user.departmentId,
        departmentName: user.departmentName,
      },
      role: {
        roleId: user.roleId,
        roleName: user.roleName,
        employeeId: user.employeeId,
        isTechnician: user.isTechnician,
      },
    };

    return {
      success: true,
      data: userContext,
    };
  }
}
