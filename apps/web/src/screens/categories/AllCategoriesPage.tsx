import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  RotateCcw,
  Eye,
  Edit,
  BarChart3,
  Trash2,
  ChevronLeft,
  ChevronRight,
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
  Power,
  FolderTree,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { mockCategoriesList, BusinessCategoryItem } from './categoriesData';

export default function AllCategoriesPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [parentFilter, setParentFilter] = useState('All Parents');
  const [createdFilter, setCreatedFilter] = useState('All Users');

  const filteredCategories = useMemo(() => {
    return mockCategoriesList.filter((c) => {
      const matchesSearch =
        !searchTerm.trim() ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
      const matchesParent =
        parentFilter === 'All Parents' ||
        (parentFilter === 'Top Level Only' ? c.parentCategory === '—' : c.parentCategory === parentFilter);
      const matchesCreated = createdFilter === 'All Users' || c.createdBy === createdFilter;

      return matchesSearch && matchesStatus && matchesParent && matchesCreated;
    });
  }, [searchTerm, statusFilter, parentFilter, createdFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setParentFilter('All Parents');
    setCreatedFilter('All Users');
    toast.info('Category filters reset');
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return <ShoppingBag className="h-4 w-4 text-purple-600" />;
      case 'Utensils': return <Utensils className="h-4 w-4 text-blue-600" />;
      case 'Stethoscope': return <Stethoscope className="h-4 w-4 text-emerald-600" />;
      case 'GraduationCap': return <GraduationCap className="h-4 w-4 text-amber-600" />;
      case 'Building2': return <Building2 className="h-4 w-4 text-indigo-600" />;
      case 'Car': return <Car className="h-4 w-4 text-orange-600" />;
      case 'Shirt': return <Shirt className="h-4 w-4 text-pink-600" />;
      case 'Laptop': return <Laptop className="h-4 w-4 text-sky-600" />;
      case 'Wrench': return <Wrench className="h-4 w-4 text-slate-600" />;
      case 'Sparkles': return <Sparkles className="h-4 w-4 text-yellow-600" />;
      case 'Scissors': return <Scissors className="h-4 w-4 text-rose-600" />;
      case 'Dumbbell': return <Dumbbell className="h-4 w-4 text-[#0D1F3D]" />;
      case 'Briefcase': return <Briefcase className="h-4 w-4 text-[#059669]" />;
      case 'Scale': return <Scale className="h-4 w-4 text-purple-700" />;
      case 'Activity': return <Activity className="h-4 w-4 text-teal-600" />;
      case 'BookOpen': return <BookOpen className="h-4 w-4 text-red-600" />;
      default: return <Layers className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Business Categories</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Business Categories</h1>
              <span className="rounded-md bg-purple-100 p-1.5 text-purple-700">
                <Layers className="h-5 w-5" />
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Manage and organize all business categories used across the system
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting categories list...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Import category template...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/categories/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Categories</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">156</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">↑ 6 new this month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Categories</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">142</span>
            <span className="text-xs font-semibold text-slate-500 block mt-0.5">91.0% of total</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Businesses</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">12,458</span>
            <span className="text-xs font-semibold text-slate-500 block mt-0.5">Across all categories</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Top Category</span>
            <span className="text-lg font-extrabold text-[#0D1F3D] truncate block max-w-[120px]">Retail Business</span>
            <span className="text-xs font-semibold text-slate-500 block mt-0.5">1,854 businesses</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Uncategorized</span>
            <span className="text-xl font-extrabold text-red-600">23</span>
            <span className="text-xs font-semibold text-slate-500 block mt-0.5">Need review</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-100 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All Parents">All Parents</option>
              <option value="Top Level Only">Top Level Only</option>
              <option value="Retail Business">Retail Business</option>
              <option value="Food & Restaurant">Food & Restaurant</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Home Services">Home Services</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={createdFilter}
              onChange={(e) => setCreatedFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All Users">All Users</option>
              <option value="Rohit Sharma">Rohit Sharma</option>
              <option value="Priya Sharma">Priya Sharma</option>
              <option value="Vijay Patel">Vijay Patel</option>
              <option value="Neha Verma">Neha Verma</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('More category filters panel opened')}
              className="text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" /> Filters
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* FULL WIDTH DATATABLE & ANALYTICS WIDGETS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Categories Table (8 Cols on LG) */}
        <div className="lg:col-span-8 rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden w-full flex flex-col justify-between">
          <div>
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#0D1F3D]">All Categories</h2>
              <span className="text-xs font-semibold text-slate-400">Showing {filteredCategories.length} categories</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                    <th className="p-3 text-center w-10">#</th>
                    <th className="p-3">Category Name</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Parent Category</th>
                    <th className="p-3 text-right">Businesses</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Sort Order</th>
                    <th className="p-3">Created On</th>
                    <th className="p-3 text-center w-16">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 bg-slate-50/40">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                            <Search className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-extrabold text-[#0D1F3D]">No Categories Found</p>
                          <p className="text-[11px] font-medium text-slate-400">Try adjusting your search query or filter settings</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat, idx) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>

                        <td className="p-3">
                          <div
                            onClick={() => navigate(`/admin/categories/${cat.id}`)}
                            className="flex items-center gap-2.5 cursor-pointer group"
                            title={`View details for ${cat.name}`}
                          >
                            <div className="h-7 w-7 rounded-sm bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {getCategoryIcon(cat.iconName)}
                            </div>
                            <div>
                              <span className="font-extrabold text-[#0D1F3D] block group-hover:text-purple-600 group-hover:underline transition-colors">
                                {cat.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-mono text-[11px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">
                            {cat.code}
                          </span>
                        </td>

                        <td className="p-3 text-slate-600 font-medium">
                          {cat.parentCategory}
                        </td>

                        <td className="p-3 text-right font-mono font-extrabold text-[#0D1F3D]">
                          {cat.businessesCount.toLocaleString('en-IN')}
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                              cat.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : cat.status === 'Inactive'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>

                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {cat.sortOrder}
                        </td>

                        <td className="p-3 text-slate-600 font-medium">
                          {cat.createdOn}
                        </td>

                        <td className="p-3 text-center">
                          <RowActionsMenu
                            items={[
                              {
                                label: 'View Details',
                                icon: Eye,
                                onClick: () => navigate(`/admin/categories/${cat.id}`),
                              },
                              {
                                label: 'Edit Category',
                                icon: Edit,
                                onClick: () => toast.info(`Editing category ${cat.name}`),
                              },
                              {
                                label: 'Category Performance',
                                icon: BarChart3,
                                onClick: () => navigate(`/admin/categories/${cat.id}/performance`),
                              },
                              {
                                label: cat.status === 'Active' ? 'Deactivate' : 'Activate',
                                icon: Power,
                                onClick: () => toast.success(`Category ${cat.name} status updated`),
                              },
                              {
                                label: 'Delete Category',
                                icon: Trash2,
                                danger: true,
                                divider: true,
                                onClick: () => toast.error(`Deleted category ${cat.name}`),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
            <span>Showing 1 to {filteredCategories.length} of 156 categories</span>
            <div className="flex items-center gap-1">
              <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
                1
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700">
                2
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Analytics Sidebar Widgets (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Categories by Status Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Categories by Status
            </h3>

            <div className="relative py-2 flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-500 border-t-amber-500 border-r-red-500 flex flex-col items-center justify-center shadow-xs">
                <span className="text-base font-extrabold text-[#0D1F3D]">156</span>
                <span className="text-[9px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
                </span>
                <span className="font-extrabold">142 (91.0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Inactive
                </span>
                <span className="font-extrabold">10 (6.4%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Archived
                </span>
                <span className="font-extrabold">4 (2.6%)</span>
              </div>
            </div>
          </div>

          {/* Top 5 Categories by Businesses */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Top 5 Categories by Businesses
            </h3>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                  <span>Retail Business</span>
                  <span>1,854</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600 w-[95%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                  <span>Food & Restaurant</span>
                  <span>1,642</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 w-[84%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                  <span>Healthcare</span>
                  <span>1,256</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600 w-[65%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                  <span>Education</span>
                  <span>1,024</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500 w-[52%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                  <span>Real Estate</span>
                  <span>986</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-600 w-[48%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Tree (Top Level) */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Category Tree (Top Level)</span>
              <FolderTree className="h-4 w-4 text-purple-600" />
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/admin/categories/cat-1')}>
                <span className="flex items-center gap-2 font-bold text-[#0D1F3D]">
                  <ShoppingBag className="h-3.5 w-3.5 text-purple-600" /> Retail Business
                </span>
                <span className="font-mono text-slate-600 font-bold">1,854</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/admin/categories/cat-2')}>
                <span className="flex items-center gap-2 font-bold text-[#0D1F3D]">
                  <Utensils className="h-3.5 w-3.5 text-blue-600" /> Food & Restaurant
                </span>
                <span className="font-mono text-slate-600 font-bold">1,642</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/admin/categories/cat-3')}>
                <span className="flex items-center gap-2 font-bold text-[#0D1F3D]">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-600" /> Healthcare
                </span>
                <span className="font-mono text-slate-600 font-bold">1,256</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/admin/categories/cat-4')}>
                <span className="flex items-center gap-2 font-bold text-[#0D1F3D]">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-600" /> Education
                </span>
                <span className="font-mono text-slate-600 font-bold">1,024</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-sm hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/admin/categories/cat-5')}>
                <span className="flex items-center gap-2 font-bold text-[#0D1F3D]">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" /> Real Estate
                </span>
                <span className="font-mono text-slate-600 font-bold">986</span>
              </div>
            </div>

            <button
              onClick={() => toast.info('Full category hierarchy tree view')}
              className="text-xs font-bold text-indigo-600 hover:underline block text-center w-full pt-1 cursor-pointer"
            >
              View Full Category Tree →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
