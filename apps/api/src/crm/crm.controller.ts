import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmService } from "./crm.service";
import { CrmValidationFilter } from "./crm-validation.filter";

@Controller("tenant/crm")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class CrmController {
  constructor(private readonly crm: CrmService) {}
  @Get("accounts")
  @RequirePermissions("crm.businesses.view")
  accounts(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.crm.listAccounts(p, q);
  }
  @Get("accounts/:accountId")
  @RequirePermissions("crm.businesses.view")
  account(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("accountId") id: string,
  ) {
    return this.crm.getAccount(p, id);
  }
  @Post("accounts")
  @RequirePermissions("crm.businesses.create")
  createAccount(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.crm.createAccount(p, v);
  }
  @Patch("accounts/:accountId")
  @RequirePermissions("crm.businesses.update")
  updateAccount(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("accountId") id: string,
    @Body() v: unknown,
  ) {
    return this.crm.updateAccount(p, id, v);
  }
  @Delete("accounts/:accountId")
  @HttpCode(204)
  @RequirePermissions("crm.businesses.delete")
  deleteAccount(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("accountId") id: string,
    @Body() v: unknown,
  ) {
    return this.crm.deleteAccount(p, id, v);
  }
  @Get("contacts")
  @RequirePermissions("crm.contacts.view")
  contacts(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.crm.listContacts(p, q);
  }
  @Get("contacts/:contactId")
  @RequirePermissions("crm.contacts.view")
  contact(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("contactId") id: string,
  ) {
    return this.crm.getContact(p, id);
  }
  @Get("accounts/:accountId/contacts")
  @RequirePermissions("crm.businesses.view", "crm.contacts.view")
  linkedContacts(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("accountId") id: string,
    @Query() q: unknown,
  ) {
    return this.crm.listContacts(p, q, id);
  }
  @Post("contacts")
  @RequirePermissions("crm.contacts.create")
  createContact(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.crm.createContact(p, v);
  }
  @Post("accounts/:accountId/contacts")
  @RequirePermissions("crm.businesses.update", "crm.contacts.create")
  createLinked(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("accountId") id: string,
    @Body() v: unknown,
  ) {
    return this.crm.createContact(p, v, id);
  }
  @Patch("contacts/:contactId")
  @RequirePermissions("crm.contacts.update")
  updateContact(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("contactId") id: string,
    @Body() v: unknown,
  ) {
    return this.crm.updateContact(p, id, v);
  }
  @Delete("contacts/:contactId")
  @HttpCode(204)
  @RequirePermissions("crm.contacts.delete")
  deleteContact(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("contactId") id: string,
    @Body() v: unknown,
  ) {
    return this.crm.deleteContact(p, id, v);
  }
  @Patch("accounts/:accountId/primary-contact")
  @RequirePermissions("crm.businesses.update", "crm.contacts.update")
  primary(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("accountId") id: string,
    @Body() v: unknown,
  ) {
    return this.crm.setPrimary(p, id, v);
  }
  // Either assign permission is sufficient; the service performs the explicit OR and scope check.
  @Get("owner-options")
  @RequirePermissions()
  owners(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.crm.owners(p, q);
  }
}
