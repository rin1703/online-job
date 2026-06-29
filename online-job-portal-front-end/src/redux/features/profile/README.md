# Profile API - RTK Query

Redux Toolkit Query API cho quản lý profile của user (job seeker).

## 📁 Structure

```
src/redux/features/profile/
├── index.ts          # Exports tập trung
├── profile.types.ts  # Type definitions
├── profileApi.ts     # RTK Query endpoints
└── README.md         # Documentation
```

## 🎯 Features

### 1. Profile CRUD
- Get profile by userId
- Create/Update complete profile
- Partial update profile

### 2. Work Experience Management
- Add work experience
- Update work experience
- Delete work experience

### 3. File Upload
- Upload avatar image
- Upload CV (PDF)

## 🚀 Usage Examples

### 1. Get User Profile

```typescript
import { useGetProfileQuery } from '@/redux/features/profile';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

function ProfilePage() {
  // Get userId from auth state
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const { data: profile, isLoading, isError } = useGetProfileQuery(userId!, {
    skip: !userId, // Don't fetch if no userId
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading profile</div>;

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.bio}</p>
      <img src={profile?.avatar} alt="Avatar" />
    </div>
  );
}
```

### 2. Update Profile

```typescript
import { useUpdateProfileMutation } from '@/redux/features/profile';

function EditProfileForm() {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const handleSubmit = async (formData) => {
    try {
      await updateProfile({
        userId: userId!,
        data: {
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
        },
      }).unwrap();

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Add Work Experience

```typescript
import { useAddWorkExperienceMutation } from '@/redux/features/profile';

function AddExperienceForm() {
  const [addExperience, { isLoading }] = useAddWorkExperienceMutation();
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const handleSubmit = async (formData) => {
    try {
      await addExperience({
        userId: userId!,
        experience: {
          title: formData.title,
          company: formData.company,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isCurrent: formData.isCurrent,
          description: formData.description,
        },
      }).unwrap();

      toast.success('Experience added successfully!');
    } catch (error) {
      toast.error('Failed to add experience');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. Delete Work Experience

```typescript
import { useDeleteWorkExperienceMutation } from '@/redux/features/profile';

function WorkExperienceItem({ experience }) {
  const [deleteExperience, { isLoading }] = useDeleteWorkExperienceMutation();
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;

    try {
      await deleteExperience({
        userId: userId!,
        expId: experience._id!,
      }).unwrap();

      toast.success('Experience deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete experience');
    }
  };

  return (
    <div>
      <h3>{experience.title}</h3>
      <p>{experience.company}</p>
      <button onClick={handleDelete} disabled={isLoading}>
        Delete
      </button>
    </div>
  );
}
```

### 5. Upload Avatar

```typescript
import { useUploadAvatarMutation } from '@/redux/features/profile';

function AvatarUpload() {
  const [uploadAvatar, { isLoading }] = useUploadAvatarMutation();
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      const result = await uploadAvatar({
        userId: userId!,
        file,
      }).unwrap();

      toast.success('Avatar uploaded successfully!');
      console.log('Avatar URL:', result.avatar);
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {isLoading && <p>Uploading...</p>}
    </div>
  );
}
```

### 6. Upload CV

```typescript
import { useUploadCVMutation } from '@/redux/features/profile';

function CVUpload() {
  const [uploadCV, { isLoading }] = useUploadCVMutation();
  const userId = useSelector((state: RootState) => state.auth.user?.userId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be less than 10MB');
      return;
    }

    try {
      const result = await uploadCV({
        userId: userId!,
        file,
      }).unwrap();

      toast.success('CV uploaded successfully!');
      console.log('CV URL:', result.cv);
    } catch (error) {
      toast.error('Failed to upload CV');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {isLoading && <p>Uploading...</p>}
    </div>
  );
}
```

## 📊 Available Endpoints

| Hook | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `useGetProfileQuery` | GET | `/profiles/:userId` | Get user profile |
| `useCreateOrUpdateProfileMutation` | PUT | `/profiles/:userId` | Create/Update complete profile |
| `useUpdateProfileMutation` | PATCH | `/profiles/:userId` | Partial update profile |
| `useAddWorkExperienceMutation` | POST | `/profiles/:userId/experiences` | Add work experience |
| `useUpdateWorkExperienceMutation` | PUT | `/profiles/:userId/experiences/:expId` | Update work experience |
| `useDeleteWorkExperienceMutation` | DELETE | `/profiles/:userId/experiences/:expId` | Delete work experience |
| `useUploadAvatarMutation` | POST | `/profiles/:userId/avatar` | Upload avatar image |
| `useUploadCVMutation` | POST | `/profiles/:userId/cv` | Upload CV (PDF) |

## 🔄 Auto Cache Invalidation

RTK Query tự động invalidate cache khi:
- Update profile → Refetch profile
- Add/Update/Delete experience → Refetch profile
- Upload avatar/CV → Refetch profile

Tag được sử dụng: `{ type: 'Profile', id: userId }`

## 💾 Integration với Auth

Profile API cần `userId` từ auth state:

```typescript
const userId = useSelector((state: RootState) => state.auth.user?.userId);
```

Đảm bảo user đã login trước khi gọi profile endpoints.

## 🎨 Best Practices

1. **Luôn skip query nếu không có userId**
   ```typescript
   useGetProfileQuery(userId!, { skip: !userId });
   ```

2. **Handle loading và error states**
   ```typescript
   if (isLoading) return <Skeleton />;
   if (isError) return <ErrorMessage />;
   ```

3. **Sử dụng `.unwrap()` cho mutations**
   ```typescript
   await updateProfile({ ... }).unwrap();
   ```

4. **Validate files trước khi upload**
   - Check file type
   - Check file size
   - Show progress nếu cần

5. **Show feedback cho user**
   - Toast notifications
   - Loading spinners
   - Error messages

## 🐛 Troubleshooting

### Profile không load
- Check userId có tồn tại không
- Check user đã login chưa
- Check network tab xem API có được gọi không
- Verify BE `/api/v1/profiles` routes đã được mount

### Upload file không hoạt động
- Check file type và size
- Check FormData được tạo đúng không
- Check BE upload middleware đã setup chưa
- Verify Cloudinary credentials

### Cache không update
- Check `invalidatesTags` đã được set đúng không
- Force refetch bằng `refetch()` nếu cần
