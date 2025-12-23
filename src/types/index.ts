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
    displayName?: string
    userBadgeIcon?: string
// ...
export interface CommentDto {
    id: number
    postId: number
    userId: number
    userName: string
    displayName?: string
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
    profilePictureUrl?: string
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
    profilePictureUrl?: string
    isDeleted?: boolean
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

export interface ProfileStats {
    totalCompletedTasks: number
    totalPoints: number
    globalRank: number
}

// ... (skipping to end)

export interface PublicUserProfileDto {
    id: number
    userName: string
    firstName: string
    lastName: string
    profilePictureUrl?: string
    fieldType?: string
    joinDate: string
    streak?: {
        currentStreak: number
        maxStreak: number
        lastActivityDate: string
    }
    stats?: {
        totalCompletedTasks: number
        totalPoints: number
        globalRank: number
    }
    // Follow Stats
    isFollowing: boolean
    followersCount: number
    followingCount: number
    // 0: None, 1: Pending, 2: Accepted, 3: Rejected
    friendshipStatus: number

    badges: BadgeDto[]
}

// Messaging Types
export interface FriendDto {
    friendshipId: number
    friendId: number
    firstName: string
    lastName: string
    profilePictureUrl?: string
    lastMessage?: string
    lastMessageDate?: string
    isOnline: boolean
}

export interface MessageDto {
    id: number
    senderId: number
    receiverId: number
    content: string
    sentAt: string
    isRead: boolean
}

