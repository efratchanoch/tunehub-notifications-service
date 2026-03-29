import { Schema, model } from 'mongoose';

/**
 * Defines the structure of a notification document in MongoDB.
 */
const NotificationSchema = new Schema({
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
            'FOLLOW_REQUEST_ACCEPTED', 'FOLLOW_REQUEST_DECLINED',
            'ADMIN_WARNING', 'ADMIN_PROMOTION'
        ] 
    },
    
    // ID of the related object (Post ID, Comment ID, etc.)
    entityId: { type: String }, 
    
    // The text message displayed to the user
    content: { type: String, required: true },
    
    // Used for notification stacking (e.g., "5 people liked your post")
    counter: { type: Number, default: 1 }, 
    
    // Track if the user has viewed the notification
    isRead: { type: Boolean, default: false },
    
    // Redirection path for frontend navigation
    link: { type: String }
}, { 
    // Automatically adds and manages createdAt and updatedAt fields
    timestamps: true 
});

/**
 * Compound index to optimize fetching the latest notifications for a specific user.
 * Sorting: recipientId (ASC), createdAt (DESC)
 */
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export default model('Notification', NotificationSchema);