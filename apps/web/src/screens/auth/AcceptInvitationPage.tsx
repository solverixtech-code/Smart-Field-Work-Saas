import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Loader2, Building2, Lock } from 'lucide-react';
import { api, extractErrorMessage } from '../../common/api';
import { Button } from '../../components/ui/Button';
import { useAppSelector } from '../../store';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invitationId = searchParams.get('id') || searchParams.get('invitation') || searchParams.get('token');

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedDetails, setAcceptedDetails] = useState<{ membershipId?: string; acceptedAt?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAcceptInvitation = async () => {
    if (!invitationId) {
      setErrorMsg('No valid invitation token or ID provided in the link.');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please log in with your tenant owner account to accept this invitation.');
      navigate(`/admin/login?redirect=${encodeURIComponent(`/accept-invitation?id=${invitationId}`)}`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post(`/invitations/${invitationId}/accept`);
      setAccepted(true);
      setAcceptedDetails(response.data);
      toast.success('Workspace invitation accepted successfully!');
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to accept invitation. The invitation may be invalid or already accepted.');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F5F7] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-black text-lg shadow-xs">
            SFW
          </div>
          <span className="text-xl font-extrabold text-[#0D1F3D] tracking-tight">Smart Field Work</span>
        </div>
        <p className="text-xs text-slate-500 font-semibold">Enterprise Field Force & SaaS Operations Management</p>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-7 shadow-xl space-y-6">
        {!invitationId ? (
          /* Invalid Link State */
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Invalid Invitation Link</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                The invitation URL is missing a required invitation token parameter (`?id=...`).
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/login')}
              className="w-full font-bold text-slate-700"
            >
              Return to Login
            </Button>
          </div>
        ) : accepted ? (
          /* Accepted Success State */
          <div className="text-center space-y-5 animate-in fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Invitation Accepted!</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Your tenant membership status is now <strong className="text-emerald-700">Active</strong>. You have full access to your workspace.
              </p>
            </div>

            {acceptedDetails?.acceptedAt && (
              <div className="rounded-sm border border-slate-100 bg-slate-50 p-3 text-left space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Activated At:</span>
                  <span className="font-extrabold text-[#0D1F3D]">{new Date(acceptedDetails.acceptedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Membership ID:</span>
                  <span className="font-mono text-[11px] text-slate-700">{acceptedDetails.membershipId}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate('/platform/tenants')}
                className="w-full gap-2 font-bold bg-[#0D1F3D] hover:bg-[#152e5a] text-white shadow-xs"
              >
                Go to Tenants Console <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="w-full font-bold text-slate-700"
              >
                Go to Workspace Dashboard
              </Button>
            </div>
          </div>
        ) : (
          /* Initial Ready to Accept State */
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0D1F3D]">Accept Tenant Administrator Invitation</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Activate tenant owner rights for this workspace
                </p>
              </div>
            </div>

            {/* User Badge if logged in */}
            {isAuthenticated ? (
              <div className="rounded-sm border border-indigo-100 bg-indigo-50/50 p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">Logged in as:</span>
                  <strong className="font-extrabold text-[#0D1F3D]">{currentUser?.fullName || currentUser?.email}</strong>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">Authenticated</span>
              </div>
            ) : (
              <div className="rounded-sm border border-amber-100 bg-amber-50/50 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <Lock className="h-3.5 w-3.5" /> Authentication Required
                </div>
                <p className="text-slate-600 font-medium">
                  You must log into the account corresponding to this invitation to accept it.
                </p>
              </div>
            )}

            {/* Error Callout */}
            {errorMsg && (
              <div className="rounded-sm border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-700 font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold">
                  <AlertCircle className="h-4 w-4 text-rose-600" /> Invitation Error
                </div>
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Information Card */}
            <div className="rounded-sm border border-slate-100 bg-slate-50/80 p-3.5 space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Invitation Code:</span>
                <span className="font-mono font-bold text-[#0D1F3D]">{invitationId}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                By accepting this invitation, your membership status will be set to <strong className="text-slate-700">Active</strong> and full administrator permissions will be enabled.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                variant="accent"
                size="sm"
                onClick={handleAcceptInvitation}
                disabled={loading}
                className="w-full gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Accepting Invitation...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5" /> Accept & Activate Workspace Access
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/login')}
                className="w-full font-bold text-slate-700"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Copyright */}
      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} Visiblo Smart Field Work SaaS. All rights reserved.
      </div>
    </div>
  );
}
