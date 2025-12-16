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
// Video DTOs
export interface VideoDto {
    id: number
    fileName: string
    publicUrl: string
    fileSizeBytes: number
    durationSeconds: number
    createdDate: string
}

export interface GenerateUploadUrlRequest {
    fileName: string
    contentType: string
    fileSizeBytes: number
}

export interface PresignedUploadUrlDto {
    uploadUrl: string
    videoId: number
    r2Key: string
    publicUrl: string
    expiresAt: string
}

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
    video?: VideoDto
    createdDate: string
    viewCount: number
    likeCount: number
    commentCount: number
    isLikedByMe: boolean
    isApproved: boolean
    rejectionReason?: string
}

export interface CreatePostDto {
    topicId: number
    contentType: number
    content: string
    imageFile?: File | null
    imageUrl?: string
    videoId?: number
}

export interface CommentDto {
    id: number
    userId: number
    userName: string
    content: string
    createdDate: string
    parentId?: number
    replies?: CommentDto[]
}

export interface CreateCommentDto {
    postId: number
    content: string
    parentId?: number
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
export interface UserStreakDto {
    currentStreak: number
    maxStreak: number
    lastActivityDate: string
}

export interface BadgeDto {
    id: number
    name: string
    description: string
    iconUrl: string
    conditionType: string
    targetValue: number
    isEarned: boolean
    earnedDate?: string
}

export interface GamificationProfileDto {
    streak: UserStreakDto
    badges: BadgeDto[]
    totalPoints: number
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
    lastMessage?: string
    lastMessageDate?: string
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
    sentAt: string;
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
    resourceType: string // Book, QuestionBank, Video, etc. from backend enum to string
    topicId?: number
    topicName?: string
    linkOrInfo?: string
    totalQuestions?: number
    solvedQuestions?: number
    isCompleted: boolean
    createdDate: string
}

export interface CreateStudyResourceDto {
    Name: string
    ResourceType: number
    LinkOrInfo?: string
    TopicId?: number
    TotalQuestions?: number
    SolvedQuestionCount?: number
}

// Optional: You might want to update UpdateStudyResourceDto too if used
export interface UpdateStudyResourceDto {
    Id: number
    Name: string
    ResourceType: number
    LinkOrInfo?: string
    TopicId?: number
    SolvedQuestionCount?: number
    TotalQuestions?: number
    Notes?: string
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
    totalSeconds: number
}

export interface TimeWastedData {
    lessonName: string
    topicName: string
    wastedMinutes: number
    reason?: string
}

export interface StudyTimeChartData {
    date: string
    totalSeconds: number
    pomodoroSeconds: number
    normalSeconds: number
}

export interface ComprehensiveAnalysisDto {
    totalStudyTime: number
    dailyAverage: number
    mostProductiveDay: string
    mostStudiedSubject: string
    heatmap: HeatmapData[]
    weeklyChart: StudyTimeChartData[]
    recentActivities: StudyActivityDto[]
}

export interface StudyActivityDto {
    id: number
    title: string
    description: string
    date: string
    duration: string
    color: string
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
export interface DashboardStudyTimeSummary {
    todayMinutes: number
    thisWeekMinutes: number
    thisMonthMinutes: number
    totalMinutes: number
    pomodoroCount: number
    normalSessionCount: number
}

export interface DashboardMockExamSummary {
    totalExams: number
    tytCount: number
    aytCount: number
    averageNet?: number
    lastExamNet?: number
    lastExamDate?: string
}

export interface DashboardTopicProgressSummary {
    totalTopics: number
    completedTopics: number
    remainingTopics: number
    completionPercentage: number
    tytCompleted: number
    tytRemaining: number
    aytCompleted: number
    aytRemaining: number
}

export interface DailyGoals {
    plannedStudyMinutes: number
    actualStudyMinutes: number
    plannedTopicsCount: number
    completedTopicsCount: number
    hasActivePlan: boolean
}

export interface Activity {
    type: string
    description: string
    date: string
}

export interface DashboardSummary {
    studyTime: DashboardStudyTimeSummary
    mockExam: DashboardMockExamSummary
    topicProgress: DashboardTopicProgressSummary
    dailyGoals: DailyGoals
    recentActivities: Activity[]
}


