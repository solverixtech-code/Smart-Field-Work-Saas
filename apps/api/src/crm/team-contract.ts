import { z } from 'zod';

const teamConfiguration = {
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(30).regex(/^[A-Za-z0-9_-]+$/).optional(),
  leaderMembershipId: z.string().uuid().nullable().optional(),
  managerMembershipId: z.string().uuid().nullable().optional(),
  department: z.string().trim().min(1).max(80).default('Sales'),
  region: z.string().trim().max(120).nullable().optional(),
  monthlyTarget: z.coerce.number().min(0).max(999999999999.99).default(0),
  description: z.string().trim().max(1000).nullable().optional(),
  teamType: z.string().trim().min(1).max(80).default('Field Sales'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  dealAssignment: z.string().trim().min(1).max(80).default('Both Manual & Auto'),
  visibility: z.string().trim().min(1).max(80).default('Private'),
};

export const createTeamSchema = z.object(teamConfiguration).strict();

export const updateTeamSchema = createTeamSchema.partial().strict();

export const teamWorkspaceQuery = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
}).strict();

export const assignTeamLeaderSchema = z.object({
  membershipId: z.string().uuid().nullable(),
}).strict();

export const assignTeamMembersSchema = z.object({
  membershipIds: z.array(z.string().uuid()).min(1).max(100),
  designation: z.string().trim().min(1).max(80).optional(),
}).strict();
