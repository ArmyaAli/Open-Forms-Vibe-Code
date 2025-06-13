import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Facebook, Twitter, Mail, MessageSquare, Check } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The form link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Please fill out this form");
    const body = encodeURIComponent(`Hi,\n\nPlease fill out this form: ${shareUrl}\n\nThank you!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent("Check out this form");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Please fill out this form: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700">Form Link</Label>
            <div className="flex mt-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-slate-50 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="ml-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              Share via
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareViaTwitter}
                variant="outline"
                className="flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                <Twitter size={16} />
                Twitter
              </Button>
              <Button
                onClick={shareViaFacebook}
                variant="outline"
                className="flex items-center justify-center gap-2 bg-blue-700 text-white hover:bg-blue-800"
              >
                <Facebook size={16} />
                Facebook
              </Button>
              <Button
                onClick={shareViaWhatsApp}
                variant="outline"
                className="flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600"
              >
                <MessageSquare size={16} />
                WhatsApp
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="flex items-center justify-center gap-2 bg-slate-600 text-white hover:bg-slate-700"
              >
                <Mail size={16} />
                Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
