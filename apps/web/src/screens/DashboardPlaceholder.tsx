import React from 'react';

export default function DashboardPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to VisibloAI Admin Panel
        </p>
      </div>

      <div className="rounded-lg border bg-card p-8 shadow-card">
        <h2 className="text-lg font-bold text-foreground">Auth & Access Module Initialized</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You are successfully logged in to the VisibloAI Field Sales CRM Admin Panel (Phase 0).
        </p>
      </div>
    </div>
  );
}
