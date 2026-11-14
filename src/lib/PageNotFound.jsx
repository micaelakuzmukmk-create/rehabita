import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-soft blur-3xl" />
                <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-mist blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center">
                    <img src="/brand/rehabita-logo-horizontal.png" alt="ReHabita" className="mx-auto h-9 w-auto" />

                    <div className="mt-10">
                        <h1 className="font-heading text-[64px] font-semibold leading-none tracking-[-0.03em] text-brand-lavender">404</h1>
                        <div className="brand-hairline mx-auto mt-4 w-16" />
                    </div>

                    <div className="mt-6">
                        <h2 className="font-heading text-[22px] font-semibold tracking-tight text-foreground">
                            Page Not Found
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            The page <span className="font-medium text-foreground">"{pageName}"</span> could not be found in this application.
                        </p>
                    </div>

                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 rounded-2xl border border-warning/20 bg-warning-soft p-4 text-left">
                            <div className="flex items-start gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                                <div className="space-y-1">
                                    <p className="text-[13px] font-medium text-warning">Admin Note</p>
                                    <p className="text-[13px] leading-relaxed text-warning/90">
                                        This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <Button onClick={() => window.location.href = '/'} variant="outline">
                            <Home className="h-4 w-4" /> Go Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}