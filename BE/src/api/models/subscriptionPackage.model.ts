import mongoose from "mongoose";
const subscriptionPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["basic", "standard", "premium", "enterprise"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number, // Giá gốc để hiển thị discount
      default: null,
    },
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["day", "month", "year"],
        default: "month",
      },
    },
    features: {
      // Số lượng tin đăng
      jobPostings: {
        limit: {
          type: Number,
          required: true, // -1 = unlimited
        },
        featured: {
          type: Number,
          default: 0, // Số tin được đánh dấu nổi bật
        },
        visibleDuration: {
          type: Number, // 3 | 5 | 7
          required: true,
        },
      },
      // Tìm kiếm ứng viên
      candidateSearch: {
        enabled: {
          type: Boolean,
          default: false,
        },
        viewsPerMonth: {
          type: Number,
          default: 0, // Số CV được xem/tháng
        },
        downloadCV: {
          type: Boolean,
          default: false,
        },
      },
      // Tiếp cận ứng viên
      messaging: {
        enabled: {
          type: Boolean,
          default: false,
        },
        messagesPerMonth: {
          type: Number,
          default: 0, // -1 = unlimited
        },
      },
      // Hỗ trợ và báo cáo
      support: {
        priority: {
          type: String,
          enum: ["none", "standard", "priority", "dedicated"],
          default: "none",
        },
        analytics: {
          type: Boolean,
          default: false,
        },
        advancedReports: {
          type: Boolean,
          default: false,
        },
      },
      // Tính năng quảng cáo
      advertising: {
        homepageBanner: {
          type: Boolean,
          default: false,
        },
        emailCampaign: {
          type: Number,
          default: 0, // Số lượng chiến dịch email/tháng
        },
        socialMediaPromotion: {
          type: Boolean,
          default: false,
        },
      },
      // Tính năng khác
      extras: [
        {
          name: String,
          description: String,
          enabled: Boolean,
        },
      ],
    },
    badge: {
      type: String,
      default: null, // 'popular', 'best-value', 'recommended'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index
subscriptionPackageSchema.index({ type: 1, isActive: 1 });

const SubscriptionPackage = mongoose.model(
  "SubscriptionPackage",
  subscriptionPackageSchema,
  "subscriptionpackages"
);

module.exports = SubscriptionPackage;
export default SubscriptionPackage;
