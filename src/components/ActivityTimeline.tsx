import React, { useEffect, useState } from 'react';
import { activityService } from '../services/activityService';
import type { UserActivity } from '../types/UserActivity';
import { Activity, Heart, Zap, Shield, LogIn, Calendar, CheckCircle2 } from 'lucide-react';

const ActivityTimeline: React.FC = () => {
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                // Add timestamp to prevent caching
                const data = await activityService.getRecentActivities();
                setActivities(data);
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('login')) return <LogIn size={16} className="text-neon-cyan" />;
        if (t.includes('profile')) return <Heart size={16} className="text-pink-500" />;
        if (t.includes('password') || t.includes('security')) return <Shield size={16} className="text-neon-purple" />;
        if (t.includes('point') || t.includes('level')) return <Zap size={16} className="text-amber-400" />;
        if (t.includes('task') || t.includes('complete')) return <CheckCircle2 size={16} className="text-green-400" />;

        return <Activity size={16} className="text-gray-400" />;
    };

    const getFriendlyMessage = (activity: UserActivity) => {
        const t = activity.activityType.toLowerCase();
        const d = activity.description.toLowerCase();

        if (t.includes('login')) return 'Tekrar hoş geldin! Oturumu başlattın.';
        if (t.includes('password') || d.includes('password')) return 'Güvenlik önce gelir! Şifreni başarıyla güncelledin.';
        if (t.includes('profile') || d.includes('profile')) return 'Profilin harika görünüyor! Bilgilerini güncelledin.';
        if (t.includes('register')) return 'Aramıza hoş geldin! Yolculuğun başladı.';
        if (d.includes('points') || t.includes('gamification')) return 'Harika gidiyorsun! Yeni puanlar kazandın.';

        // Fallback to description but ensure it sounds natural if it's simple text, 
        // otherwise return the description as is.
        return activity.description;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Az önce';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
        if (diffInSeconds < 172800) return 'Dün';
        return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    };

    if (loading) return <div className="text-center text-gray-500 py-4">Yükleniyor...</div>;

    if (activities.length === 0) {
        return (
            <div className="bg-dark-300/50 backdrop-blur-md border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] hover:scale-[1.02] transition-transform duration-300 shadow-lg">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Activity className="text-gray-600" size={32} />
                </div>
                <h3 className="text-white font-medium text-lg mb-2">Yolculuğun burada başlıyor!</h3>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                    İlerlemeni görmek için ilk görevini tamamla. Seni bekleyen ödüller var!
                </p>
                <div className="px-4 py-2 bg-neon-cyan/10 text-neon-cyan rounded-lg border border-neon-cyan/20 text-sm font-medium">
                    Hadi Başlayalım
                </div>
            </div>
        )
    }

    return (
        <div className="bg-dark-300/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full min-h-[300px]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-neon-purple" />
                Zaman Tüneli
            </h3>
            <div className="space-y-6">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative pl-6 flex flex-col gap-1 group">
                        {/* Vertical Line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-white/10 group-hover:bg-white/20 transition-colors" />
                        )}

                        {/* Dot/Icon */}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-dark-400 border border-white/10 flex items-center justify-center shrink-0 z-10 text-white shadow-lg shadow-black/50 group-hover:scale-110 transition-transform">
                            {getIcon(activity.activityType)}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-snug">
                                {getFriendlyMessage(activity)}
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-neon-cyan/70 transition-colors mt-0.5">
                                {formatDate(activity.createdDate)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;
