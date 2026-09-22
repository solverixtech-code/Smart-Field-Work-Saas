import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Users, UserRound } from 'lucide-react';
import { api } from '../../common/api';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ExecutiveProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  department: string | null;
  status: string;
  email: string;
  mobile: string | null;
  teamName: string | null;
  managerName: string | null;
  joinedAt: string;
}

type ProfileState =
  | { id: string; status: 'loading' }
  | { id: string; status: 'ready'; profile: ExecutiveProfile }
  | { id: string; status: 'error'; message: string };

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<ProfileState>({ id: id ?? '', status: 'loading' });

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setState({ id, status: 'loading' });
    api.get<ExecutiveProfile>(
      `/tenant/crm/lead-assignees/${encodeURIComponent(id)}/profile`,
      { signal: controller.signal },
    )
      .then(({ data }) => {
        if (!controller.signal.aborted) setState({ id, status: 'ready', profile: data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        setState({
          id,
          status: 'error',
          message: status === 404
            ? 'This employee profile is unavailable.'
            : 'Could not load this employee profile. Please try again.',
        });
      });
    return () => controller.abort();
  }, [id, retry]);

  const current = state.id === id ? state : { status: 'loading' as const };
  const profile = current.status === 'ready' ? current.profile : null;
  const joinedAt = profile && !Number.isNaN(Date.parse(profile.joinedAt))
    ? new Date(profile.joinedAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    : null;

  return (
    <div className="space-y-3 font-sans">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D1F3D]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {!id || current.status === 'error' ? (
        <Card variant="panel" role="alert" className="text-sm text-slate-700">
          <p>{current.status === 'error' ? current.message : 'This employee profile is unavailable.'}</p>
          {id && (
            <Button variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)} className="mt-3">
              Retry
            </Button>
          )}
        </Card>
      ) : current.status === 'loading' ? (
        <Card variant="panel" role="status" className="text-sm text-slate-500">
          Loading employee profile...
        </Card>
      ) : profile && (
        <>
          <Card variant="panel">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar
                name={profile.displayName}
                src={profile.avatarUrl}
                sizeClassName="h-24 w-24"
                className="text-xl"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-extrabold text-[#0D1F3D]">{profile.displayName}</h1>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {profile.status.charAt(0) + profile.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#E20613]">{profile.role}</p>
                <p className="text-xs text-slate-500">{profile.department || 'Department not set'}</p>
              </div>
            </div>
          </Card>

          <Card variant="panel" aria-labelledby="employee-profile-details">
            <h2 id="employee-profile-details" className="mb-5 text-sm font-bold text-[#0D1F3D]">Profile details</h2>
            <dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="flex items-center gap-2 text-xs text-slate-500"><Mail className="h-4 w-4" /> Email</dt>
                <dd className="mt-1 break-all font-semibold text-slate-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs text-slate-500"><Phone className="h-4 w-4" /> Mobile</dt>
                <dd className="mt-1 font-semibold text-slate-900">{profile.mobile || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs text-slate-500"><Users className="h-4 w-4" /> Team</dt>
                <dd className="mt-1 font-semibold text-slate-900">{profile.teamName || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs text-slate-500"><UserRound className="h-4 w-4" /> Reporting to</dt>
                <dd className="mt-1 font-semibold text-slate-900">{profile.managerName || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Joined</dt>
                <dd className="mt-1 font-semibold text-slate-900">{joinedAt || 'Not available'}</dd>
              </div>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
