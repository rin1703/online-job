import { Request, Response } from 'express';
import subscriptionPackageService from '../service/subscriptionPackages.service';
import {
    CreateSubscriptionPackageDTO,
    UpdateSubscriptionPackageDTO,
    SubscriptionPackageDTO,
    SubscriptionPackageDetailDTO
} from '../dto/subscriptionPackage';

const getRequestParamString = (param: string | string[] | undefined, name = 'parameter'): string => {
    if (!param) {
        throw new Error(`${name} is required`);
    }
    return Array.isArray(param) ? param[0] : param;
};

// Lấy danh sách tất cả packages
export const getAllPackages = async (req: Request, res: Response) => {
    try {
        const { isActive, type } = req.query;

        const filter: any = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        if (type) {
            filter.type = type;
        }

        const packages = await subscriptionPackageService.getAllPackages(filter);

        // Map to DTO - only basic info without candidateSearch and messaging
        const packagesDTO = packages.map((pkg: any) => new SubscriptionPackageDTO(pkg));

        res.status(200).json({
            success: true,
            count: packagesDTO.length,
            data: packagesDTO
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách gói đăng ký',
            error: error.message
        });
    }
};

// Lấy chi tiết một package theo ID hoặc slug
export const getPackageById = async (req: Request, res: Response) => {
    try {
        const id = getRequestParamString(req.params.id, 'id');

        const package_ = await subscriptionPackageService.getPackageByIdOrSlug(id);

        // Map to detailed DTO - includes features but excludes candidateSearch and messaging
        const packageDTO = new SubscriptionPackageDetailDTO(package_);

        res.status(200).json({
            success: true,
            data: packageDTO
        });
    } catch (error: any) {
        if (error.message === 'Không tìm thấy gói đăng ký') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin gói đăng ký',
            error: error.message
        });
    }
};

// Tạo package mới
export const createPackage = async (req: Request, res: Response) => {
    try {
        const packageDTO = new CreateSubscriptionPackageDTO(req.body);

        const newPackage = await subscriptionPackageService.createPackage(packageDTO);

        // Return detailed DTO
        const responseDTO = new SubscriptionPackageDetailDTO(newPackage);

        res.status(201).json({
            success: true,
            message: 'Tạo gói đăng ký thành công',
            data: responseDTO
        });
    } catch (error: any) {
        if (error.message === 'Slug đã tồn tại, vui lòng chọn tên khác') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên hoặc slug đã tồn tại'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo gói đăng ký',
            error: error.message
        });
    }
};

// Cập nhật package
export const updatePackage = async (req: Request, res: Response) => {
    try {
        const id = getRequestParamString(req.params.id, 'id');
        const updateDTO = new UpdateSubscriptionPackageDTO(req.body);

        const updatedPackage = await subscriptionPackageService.updatePackage(id, updateDTO);

        // Return detailed DTO
        const responseDTO = new SubscriptionPackageDetailDTO(updatedPackage);

        res.status(200).json({
            success: true,
            message: 'Cập nhật gói đăng ký thành công',
            data: responseDTO
        });
    } catch (error: any) {
        if (error.message === 'Không tìm thấy gói đăng ký') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên hoặc slug đã tồn tại'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật gói đăng ký',
            error: error.message
        });
    }
};

// Xóa package (soft delete hoặc permanent)
export const deletePackage = async (req: Request, res: Response) => {
    try {
        const id = getRequestParamString(req.params.id, 'id');
        const { permanent } = req.query;

        if (permanent === 'true') {
            await subscriptionPackageService.permanentDeletePackage(id);

            return res.status(200).json({
                success: true,
                message: 'Xóa vĩnh viễn gói đăng ký thành công'
            });
        } else {
            const updatedPackage = await subscriptionPackageService.softDeletePackage(id);

            return res.status(200).json({
                success: true,
                message: 'Vô hiệu hóa gói đăng ký thành công',
                data: updatedPackage
            });
        }
    } catch (error: any) {
        if (error.message === 'Không tìm thấy gói đăng ký') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa gói đăng ký',
            error: error.message
        });
    }
};

// Kích hoạt lại package
export const activatePackage = async (req: Request, res: Response) => {
    try {
        const id = getRequestParamString(req.params.id, 'id');

        const updatedPackage = await subscriptionPackageService.activatePackage(id);

        res.status(200).json({
            success: true,
            message: 'Kích hoạt gói đăng ký thành công',
            data: updatedPackage
        });
    } catch (error: any) {
        if (error.message === 'Không tìm thấy gói đăng ký') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi kích hoạt gói đăng ký',
            error: error.message
        });
    }
};

// Cập nhật thứ tự hiển thị
export const updateDisplayOrder = async (req: Request, res: Response) => {
    try {
        const { packages } = req.body;

        await subscriptionPackageService.updateDisplayOrder(packages);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thứ tự hiển thị thành công'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thứ tự hiển thị',
            error: error.message
        });
    }
};