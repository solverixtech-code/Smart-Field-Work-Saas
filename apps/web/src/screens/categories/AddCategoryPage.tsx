import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Layers,
  ShoppingBag,
  Utensils,
  Stethoscope,
  GraduationCap,
  Building2,
  Car,
  Shirt,
  Laptop,
  Wrench,
  Sparkles,
  Scissors,
  Dumbbell,
  Briefcase,
  Scale,
  Activity,
  BookOpen,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

const AVAILABLE_ICONS = [
  { name: 'ShoppingBag', label: 'Retail / Shop', icon: ShoppingBag },
  { name: 'Utensils', label: 'Food / Dining', icon: Utensils },
  { name: 'Stethoscope', label: 'Medical / Health', icon: Stethoscope },
  { name: 'GraduationCap', label: 'Education / Academy', icon: GraduationCap },
  { name: 'Building2', label: 'Real Estate / Office', icon: Building2 },
  { name: 'Car', label: 'Automotive / Vehicle', icon: Car },
  { name: 'Shirt', label: 'Fashion / Apparel', icon: Shirt },
  { name: 'Laptop', label: 'IT / Tech', icon: Laptop },
  { name: 'Wrench', label: 'Services / Repair', icon: Wrench },
  { name: 'Sparkles', label: 'Dental / Special', icon: Sparkles },
  { name: 'Scissors', label: 'Salon / Beauty', icon: Scissors },
  { name: 'Dumbbell', label: 'Gym / Fitness', icon: Dumbbell },
  { name: 'Briefcase', label: 'CA / Finance', icon: Briefcase },
  { name: 'Scale', label: 'Lawyer / Legal', icon: Scale },
  { name: 'Activity', label: 'Clinic / Medical', icon: Activity },
  { name: 'BookOpen', label: 'Coaching / Tuition', icon: BookOpen },
];

const EXAMPLES_LIST = [
  { name: 'Retail Business', code: 'RETAIL', iconName: 'ShoppingBag' },
  { name: 'Food & Restaurant', code: 'FOOD', iconName: 'Utensils' },
  { name: 'Healthcare', code: 'HEALTH', iconName: 'Stethoscope' },
  { name: 'Dentist', code: 'DENTIST', iconName: 'Sparkles' },
  { name: 'Salon', code: 'SALON', iconName: 'Scissors' },
  { name: 'Restaurant', code: 'RESTAURANT', iconName: 'Utensils' },
  { name: 'Gym', code: 'GYM', iconName: 'Dumbbell' },
  { name: 'CA', code: 'CA', iconName: 'Briefcase' },
  { name: 'Lawyer', code: 'LAWYER', iconName: 'Scale' },
  { name: 'Clinic', code: 'CLINIC', iconName: 'Activity' },
  { name: 'Real Estate', code: 'REAL', iconName: 'Building2' },
  { name: 'Repair Centre', code: 'REPAIR', iconName: 'Wrench' },
  { name: 'Coaching Institute', code: 'COACHING', iconName: 'BookOpen' },
  { name: 'Automotive', code: 'AUTO', iconName: 'Car' },
];

