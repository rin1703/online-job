# Job Seeker Redux Slice

Redux slice để quản lý state liên quan đến jobs cho job seekers, bao gồm saved jobs, recent views, filters, và view preferences.

## 📁 Structure

```
src/features/job-seeker/api/
├── index.ts          # Exports tập trung
├── job.types.ts      # Type definitions
├── job.slice.ts      # Redux slice với reducers và actions
├── job.hooks.ts      # Custom hooks để truy cập state dễ dàng
└── README.md         # Documentation
```

## 🎯 Features

### 1. Saved Jobs (Favorite Jobs)
- Lưu danh sách job đã save
- Persist vào localStorage
- Toggle save/unsave jobs

### 2. Recent Jobs
- Track 10 jobs được xem gần đây
- Tự động cập nhật khi xem job detail
- Persist vào localStorage

### 3. Job Filters
- Industry, location, experience, level, salary, workType
- Clear all filters
- Dùng để filter job listings

### 4. View Preferences
- View mode: list hoặc grid
- Sort by: newest, updated, salary-high, salary-low, popular
- Persist vào localStorage

### 5. Search Term
- Lưu search term hiện tại

## 🚀 Usage

### Import

```typescript
// Import tất cả từ index
import {
  useSavedJobs,
  useRecentJobs,
  useJobFilters,
  useJobViewPreferences,
  toggleSaveJob,
  addRecentJob,
} from '@/features/job-seeker/api';
```

### 1. Saved Jobs Hook

```typescript
function JobCard({ jobId }: { jobId: string }) {
  const { savedJobs, toggleSaveJob, isSaved, count } = useSavedJobs();

  return (
    <div>
      <button onClick={() => toggleSaveJob(jobId)}>
        {isSaved(jobId) ? 'Unsave' : 'Save'}
      </button>
      <p>Total saved: {count}</p>
    </div>
  );
}
```

### 2. Recent Jobs Hook

```typescript
function RecentJobsSection() {
  const { recentJobs, addRecentJob, clearAll } = useRecentJobs();

  return (
    <div>
      <h3>Recently Viewed ({recentJobs.length})</h3>
      {recentJobs.map(jobId => <JobCard key={jobId} jobId={jobId} />)}
      <button onClick={clearAll}>Clear All</button>
    </div>
  );
}
```

### 3. Job Filters Hook

```typescript
function FilterPanel() {
  const { filters, setFilters, clearFilters } = useJobFilters();

  return (
    <div>
      <input
        onChange={(e) => setFilters({
          industry: [...filters.industry, e.target.value]
        })}
      />
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}
```

### 4. View Preferences Hook

```typescript
function JobListHeader() {
  const { viewMode, sortBy, setViewMode, setSortBy } = useJobViewPreferences();

  return (
    <div>
      <button onClick={() => setViewMode('list')}>List</button>
      <button onClick={() => setViewMode('grid')}>Grid</button>

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="salary-high">Salary High to Low</option>
      </select>
    </div>
  );
}
```

### 5. Track Job View

```typescript
// Trong job detail page
import { useDispatch } from 'react-redux';
import { addRecentJob } from '@/features/job-seeker/api';

function JobDetailPage({ jobId }: { jobId: string }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (jobId) {
      dispatch(addRecentJob(jobId));
    }
  }, [jobId, dispatch]);

  return <div>Job Details...</div>;
}
```

## 💾 LocalStorage Keys

Slice tự động persist các data sau vào localStorage:

| Key | Data | Description |
|-----|------|-------------|
| `job_savedJobs` | `string[]` | Saved job IDs |
| `job_recentJobs` | `string[]` | Recently viewed job IDs (max 10) |
| `job_viewMode` | `'list' \| 'grid'` | View mode preference |
| `job_sortBy` | `string` | Sort preference |

## 📊 State Structure

```typescript
interface JobState {
  savedJobs: Set<string>;
  recentJobs: string[];
  filters: {
    industry: string[];
    location: string[];
    experience: string[];
    level: string[];
    salary: { min: number; max: number };
    workType: string[];
  };
  searchTerm: string;
  viewMode: 'list' | 'grid';
  sortBy: string;
}
```

## ⚙️ Actions

### Direct Dispatch (không khuyến khích)

```typescript
import { useDispatch } from 'react-redux';
import { toggleSaveJob, setSortBy } from '@/features/job-seeker/api';

const dispatch = useDispatch();
dispatch(toggleSaveJob('job-123'));
dispatch(setSortBy('newest'));
```

### Recommended: Sử dụng Custom Hooks

```typescript
// ✅ Khuyến khích - Clean và type-safe
const { toggleSaveJob } = useSavedJobs();
toggleSaveJob('job-123');
```

## 🔄 Integration với RTK Query

Job slice hoạt động song song với RTK Query (`jobApi.ts`):

- **RTK Query**: Fetch data từ backend, caching
- **Job Slice**: Lưu user preferences và actions (saved, recent, filters)

```typescript
// Fetch jobs từ API
const { data: jobs } = useGetJobsQuery({ page: 1, limit: 10 });

// Lấy saved jobs từ slice
const { savedJobs, isSaved } = useSavedJobs();

// Combine
const jobsWithSavedStatus = jobs?.map(job => ({
  ...job,
  isSaved: isSaved(job.id)
}));
```

## 🎨 Best Practices

1. **Sử dụng custom hooks** thay vì useSelector trực tiếp
2. **Không mutate state** - Redux Toolkit tự động xử lý với Immer
3. **Persist chỉ những gì cần** - Không lưu toàn bộ filters vào localStorage
4. **Clear data khi logout** - Gọi `clearSavedJobs()` và `clearRecentJobs()`

## 🐛 Troubleshooting

### Saved jobs không persist sau reload
- Check localStorage trong DevTools
- Đảm bảo `saveToLocalStorage()` được gọi trong reducer

### Set serialization warning
- Đã config `serializableCheck` trong store.ts
- Ignore `job.savedJobs` path

### Recent jobs không update
- Đảm bảo `addRecentJob()` được gọi trong useEffect của job detail page
- Check `jobId` không undefined
