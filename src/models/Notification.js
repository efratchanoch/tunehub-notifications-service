import { Schema, model } from 'mongoose';

/**
 * Defines the structure of a notification document in MongoDB.
 */
const NotificationSchema = new Schema({
    title: {type:String},
    // The user who receives the notification
    recipientId: { type: String, required: true, index: true }, 
    
    // The user who triggered the action
    senderId: { type: String }, 
    
    // Categorizes the event type for frontend handling and logic
    type: { 
        type: String, 
        required: true,
        enum: [
            'LIKE_POST', 'LIKE_COMMENT', 'LIKE_SHEET_MUSIC', 
            'FAVORITE_POST', 'FAVORITE_SHEET_MUSIC',
            'COMMENT_ON_POST', 'FOLLOW_REQUEST_RECEIVED', 
            'FOLLOW_REQUEST_STATUS_UPDATE',
            'ADMIN_WARNING', 'ADMIN_PROMOTION'
        ] 
    },
    
    targetType: { type: String, required: true },

    // ID of the related object (Post ID, Comment ID, etc.)
    entityId: { type: String }, 
    
    // The text message displayed to the user
    content: { type: String, required: true },
    
    // Used for notification stacking (e.g., "5 people liked your post")
    counter: { type: Number, default: 1 }, 
    
    // Track if the user has viewed the notification
    isRead: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
}, { 
    // Automatically adds and manages createdAt and updatedAt fields
    timestamps: false
});

/**
 * Compound index to optimize fetching the latest notifications for a specific user.
 * Sorting: recipientId (ASC), createdAt (DESC)
 */
NotificationSchema.index({ recipientId: 1, entityId: 1, type: 1, targetType: 1 });

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export default model('Notification', NotificationSchema);