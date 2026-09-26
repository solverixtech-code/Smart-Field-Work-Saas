import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  Briefcase,
  Shield,
  Upload,
  Camera,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function AddExecutivePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    empId: 'EMP-1011',
    systemRole: 'FIELD_EXECUTIVE',
    designation: 'Field Executive',
    reportingTo: 'Sanjay Yadav (TL-1003)',
    team: 'Mumbai North Team',
    employmentType: 'Full Time',
    dob: '',
    gender: 'Male',
    bloodGroup: 'B+',
    mobile: '',
    altMobile: '',
    email: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    experience: '',
    region: 'Mumbai',
    shiftTiming: '09:00 AM - 06:00 PM',
    weeklyOff: 'Sunday',
    salary: '',
    mobileAccess: true,
    webAccess: true,
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.email) {
      setError('Please fill in all mandatory fields (Full Name, Mobile, Email).');
      return;
    }
    setError('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      navigate('/admin/executives');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Top Header CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/executives')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Employee Directory
          </button>
          <h1 className="text-xl font-extrabold text-[#0D1F3D]">Create Employee / User</h1>
          <p className="text-xs text-slate-500 font-medium">
            Add a new staff member or user to your workspace, assign their role, team, and access permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/executives')}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" size="sm" className="flex items-center gap-2 font-bold shadow-sm">
            <UserPlus className="h-4 w-4" /> Create Employee / User
          </Button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {submitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-700 animate-in fade-in">
          ✓ New Employee / User created successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-extrabold text-rose-600 animate-in fade-in">
          {error}
        </div>
      )}

      {/* Form Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Personal, Contact, Work Info */}
        <div className="space-y-6 lg:col-span-8">
          {/* Personal Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Personal Information</h3>
            </div>

            <div className="flex flex-wrap items-start gap-6 pt-2">
              {/* Photo Avatar Placeholder */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0D1F3D]/10 text-2xl font-extrabold text-[#0D1F3D] border-2 border-slate-200 shadow-xs">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'FE'}
                </div>
                <Button variant="outline" size="sm" type="button" className="text-xs font-bold flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-[#E20613]" /> Upload Photo
                </Button>
                <span className="text-[10px] text-slate-400 font-medium">JPG, PNG. Max 2MB</span>
              </div>

              {/* Personal Fields */}
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-semibold">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amit Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Employee ID *</label>
                  <input
                    type="text"
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">System Role *</label>
                  <select
                    value={formData.systemRole}
                    onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="FIELD_EXECUTIVE">Field Executive (Route tracking, Visits)</option>
                    <option value="TELECALLER">Telecaller / Inside Sales (Outbound calling, Demos)</option>
                    <option value="TEAM_LEADER">Team Leader (Roster & Targets)</option>
                    <option value="SALES_MANAGER">Sales Manager (Pipeline & Budgets)</option>
                    <option value="SUPPORT">Support / Operations</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Designation *</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="Field Executive">Field Executive</option>
                    <option value="Senior Field Executive">Senior Field Executive</option>
                    <option value="Telecaller">Telecaller</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Sales Manager">Sales Manager</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Reporting To *</label>
                  <select
                    value={formData.reportingTo}
                    onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="Sanjay Yadav (TL-1003)">Sanjay Yadav (TL-1003)</option>
                    <option value="Amit Sharma (Manager)">Amit Sharma (Manager)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Team *</label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="Mumbai North Team">Mumbai North Team</option>
                    <option value="Mumbai West Team">Mumbai West Team</option>
                    <option value="Thane Central">Thane Central</option>
                    <option value="Navi Mumbai Hub">Navi Mumbai Hub</option>
                    <option value="Pune Central">Pune Central</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Employment Type *</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Alternate Mobile</label>
                <input
                  type="text"
                  placeholder="+91 91234 00000"
                  value={formData.altMobile}
                  onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Email Address *</label>
                <input
                  type="email"
                  placeholder="executive@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-xs font-semibold">
              <label className="text-slate-600 block mb-1 font-bold">Complete Address</label>
              <textarea
                rows={2}
                placeholder="Enter complete residential address, city, pin code..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Work Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Work Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Joining Date *</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Experience (years)</label>
                <input
                  type="text"
                  placeholder="e.g. 2.5"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Work Region *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Thane">Thane</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Shift Timing</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 06:00 PM"
                  value={formData.shiftTiming}
                  onChange={(e) => setFormData({ ...formData, shiftTiming: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Weekly Off</label>
                <select
                  value={formData.weeklyOff}
                  onChange={(e) => setFormData({ ...formData, weeklyOff: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Salary (Annual CTC)</label>
                <input
                  type="text"
                  placeholder="e.g. 3,50,000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Permissions & Emergency Contacts */}
        <div className="space-y-6 lg:col-span-4">
          {/* Access & Permissions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Access Control</h3>
            </div>

            <div className="space-y-3 text-xs font-bold text-[#0D1F3D]">
              <label className="flex items-center gap-2.5 cursor-pointer rounded-xl bg-slate-50 p-3 border border-slate-100">
                <input
                  type="checkbox"
                  checked={formData.mobileAccess}
                  onChange={(e) => setFormData({ ...formData, mobileAccess: e.target.checked })}
                  className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                />
                <span>Mobile App Access</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer rounded-xl bg-slate-50 p-3 border border-slate-100">
                <input
                  type="checkbox"
                  checked={formData.webAccess}
                  onChange={(e) => setFormData({ ...formData, webAccess: e.target.checked })}
                  className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                />
                <span>Web Dashboard Access</span>
              </label>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Emergency Contact</h3>
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Father, Spouse"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 99876 00000"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
