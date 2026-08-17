import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Eye,
  Trash2,
  Plus,
  Shield,
  User,
  Phone,
  Briefcase,
  Check,
  X,
  Camera,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function EditExecutivePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: 'Rahul Verma',
    empId: id || 'FE-1001',
    designation: 'Field Executive',
    reportingTo: 'Sanjay Yadav (TL-1003)',
    team: 'Mumbai North Team',
    employmentType: 'Full Time',
    dob: '1994-08-15',
    gender: 'Male',
    bloodGroup: 'B+',
    mobile: '+91 98765 43210',
    altMobile: '+91 91234 56789',
    email: 'rahul.verma@visibloai.com',
    address: 'Room No. 12, Shanti CHS, Kandivali West, Mumbai - 400067, Maharashtra, India',
    joinDate: '2024-04-12',
    experience: '1.8',
    region: 'Mumbai',
    shiftTiming: '09:00 AM - 06:00 PM',
    weeklyOff: 'Sunday',
    noticePeriod: '30',
    salary: '3,60,000',
    incentivePlan: 'Standard Plan',
    status: 'Active',
    role: 'Field Executive',
    mobileAccess: true,
    webAccess: true,
    dataAccess: 'Own Leads',
    canViewTeamLeads: false,
    emergencyName: 'Neha Verma',
    emergencyRelation: 'Wife',
    emergencyPhone: '+91 99876 54321',
    emergencyAltPhone: '+91 91234 56788',
    skills: 'Customer Communication, Lead Generation, Sales Follow-up, Negotiation',
    notes: 'Good communicator and consistent field performer.',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate(`/admin/executives/${id || 'FE-1001'}`);
    }, 1200);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      {/* Top Bar Header CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/executives/${id || 'FE-1001'}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Details
        </button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/executives/${id || 'FE-1001'}`)}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" size="sm" className="flex items-center gap-2 font-bold shadow-sm">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-700 animate-in fade-in">
          ✓ Executive details saved successfully! Redirecting...
        </div>
      )}

      {/* Form Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Personal, Contact, Work, Access Cards */}
        <div className="space-y-6 lg:col-span-8">
          {/* Personal Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Personal Information</h3>
            </div>

            <div className="flex flex-wrap items-start gap-6 pt-2">
              {/* Photo Avatar Upload */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                />
                <Button variant="outline" size="sm" type="button" className="text-xs font-bold flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-[#E20613]" /> Change Photo
                </Button>
                <span className="text-[10px] text-slate-400 font-medium">JPG, PNG. Max 2MB</span>
              </div>

              {/* Personal Fields Grid */}
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-semibold">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
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
                  <label className="text-slate-600 block mb-1 font-bold">Designation *</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="Field Executive">Field Executive</option>
                    <option value="Senior Field Executive">Senior Field Executive</option>
                    <option value="Team Leader">Team Leader</option>
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
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Alternate Number</label>
                <input
                  type="text"
                  value={formData.altMobile}
                  onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-xs font-semibold">
              <label className="text-slate-600 block mb-1 font-bold">Address *</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
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
                <label className="text-slate-600 block mb-1 font-bold">Join Date *</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Experience (years) *</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Work Location / Region *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Thane">Thane</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Shift Timing</label>
                <input
                  type="text"
                  value={formData.shiftTiming}
                  onChange={(e) => setFormData({ ...formData, shiftTiming: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
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
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Access & Permissions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Access & Permissions</h3>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-[#0D1F3D]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mobileAccess}
                  onChange={(e) => setFormData({ ...formData, mobileAccess: e.target.checked })}
                  className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                />
                <span>Mobile App Access</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
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
        </div>

        {/* Right Column: Documents Manager & Emergency Contacts */}
        <div className="space-y-6 lg:col-span-4">
          {/* Documents Manager Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Documents Manager</h3>
              <span className="text-xs font-bold text-[#E20613]">4 Uploaded</span>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              {[
                { name: 'Aadhaar Card', date: 'Uploaded on 12 Apr 2024' },
                { name: 'PAN Card', date: 'Uploaded on 12 Apr 2024' },
                { name: 'Resume', date: 'Uploaded on 12 Apr 2024' },
                { name: 'Address Proof', date: 'Uploaded on 12 Apr 2024' },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#E20613]" />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => alert(`Viewing ${doc.name}`)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => alert(`Removing ${doc.name}`)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" fullWidth className="flex items-center justify-center gap-2 text-xs font-bold">
              <Plus className="h-3.5 w-3.5" /> Upload New Document
            </Button>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Emergency Contact</h3>
            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Contact Name *</label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-extrabold text-[#0D1F3D] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Relationship *</label>
                <input
                  type="text"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-extrabold text-[#0D1F3D] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Phone Number *</label>
                <input
                  type="text"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-extrabold text-[#0D1F3D] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
