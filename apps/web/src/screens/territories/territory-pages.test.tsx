// @vitest-environment jsdom
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TerritoryDto } from '../../features/crm/crm.types';
import EditTerritoryPage from './EditTerritoryPage';
import TerritoryDetailsPage from './TerritoryDetailsPage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const apiMock = vi.hoisted(() => ({
  territory: vi.fn(),
  territoryBusinesses: vi.fn(),
  territoryPerformance: vi.fn(),
  territoryMemberOptions: vi.fn(),
  updateTerritory: vi.fn(),
  updateTerritoryTarget: vi.fn(),
}));
vi.mock('../../features/crm/crm.api', () => ({ crmApi: apiMock }));
vi.mock('../../features/runtime/context/RuntimeBootstrapContext', () => ({
  useRuntimeBootstrap: () => ({ hasPermission: () => true, isReadOnly: false }),
}));
vi.mock('../../components/maps/InteractiveMap', () => ({
  InteractiveMap: ({ territoryPath, onPolygonChange }: {
    territoryPath?: [number, number][];
    onPolygonChange?: (points: [number, number][], area: number, perimeter: number) => void;
  }) => <div data-testid="territory-map" data-path={JSON.stringify(territoryPath)}>
    <button type="button" onClick={() => onPolygonChange?.([[20, 73], [21, 74], [22, 75]], 12, 14)}>Move vertex</button>
  </div>,
}));

const territory: TerritoryDto = {
  id: 'saved-territory', tenantId: 'tenant-1', code: 'REAL-1', name: 'Saved Territory',
  regionArea: 'North region', city: 'Delhi', description: 'Saved description',
  status: 'ACTIVE', color: '#2563EB', revision: 3,
  createdAt: '2026-09-20T00:00:00Z', updatedAt: '2026-09-20T00:00:00Z',
  pathPoints: [[28.6, 77.2], [28.7, 77.3], [28.5, 77.4]],
  areaKm2: 18, perimeterKm: 20,
  members: [], targets: [],
  _count: { members: 0, accounts: 0, leads: 0 },
};
let host: HTMLDivElement;
let root: Root;
const flush = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

async function renderPage(page: React.ReactNode, path: string) {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/admin/territories/:territoryId" element={page} />
    <Route path="/admin/territories/:territoryId/edit" element={page} />
  </Routes></MemoryRouter>));
  await flush();
}

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.territory.mockResolvedValue(territory);
  apiMock.territoryBusinesses.mockResolvedValue([]);
  apiMock.territoryPerformance.mockResolvedValue({
    territoryId: territory.id, code: territory.code, name: territory.name,
    monthlyTarget: 0, monthlyAchieved: 0, performancePercentage: 0,
    activeBusinessesCount: 0, leadsCount: 0, executivesCount: 0, periodTargets: [],
  });
  apiMock.territoryMemberOptions.mockResolvedValue({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 });
  apiMock.updateTerritory.mockResolvedValue(territory);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe('saved territory pages', () => {
  it('shows the selected territory and its saved boundary without demo fallback', async () => {
    await renderPage(<TerritoryDetailsPage />, '/admin/territories/saved-territory');
    expect(host.textContent).toContain('Saved Territory');
    expect(host.textContent).toContain('REAL-1');
    expect(host.textContent).not.toContain('Andheri East');
    expect(host.querySelector('[data-testid="territory-map"]')?.getAttribute('data-path'))
      .toBe(JSON.stringify(territory.pathPoints));
  });

  it('does not replace boundary vertices when saving other territory fields', async () => {
    await renderPage(<EditTerritoryPage />, '/admin/territories/saved-territory/edit');
    expect(host.querySelector('[data-testid="territory-map"]')?.getAttribute('data-path'))
      .toBe(JSON.stringify(territory.pathPoints));
    const save = [...host.querySelectorAll('button')].find((button) => button.textContent?.includes('Save Changes'));
    expect(save).toBeTruthy();
    await act(async () => save!.click());
    expect(apiMock.updateTerritory).toHaveBeenCalledWith(territory.id, expect.objectContaining({ expectedRevision: 3, name: territory.name }));
    expect(apiMock.updateTerritory.mock.calls[0][1]).not.toHaveProperty('pathPoints');
    expect(apiMock.updateTerritory.mock.calls[0][1]).not.toHaveProperty('monthlyTarget');
  });

  it('submits edited boundary vertices and measurements', async () => {
    await renderPage(<EditTerritoryPage />, '/admin/territories/saved-territory/edit');
    const move = [...host.querySelectorAll('button')].find((button) => button.textContent === 'Move vertex');
    await act(async () => move!.click());
    const save = [...host.querySelectorAll('button')].find((button) => button.textContent?.includes('Save Changes'));
    await act(async () => save!.click());
    expect(apiMock.updateTerritory).toHaveBeenCalledWith(territory.id, expect.objectContaining({
      pathPoints: [[20, 73], [21, 74], [22, 75]], areaKm2: 12, perimeterKm: 14,
    }));
  });

  it('loads and saves the existing notes and business target controls', async () => {
    apiMock.territory.mockResolvedValue({
      ...territory,
      notes: 'Saved field note',
      targets: [{
        id: 'target-1', period: '2026-09', monthlyTarget: 1000, monthlyAchieved: 0,
        visitTarget: 5, visitAchieved: 0, newBusinessTarget: 2, newBusinessAchieved: 0,
        activeBusinessTarget: 37, retentionTarget: 85,
        collectionTarget: 500, collectionAchieved: 0, revision: 1,
      }],
    });
    apiMock.updateTerritoryTarget.mockResolvedValue({});
    await renderPage(<EditTerritoryPage />, '/admin/territories/saved-territory/edit');

    const notes = [...host.querySelectorAll('textarea')].find((field) => field.value === 'Saved field note');
    expect(notes?.value).toBe('Saved field note');
    const activeTarget = [...host.querySelectorAll('input')].find((input) => input.value === '37');
    expect(activeTarget).toBeTruthy();
    expect([...host.querySelectorAll('input')].some((input) => input.value === '85')).toBe(true);

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(activeTarget, '38');
      activeTarget?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const save = [...host.querySelectorAll('button')].find((button) => button.textContent?.includes('Save Changes'));
    await act(async () => save!.click());
    expect(apiMock.updateTerritory).toHaveBeenCalledWith(territory.id, expect.objectContaining({ notes: 'Saved field note' }));
    expect(apiMock.updateTerritoryTarget).toHaveBeenCalledWith(territory.id, expect.objectContaining({
      activeBusinessTarget: 38, retentionTarget: 85,
    }));
  });
});
