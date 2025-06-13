import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SessionTimeoutModalProps {
  isAuthenticated: boolean;
  onSessionExpired: () => void;
}

export function SessionTimeoutModal({ isAuthenticated, onSessionExpired }: SessionTimeoutModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds countdown
  const [isCountingDown, setIsCountingDown] = useState(false);

  const refreshSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/refresh-session", {
        method: "POST",
      });
    },
    onSuccess: () => {
      setIsOpen(false);
      setIsCountingDown(false);
      setTimeRemaining(90);
    },
    onError: () => {
      onSessionExpired();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      onSessionExpired();
    },
  });

  const checkSession = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiRequest("/api/auth/session-check");
      const data = await response.json();
      
      if (!data.authenticated) {
        onSessionExpired();
        return;
      }

      // Show warning when 30 minutes of inactivity is reached
      if (data.idleTime >= 30 * 60 * 1000 && !isOpen) {
        setIsOpen(true);
        setIsCountingDown(true);
        setTimeRemaining(90);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  }, [isAuthenticated, isOpen, onSessionExpired]);

  // Check session every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  // Countdown timer
  useEffect(() => {
    if (!isCountingDown) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsCountingDown(false);
          logoutMutation.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountingDown, logoutMutation]);

  const handleStayLoggedIn = () => {
    refreshSessionMutation.mutate();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = ((90 - timeRemaining) / 90) * 100;

  if (!isAuthenticated || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span>Session Timeout Warning</span>
          </DialogTitle>
          <DialogDescription>
            You've been inactive for 30 minutes. Your session will expire automatically if you don't respond.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-2 text-2xl font-mono">
            <Clock className="h-6 w-6 text-slate-500" />
            <span className="text-slate-900 dark:text-slate-100">
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Time remaining</span>
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleStayLoggedIn}
              disabled={refreshSessionMutation.isPending}
              className="flex-1"
            >
              {refreshSessionMutation.isPending ? "Refreshing..." : "Stay Logged In"}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex-1"
            >
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </Button>
          </div>

          <div className="text-xs text-center text-slate-500 dark:text-slate-400">
            If you don't respond within {formatTime(timeRemaining)}, you'll be automatically logged out for security.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}