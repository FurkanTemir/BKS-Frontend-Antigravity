// Topic Types
export interface TopicDto {
    id: number
    name: string
    lesson: string
    lessonId: number
    examType: string
    fieldType: string
    isCompleted: boolean
    completedAt?: string
}

// MockExam Types
export interface MockExamDto {
    id: number
    examDate: string
    examType: string
    fieldType: string
    examName: string
    totalNet: number
    turkishNet?: number
    mathematicsNet?: number
    scienceNet?: number
    socialNet?: number
    literatureNet?: number
    geographyNet?: number
    historyNet?: number
    philosophyNet?: number
    physicsNet?: number
    chemistryNet?: number
    biologyNet?: number
    notes?: string
    createdDate: string
}

export interface CreateMockExamDto {
    examDate: string
    examType: number
    fieldType: number
    examName: string
    totalNet: number
    turkishNet?: number
    mathematicsNet?: number
    scienceNet?: number
    socialNet?: number
    literatureNet?: number
    geographyNet?: number
    historyNet?: number
    philosophyNet?: number
    physicsNet?: number
    chemistryNet?: number
    biologyNet?: number
    notes?: string
}

export interface MockExamTargetDto {
    examType: number
    targetTotalNet: number
    targetTurkishNet?: number
    targetMathematicsNet?: number
    targetScienceNet?: number
    targetSocialNet?: number
}

// StudySession Types
export interface StudySessionDto {
    id: number
    sessionType: string
    startTime: string
    endTime?: string
    durationSeconds: number
    topicId?: number
    topicName?: string
    notes?: string
    createdDate: string
}

export interface CreateStudySessionDto {
    sessionType: number
    topicId?: number
    notes?: string
    plannedDuration?: number
}

export interface EndStudySessionDto {
    id: number
    durationSeconds: number
}

// Note Types
export interface NoteDto {
    id: number
    title: string
    content: string
    createdDate: string
    updatedDate?: string
    topicId?: number
    topicName?: string
    filePath?: string
    fileName?: string
    fileType?: string
    category?: string
    tags: string[]
}

export interface CreateNoteDto {
    title: string
    content: string
    topicId?: number
    category?: string
    tags: string[]
}

// Community Types
export interface PostDto {
    id: number
    userId: number
    userName: string
    userBadgeIcon?: string
    userRole?: string
    topicId: number
    topicName: string
    contentType: number
    content: string
    imageUrl?: string
    createdDate: string
    viewCount: number
    likeCount: number
    commentCount: number
    isLikedByMe: boolean
    isApproved: boolean
}

export interface CreatePostDto {
    topicId: number
    contentType: number
    content: string
    imageUrl?: string
}

export interface CommentDto {
    id: number
    userId: number
    userName: string
    content: string
    createdDate: string
}

export interface CreateCommentDto {
    postId: number
    content: string
}

export interface LeaderboardEntryDto {
    rank: number
    userId: number
    firstName: string
    lastName: string
    studyTimeMinutes: number
    isCurrentUser: boolean
    profileImage?: string
    streak?: number
}

// Gamification Types
export interface BadgeDto {
    id: number
    name: string
    description: string
    iconUrl: string
    earnedDate: string
}

export interface GamificationProfileDto {
    userId: number
    currentStreak: number
    longestStreak: number
    totalStudyMinutes: number
    level: number
    points: number
    badges: BadgeDto[]
}

// Friendship Types
export interface FriendDto {
    friendshipId: number
    friendId: number
    firstName: string
    lastName: string
    userName: string
    level: number
    isOnline: boolean
    friendCode: string
}

export interface FriendRequestDto {
    friendshipId: number
    requesterId: number
    requesterName: string
    sentDate: string
}

export interface MessageDto {
    id: number
    senderId: number
    receiverId: number
    content: string;
    sentDate: string;
    isRead: boolean;
}

// Notification Types
export interface NotificationDto {
    id: number
    title: string
    message: string;
    notificationType: string; // Reminder, System, etc.
    reminderDate?: string;
    isSent: boolean;
    isActive: boolean;
    createdDate: string;
}

export interface CreateNotificationDto {
    title: string
    message: string
    reminderDate: string
    notificationType: number
}

export interface NotificationMessageDto {
    id: number
    title: string
    message: string
    isRead: boolean
    createdDate: string
    relatedEntityId?: number
    relatedEntityType?: string
}

// Study Resource Types
export interface StudyResourceDto {
    id: number
    name: string
    type: string // Book, QuestionBank, Video, etc.
    topicId?: number
    topicName?: string
    url?: string
    totalQuestions?: number
    solvedQuestions?: number
    isCompleted: boolean
    createdDate: string
}

export interface CreateStudyResourceDto {
    name: string
    type: string
    topicId?: number
    url?: string
    totalQuestions?: number
}

// Video Types
export interface VideoDto {
    id: number
    title: string
    fileName: string
    url: string
    duration: number
    thumbnailUrl?: string
    fileSizeBytes: number
    contentType: string
    uploadDate: string
    isProcessed: boolean
}

export interface GenerateUploadUrlRequest {
    fileName: string
    contentType: string
    fileSizeBytes: number
}

// Analytics Types
export interface HeatmapData {
    date: string
    count: number // intensity/minutes
}

export interface TimeWastedData {
    lessonName: string
    topicName: string
    wastedMinutes: number
    reason?: string
}

export interface StudyTimeChartData {
    date: string
    minutes: number
    subjectBreakdown: { [key: string]: number }
}

export interface ComprehensiveAnalysisDto {
    totalStudyTime: number
    dailyAverage: number
    mostProductiveDay: string
    mostStudiedSubject: string
    heatmap: HeatmapData[]
    weeklyChart: StudyTimeChartData[]
}

// Export & Undo Types
export interface UndoDto {
    undoHistoryId: number
    entityType: string
    entityName: string;
    deletedAt: string;
    remainingSeconds: number;
}

// Announcement Types
export interface AnnouncementDto {
    id: number
    title: string
    content: string
    createdDate: string
    isEmergency: boolean
}

export interface CreateAnnouncementDto {
    title: string
    content: string
    isEmergency: boolean
    targetGrade?: number
}

// Category Types
export interface CategoryDto {
    id: number
    name: string
    description: string
    parentId?: number
    subCategories?: CategoryDto[]
}

// Auth Types
export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    fieldType: number
}

export interface AuthResponse {
    success: boolean
    message: string
    token: string
    refreshToken: string
    tokenExpiresAt: string
    userId: number
    email: string
    firstName: string
    lastName: string
    userName: string
    fieldType: number | null
    friendCode: string
    roles: string[]
}

export interface UserDto {
    id: number
    email: string
    firstName: string
    lastName: string
    userName: string
    fieldType: string
}

export interface UpdateProfileRequest {
    firstName: string
    lastName: string
    userName: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

// Dashboard Types
export interface DashboardSummary {
    totalStudyMinutes: number
    weeklyStudyMinutes: number
    streak: number
    completedTopics: number
    totalTopics: number
    lastMockExamNet?: number
    weeklyProgress: number[]
}
