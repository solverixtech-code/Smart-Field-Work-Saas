import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { DataTable } from "../../../components/ui/DataTable";
import { RowActionsMenu } from "../../../components/ui/RowActionsMenu";
import { moduleService } from "../../../features/platform/catalog/modules/services/module.service";
import { PlatformModule } from "../../../features/platform/catalog/modules/types/module.types";
import { usePlatformPermissions } from "../../../features/platform/tenants/hooks/usePlatformPermissions";
export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { canArchiveModule, canUpdateModule } = usePlatformPermissions();
  const [module, setModule] = useState<PlatformModule | null>(null);
  const load = async () => {
    if (!moduleId) return;
    try {
      setModule(await moduleService.getModuleById(moduleId));
    } catch {
      toast.error("Unable to load module details.");
    }
  };
  useEffect(() => {
    void load();
  }, [moduleId]);
  if (!module)
    return (
      <p className="p-8 text-xs font-medium text-slate-600">
        Loading module details…
      </p>
    );
  const archive = async () => {
    try {
      module.status === "ARCHIVED"
        ? await moduleService.restoreModule(module.id)
        : await moduleService.archiveModule(module.id);
      await load();
      toast.success(
        module.status === "ARCHIVED" ? "Module restored." : "Module archived.",
      );
    } catch {
      toast.error("This lifecycle change is blocked by the dependency rules.");
    }
  };
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
            {module.name}
          </h1>
          <p className="font-mono text-xs font-bold text-slate-800">
            {module.code}
          </p>
          <p className="text-xs font-medium text-slate-600">
            {module.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/platform/modules")}
          >
            Back
          </Button>
          {canUpdateModule && module.status !== "ARCHIVED" && (
            <Button
              variant="outline"
              onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
            >
              Edit Module
            </Button>
          )}
          {canArchiveModule && (
            <Button variant="outline" onClick={() => void archive()}>
              {module.status === "ARCHIVED"
                ? "Restore Module"
                : "Archive Module"}
            </Button>
          )}
        </div>
      </div>
      <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-extrabold text-[#0D1F3D]">
          Module Information
        </h2>
        <dl className="mt-4 grid gap-4 text-xs md:grid-cols-3">
          <div>
            <dt className="font-semibold text-slate-500">Category</dt>
            <dd className="font-bold text-slate-800">{module.category}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Lifecycle Status</dt>
            <dd className="font-bold text-slate-800">{module.status}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Required By System</dt>
            <dd className="font-bold text-slate-800">
              {module.requiredBySystem ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-extrabold text-[#0D1F3D]">
            Registered Features
          </h2>
          <p className="text-xs font-medium text-slate-600">
            Features represent functionality implemented in Smart Field Work
            code.
          </p>
        </div>
        <DataTable
          data={module.features}
          columns={[
            { header: "Feature", cell: (feature) => feature.name },
            {
              header: "Implementation Key",
              cell: (feature) => (
                <span className="font-mono text-xs font-bold text-slate-800">
                  {feature.implementationKey}
                </span>
              ),
            },
            {
              header: "Platforms",
              cell: (feature) =>
                [
                  feature.supportsWeb && "Web",
                  feature.supportsMobile && "Mobile",
                  feature.supportsApi && "API",
                ]
                  .filter(Boolean)
                  .join(" · ") || "None",
            },
            {
              header: "Offline",
              cell: (feature) => (feature.supportsOffline ? "Yes" : "No"),
            },
            { header: "Status", cell: (feature) => feature.status },
            {
              header: "Actions",
              cell: (feature) => (
                <RowActionsMenu
                  items={[
                    {
                      label: "View Details",
                      onClick: () =>
                        navigate(`/platform/modules/features/${feature.id}`),
                    },
                    ...(canUpdateModule
                      ? [
                          {
                            label: "Edit Metadata",
                            onClick: () =>
                              navigate(
                                `/platform/modules/features/${feature.id}`,
                              ),
                          },
                        ]
                      : []),
                  ]}
                />
              ),
            },
          ]}
          emptyMessage="No developer-registered features are available."
        />
      </section>
      <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-extrabold text-[#0D1F3D]">
          Dependencies
        </h2>
        <p className="mt-2 text-xs font-medium text-slate-600">
          {module.dependencyCodes.length
            ? module.dependencyCodes.join(", ")
            : "This module has no dependencies."}
        </p>
        <Button
          className="mt-4"
          variant="outline"
          size="sm"
          onClick={() =>
            navigate(`/platform/modules/${module.id}/dependencies`)
          }
        >
          Manage Dependencies
        </Button>
      </section>
    </div>
  );
}
