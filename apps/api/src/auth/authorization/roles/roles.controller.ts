import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RoleAssignmentService } from './services/assign-role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../constants/permissions.constant';

@Controller('roles')
export class RolesController {
  constructor(
    private rolesService: RolesService,
    private roleAssignmentService: RoleAssignmentService,
  ) {}

  /**
   * GET /roles
   * List all roles
   */
  @Get()
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  findAll(): Promise<any> {
    return this.rolesService.findAll();
  }

  /**
   * GET /roles/:id
   * Get single role by ID
   */
  @Get(':id')
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.rolesService.findById(id);
  }

  /**
   * POST /roles
   * Create new role
   */
  @Post()
  @RequirePermissions(PERMISSIONS.ROLES_CREATE)
  create(@Body() dto: CreateRoleDto): Promise<any> {
    return this.rolesService.create(dto);
  }

  /**
   * PATCH /roles/:id
   * Update role
   */
  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLES_UPDATE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<any> {
    return this.rolesService.update(id, dto);
  }

  /**
   * DELETE /roles/:id
   * Soft delete role
   */
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ROLES_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.rolesService.delete(id);
  }

  /**
   * POST /roles/assign
   * Assign role to user
   */
  @Post('assign')
  @RequirePermissions(PERMISSIONS.ROLES_ASSIGN)
  assignRole(@Body() dto: AssignRoleDto) {
    return this.roleAssignmentService.assignRole(dto);
  }

  /**
   * DELETE /roles/assign
   * Remove role from user
   */
  @Delete('assign')
  @RequirePermissions(PERMISSIONS.ROLES_ASSIGN)
  @HttpCode(HttpStatus.OK)
  removeRole(@Body() dto: AssignRoleDto) {
    return this.roleAssignmentService.removeRole(dto.userId, dto.roleId);
  }

  /**
   * GET /roles/user/:userId
   * Get all roles for a user
   */
  @Get('user/:userId')
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.roleAssignmentService.getUserRoles(userId);
  }
}