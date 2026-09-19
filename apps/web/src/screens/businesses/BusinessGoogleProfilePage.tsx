import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Edit,
  Star,
  CheckCircle2,
  Eye,
  Search,
  MapPin,
  MousePointer,
  Phone,
  Navigation,
  Plus,
  MessageSquare,
  Image as ImageIcon,
  Activity,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { BusinessItem, mockGoogleProfile } from './businessesData';

const insightsTrendData = [
  { date: 'Apr 20', views: 120, searches: 80, actions: 35 },
  { date: 'Apr 27', views: 180, searches: 110, actions: 48 },
  { date: 'May 4', views: 240, searches: 140, actions: 65 },
  { date: 'May 11', views: 210, searches: 130, actions: 58 },
  { date: 'May 18', views: 320, searches: 210, actions: 95 },
];

export default function BusinessGoogleProfilePage() {
  const context = useOutletContext<any>();
  const business = context?.business || context || {};
  const [profile] = useState(mockGoogleProfile);

  return (
    <div className="space-y-4 font-sans">
      {/* Sub Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F3D] flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" /> Google Business Profile
          </h2>
          <p className="text-xs text-slate-500">View and manage the Google Business Profile details and live local search performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Syncing Google Profile coordinates...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 text-blue-600" /> Sync Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(profile.website, '_blank')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" /> View on Google
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('Opening Edit Profile dialog...')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Profile Info Banner */}
      <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start gap-5">
          {/* Logo / Thumbnail */}
          {business.id && localStorage.getItem(`visiblo_biz_logo_${business.id}`) ? (
            <img
              src={localStorage.getItem(`visiblo_biz_logo_${business.id}`)!}
              alt={business.name || 'Business'}
              className="h-20 w-20 rounded-md object-cover border border-slate-200 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md bg-blue-100 font-bold text-blue-800 text-xl border border-blue-200 shrink-0">
              {business.name ? business.name.slice(0, 2).toUpperCase() : 'BU'}
            </div>
          )}

          {/* Profile Basic Info */}
          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#0D1F3D]">{business.name}</h3>
              <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {profile.rating}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">({profile.reviewCount} reviews)</span>
            </div>
            <p className="text-xs text-slate-500">{profile.address}</p>
            <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-slate-700">
              <span>📞 {profile.phone}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {profile.status}
              </span>
            </div>
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600 border-l border-slate-100 pl-5 min-w-[260px]">
            <div>
              <span className="text-slate-400 text-[11px] block">Profile ID</span>
              <span className="font-mono text-[#0D1F3D] font-bold">{profile.profileId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Listing Created</span>
              <span className="text-[#0D1F3D] font-bold">{profile.createdOn}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Category</span>
              <span className="text-[#0D1F3D] font-bold">{profile.category}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Connected By</span>
              <span className="text-[#0D1F3D] font-bold">{profile.connectedBy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Top Performance KPI Cards (Last 28 Days) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#0D1F3D]">Performance Summary (Last 28 Days)</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 sm:grid-cols-3">
          <KpiCard
            title="Views"
            value="8,456"
            change="+12.6%"
            changeType="positive"
            timeframe="vs last month"
            icon={Eye}
            iconBgColor="bg-blue-500/10"
            iconTextColor="text-blue-600"
          />
          <KpiCard
            title="Searches"
            value="4,213"
            change="+9.4%"
            changeType="positive"
            timeframe="vs last month"
            icon={Search}
            iconBgColor="bg-purple-500/10"
            iconTextColor="text-purple-600"
          />
          <KpiCard
            title="Map Views"
            value="2,125"
            change="+15.3%"
            changeType="positive"
            timeframe="vs last month"
            icon={MapPin}
            iconBgColor="bg-emerald-500/10"
            iconTextColor="text-emerald-600"
          />
          <KpiCard
            title="Website Clicks"
            value="312"
            change="+8.7%"
            changeType="positive"
            timeframe="vs last month"
            icon={MousePointer}
            iconBgColor="bg-cyan-500/10"
            iconTextColor="text-cyan-600"
          />
          <KpiCard
            title="Calls"
            value="186"
            change="+10.2%"
            changeType="positive"
            timeframe="vs last month"
            icon={Phone}
            iconBgColor="bg-amber-500/10"
            iconTextColor="text-amber-600"
          />
          <KpiCard
            title="Directions"
            value="98"
            change="+7.8%"
            changeType="positive"
            timeframe="vs last month"
            icon={Navigation}
            iconBgColor="bg-indigo-500/10"
            iconTextColor="text-indigo-600"
          />
        </div>
      </div>

      {/* Main Grid: Reviews & Posts (Left 8 Cols) + Profile Completeness & Insights (Right 4 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Latest Reviews Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-[#0D1F3D]">Latest Customer Reviews</h3>
              <button onClick={() => toast.info('Viewing all 128 reviews...')} className="text-xs font-bold text-blue-600 hover:underline">
                View All Reviews →
              </button>
            </div>

            <div className="space-y-3">
              {profile.reviews.map((rev) => (
                <div key={rev.id} className="rounded-md bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={rev.avatar} alt={rev.author} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-[#0D1F3D] block">{rev.author}</span>
                        <span className="text-[10px] text-slate-400">{rev.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium">{rev.comment}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => toast.info('Opening Reply Manager...')}
              className="text-xs font-bold border-slate-200 text-[#0D1F3D]"
            >
              Manage & Reply to Reviews
            </Button>
          </div>

          {/* Latest Google Posts Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-[#0D1F3D]">Latest Google Posts</h3>
              <button onClick={() => toast.info('Viewing all posts...')} className="text-xs font-bold text-blue-600 hover:underline">
                View All Posts →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {profile.posts.map((post) => (
                <div key={post.id} className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs space-y-2">
                  <img src={post.image} alt={post.title} className="h-28 w-full object-cover" />
                  <div className="p-2.5 space-y-1 text-xs">
                    <p className="font-bold text-[#0D1F3D] line-clamp-2">{post.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>{post.date}</span>
                      <span>👁 {post.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={() => toast.info('Opening New Post Creator...')}
              className="text-xs font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Create New Google Post
            </Button>
          </div>
        </div>

        {/* Right Column (4 Cols): Completeness & Insights */}
        <div className="space-y-4 lg:col-span-4">
          {/* Profile Completeness Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Profile Completeness</h3>
            <div className="flex items-center justify-center py-2">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500 text-center font-extrabold text-emerald-600 text-lg">
                92%
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-emerald-600">✓ Business Name</span><span className="text-emerald-600">Complete</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-emerald-600">✓ Categories</span><span className="text-emerald-600">Complete</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-emerald-600">✓ Address</span><span className="text-emerald-600">Complete</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-emerald-600">✓ Phone Number</span><span className="text-emerald-600">Complete</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1 text-amber-600">⚠ Products</span><span className="text-amber-600">0 / 3</span></div>
            </div>

            <Button variant="outline" size="sm" fullWidth onClick={() => toast.info('Improving Profile...')} className="text-xs font-bold border-slate-200">
              Improve Profile Completeness
            </Button>
          </div>

          {/* Insights Chart */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Insights Trend (Last 28 Days)</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insightsTrendData}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="searches" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
