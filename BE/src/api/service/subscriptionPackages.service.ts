import SubscriptionPackage from '../models/subscriptionPackage.model';
import slugify from 'slugify';
import {
    CreateSubscriptionPackageDTO,
    UpdateSubscriptionPackageDTO
} from '../dto/subscriptionPackage';

interface PackageFilter {
    isActive?: boolean;
    type?: string;
}

interface DisplayOrderItem {
    id: string;
    displayOrder: number;
}

class SubscriptionPackageService {
    /**
     * Lấy danh sách tất cả packages với filter
     */
    async getAllPackages(filter: PackageFilter = {}) {
        const queryFilter: any = {};

        if (filter.isActive !== undefined) {
            queryFilter.isActive = filter.isActive;
        }
        if (filter.type) {
            queryFilter.type = filter.type;
        }

        const packages = await SubscriptionPackage.find(queryFilter)
            .sort({ displayOrder: 1, createdAt: -1 });

        return packages;
    }

    /**
     * Lấy chi tiết package theo ID hoặc slug
     */
    async getPackageByIdOrSlug(identifier: string) {
        const package_ = await SubscriptionPackage.findOne({
            $or: [
                { _id: identifier },
                { slug: identifier }
            ]
        });

        if (!package_) {
            throw new Error('Không tìm thấy gói đăng ký');
        }

        return package_;
    }

    /**
     * Tạo package mới
     */
    async createPackage(packageData: CreateSubscriptionPackageDTO) {
        const dataToCreate: any = { ...packageData };

        // Tự động tạo slug nếu không có
        if (!dataToCreate.slug && dataToCreate.name) {
            dataToCreate.slug = slugify(dataToCreate.name, {
                lower: true,
                strict: true
            });
        }

        // Kiểm tra slug đã tồn tại chưa
        const existingPackage = await SubscriptionPackage.findOne({
            slug: dataToCreate.slug
        });

        if (existingPackage) {
            throw new Error('Slug đã tồn tại, vui lòng chọn tên khác');
        }

        const newPackage = await SubscriptionPackage.create(dataToCreate);
        return newPackage;
    }

    /**
     * Cập nhật package
     */
    async updatePackage(id: string, updateData: UpdateSubscriptionPackageDTO) {
        const dataToUpdate: any = { ...updateData };

        // Nếu cập nhật name, tự động cập nhật slug
        if (dataToUpdate.name && !dataToUpdate.slug) {
            dataToUpdate.slug = slugify(dataToUpdate.name, {
                lower: true,
                strict: true
            });
        }

        const updatedPackage = await SubscriptionPackage.findByIdAndUpdate(
            id,
            dataToUpdate,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedPackage) {
            throw new Error('Không tìm thấy gói đăng ký');
        }

        return updatedPackage;
    }

    /**
     * Xóa package (soft delete)
     */
    async softDeletePackage(id: string) {
        const updatedPackage = await SubscriptionPackage.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!updatedPackage) {
            throw new Error('Không tìm thấy gói đăng ký');
        }

        return updatedPackage;
    }

    /**
     * Xóa package vĩnh viễn
     */
    async permanentDeletePackage(id: string) {
        const deletedPackage = await SubscriptionPackage.findByIdAndDelete(id);

        if (!deletedPackage) {
            throw new Error('Không tìm thấy gói đăng ký');
        }

        return deletedPackage;
    }

    /**
     * Kích hoạt lại package
     */
    async activatePackage(id: string) {
        const updatedPackage = await SubscriptionPackage.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!updatedPackage) {
            throw new Error('Không tìm thấy gói đăng ký');
        }

        return updatedPackage;
    }

    /**
     * Cập nhật thứ tự hiển thị
     */
    async updateDisplayOrder(packages: DisplayOrderItem[]) {
        const updatePromises = packages.map((pkg) =>
            SubscriptionPackage.findByIdAndUpdate(
                pkg.id,
                { displayOrder: pkg.displayOrder }
            )
        );

        await Promise.all(updatePromises);
        return true;
    }
}

export default new SubscriptionPackageService();