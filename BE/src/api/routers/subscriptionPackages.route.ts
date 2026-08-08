import { Router } from 'express';
import {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    activatePackage,
    updateDisplayOrder
} from '../controller/subscriptionPackages.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../models/enum/userRole.enum';

// Import middleware xác thực nếu có
// import { authenticate, authorize } from '../middleware/auth';

const subscriptionPackageRouter = Router();

/**
 * @route   GET /api/v1/subscription-packages
 * @desc    Lấy danh sách tất cả packages
 * @query   isActive (boolean), type (string)
 * @access  Public
 */
subscriptionPackageRouter.get('/', getAllPackages);

/**
 * @route   GET /api/v1/subscription-packages/:id
 * @desc    Lấy chi tiết một package (theo ID hoặc slug)
 * @access  Public
 */
subscriptionPackageRouter.get('/:id', getPackageById);

/**
 * @route   POST /api/v1/subscription-packages
 * @desc    Tạo package mới
 * @access  Private/Admin
 */
subscriptionPackageRouter.post('/', 
    verifyToken,
    requireRole(UserRole.ADMIN),
    createPackage
);

/**
 * @route   PUT /api/v1/subscription-packages/:id
 * @desc    Cập nhật package
 * @access  Private/Admin
 */
subscriptionPackageRouter.put('/:id', 
    verifyToken,
    requireRole(UserRole.ADMIN),
    updatePackage
);

/**
 * @route   DELETE /api/v1/subscription-packages/:id
 * @desc    Xóa package (soft delete hoặc permanent)
 * @query   permanent=true để xóa vĩnh viễn
 * @access  Private/Admin
 */
subscriptionPackageRouter.delete('/:id', 
    verifyToken,
    requireRole(UserRole.ADMIN),
    deletePackage
);

/**
 * @route   PATCH /api/v1/subscription-packages/:id/activate
 * @desc    Kích hoạt lại package
 * @access  Private/Admin
 */
subscriptionPackageRouter.patch('/:id/activate', 
    verifyToken,
    requireRole(UserRole.ADMIN),
    activatePackage
);

/**
 * @route   PUT /api/v1/subscription-packages/display-order
 * @desc    Cập nhật thứ tự hiển thị
 * @access  Private/Admin
 */
subscriptionPackageRouter.put('/display-order/update', 
    verifyToken,
    requireRole(UserRole.ADMIN),
    updateDisplayOrder
);

export default subscriptionPackageRouter;