export default function AddCategoryPage() {
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('ShoppingBag');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [description, setDescription] = useState('');

  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('1');
  const [defaultTargetTemplate, setDefaultTargetTemplate] = useState('');
  const [applicableFor, setApplicableFor] = useState<{ fieldSales: boolean; telecalling: boolean; both: boolean }>({
    fieldSales: true,
    telecalling: true,
    both: true,
  });
  const [allowLeadAssignment, setAllowLeadAssignment] = useState<'Yes' | 'No'>('Yes');
  const [allowBusinessCreation, setAllowBusinessCreation] = useState<'Yes' | 'No'>('Yes');
  const [tagsInput, setTagsInput] = useState('');

  const handleNameChange = (val: string) => {
    setCategoryName(val);
    if (!categoryCode) {
      const generatedCode = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      setCategoryCode(generatedCode);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    toast.success(`Category "${categoryName}" created successfully!`);
    navigate('/admin/categories');
  };

  const selectedIconObj = AVAILABLE_ICONS.find((i) => i.name === selectedIconName) || AVAILABLE_ICONS[0];
  const IconComp = selectedIconObj.icon;

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/categories')}>
            Categories
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Add Category</span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Add Category</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Create a new business category to organize businesses in the system
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateCategory} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT FORM CONTENT (8 COLS ON LG) */}
        <div className="lg:col-span-8 space-y-5">
          {/* CATEGORY INFORMATION CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-indigo-700 border-b border-slate-100 pb-2">
              Category Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Retail Business"
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-indigo-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">e.g. Retail Business</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Category Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RETAIL"
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-[#0D1F3D] focus:border-indigo-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">e.g. RETAIL (3-20 characters, uppercase letters only)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Parent Category"
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  options={[
                    { value: '', label: 'Select parent category (optional)' },
                    { value: 'cat-1', label: 'Retail Business' },
                    { value: 'cat-2', label: 'Food & Restaurant' },
                    { value: 'cat-3', label: 'Healthcare' },
                    { value: 'cat-4', label: 'Education' },
                    { value: 'cat-5', label: 'Home Services' },
                  ]}
                  searchable={true}
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Leave blank if this is a top-level category</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Category Icon</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                    className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0D1F3D] hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <IconComp className="h-4 w-4 text-indigo-600" />
                      <span>{selectedIconObj.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Change Icon ∨</span>
                  </button>

                  {isIconPickerOpen && (
                    <div className="absolute left-0 top-full mt-1 w-full rounded-md border border-slate-200 bg-white p-2 shadow-xl z-50 grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {AVAILABLE_ICONS.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setSelectedIconName(item.name);
                              setIsIconPickerOpen(false);
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-sm border text-[10px] font-bold ${
                              selectedIconName === item.name
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <ItemIcon className="h-4 w-4 mb-1" />
                            <span className="truncate w-full text-center">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Choose an icon to represent this category</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <span className="text-[10px] text-slate-400 font-mono">{description.length} / 300</span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter category description..."
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Briefly describe what businesses fall under this category</span>
            </div>
          </div>

          {/* CATEGORY SETTINGS CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-indigo-700 border-b border-slate-100 pb-2">
              Category Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-extrabold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  Inactive categories will not be available for selection
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Display Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-indigo-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  Display order in category lists (1 = highest priority)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Default Target Template"
                  value={defaultTargetTemplate}
                  onChange={(e) => setDefaultTargetTemplate(e.target.value)}
                  options={[
                    { value: '', label: 'Select target template (optional)' },
                    { value: 'retail_q2', label: 'Retail Growth Target Q2' },
                    { value: 'fnb_std', label: 'F&B Onboarding Standard' },
                    { value: 'health_ent', label: 'Healthcare Enterprise Target' },
                    { value: 'edtech_std', label: 'EdTech Sales Quota' },
                  ]}
                  searchable={false}
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Set default targets for businesses in this category</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Applicable For <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-2">
                  <Checkbox
                    label="Field Sales"
                    checked={applicableFor.fieldSales}
                    onChange={(checked) => setApplicableFor({ ...applicableFor, fieldSales: checked })}
                  />
                  <Checkbox
                    label="Telecalling"
                    checked={applicableFor.telecalling}
                    onChange={(checked) => setApplicableFor({ ...applicableFor, telecalling: checked })}
                  />
                  <Checkbox
                    label="Both"
                    checked={applicableFor.both}
                    onChange={(checked) => setApplicableFor({ ...applicableFor, both: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Allow Lead Assignment <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D1F3D] cursor-pointer">
                    <input
                      type="radio"
                      name="allowLead"
                      value="Yes"
                      checked={allowLeadAssignment === 'Yes'}
                      onChange={() => setAllowLeadAssignment('Yes')}
                      className="text-indigo-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D1F3D] cursor-pointer">
                    <input
                      type="radio"
                      name="allowLead"
                      value="No"
                      checked={allowLeadAssignment === 'No'}
                      onChange={() => setAllowLeadAssignment('No')}
                      className="text-indigo-600"
                    />
                    No
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Can leads be assigned to this category?</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Allow Business Creation <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D1F3D] cursor-pointer">
                    <input
                      type="radio"
                      name="allowBiz"
                      value="Yes"
                      checked={allowBusinessCreation === 'Yes'}
                      onChange={() => setAllowBusinessCreation('Yes')}
                      className="text-indigo-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0D1F3D] cursor-pointer">
                    <input
                      type="radio"
                      name="allowBiz"
                      value="No"
                      checked={allowBusinessCreation === 'No'}
                      onChange={() => setAllowBusinessCreation('No')}
                      className="text-indigo-600"
                    />
                    No
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Can new businesses be created under this category?</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-500 block mb-1">Tags (Optional)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Add tags and press Enter"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Add relevant tags to help identify this category</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="accent"
              size="md"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Category
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/categories')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* RIGHT SIDEBAR PREVIEW & EXAMPLES (4 COLS ON LG) */}
        <div className="lg:col-span-4 space-y-4">
          {/* LIVE CATEGORY PREVIEW CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Category Preview
            </h3>

            <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                <IconComp className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#0D1F3D]">
                  {categoryName || 'Retail Business'}
                </h4>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-mono text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-xs">
                    {categoryCode || 'RETAIL'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-2">
                  {parentCategory ? `Sub-category of ${parentCategory}` : 'Top Level Category'}
                </p>
              </div>
            </div>
          </div>

          {/* CATEGORY GUIDELINES CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Category Guidelines
            </h3>

            <ul className="space-y-2 text-slate-600 font-medium text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Choose a clear and specific name for the category.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Use a unique code for easy identification.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Set appropriate targets based on business nature.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Categories help in reporting and performance tracking.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>You can edit category details anytime.</span>
              </li>
            </ul>
          </div>

          {/* EXAMPLES CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Examples
            </h3>

            <div className="space-y-2">
              {EXAMPLES_LIST.map((ex) => (
                <div
                  key={ex.name}
                  onClick={() => {
                    setCategoryName(ex.name);
                    setCategoryCode(ex.code);
                    setSelectedIconName(ex.iconName);
                  }}
                  className="flex items-center justify-between p-2 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors"
                >
                  <span className="font-extrabold text-[#0D1F3D] text-xs">{ex.name}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-xs border border-slate-200">
                    {ex.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
