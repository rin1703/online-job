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
    // authenticate, 
    // authorize('admin'),
    createPackage
);

/**
 * @route   PUT /api/v1/subscription-packages/:id
 * @desc    Cập nhật package
 * @access  Private/Admin
 */
subscriptionPackageRouter.put('/:id', 
    // authenticate, 
    // authorize('admin'),
    updatePackage
);

/**
 * @route   DELETE /api/v1/subscription-packages/:id
 * @desc    Xóa package (soft delete hoặc permanent)
 * @query   permanent=true để xóa vĩnh viễn
 * @access  Private/Admin
 */
subscriptionPackageRouter.delete('/:id', 
    // authenticate, 
    // authorize('admin'),
    deletePackage
);

/**
 * @route   PATCH /api/v1/subscription-packages/:id/activate
 * @desc    Kích hoạt lại package
 * @access  Private/Admin
 */
subscriptionPackageRouter.patch('/:id/activate', 
    // authenticate, 
    // authorize('admin'),
    activatePackage
);

/**
 * @route   PUT /api/v1/subscription-packages/display-order
 * @desc    Cập nhật thứ tự hiển thị
 * @access  Private/Admin
 */
subscriptionPackageRouter.put('/display-order/update', 
    // authenticate, 
    // authorize('admin'),
    updateDisplayOrder
);

export default subscriptionPackageRouter;