import { TenantMembershipSummaryDto } from './membership-response.dto';

export interface MembershipSelectionResultDto {
  activeMemberships: TenantMembershipSummaryDto[];
  activeMembershipCount: number;
  selectionRequired: boolean;
  autoSelectableMembershipId: string | null;
}
