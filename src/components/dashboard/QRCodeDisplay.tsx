import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  restaurantId: string;
}

const QRCodeDisplay = ({ restaurantId }: QRCodeDisplayProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuUrl = `${window.location.origin}/menu/${restaurantId}`;

  useEffect(() => {
    generateQRCode();
  }, [restaurantId, qrColor]);

  const generateQRCode = async () => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, menuUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: qrColor,
            light: "#FFFFFF",
          },
        });

        const dataUrl = canvasRef.current.toDataURL();
        setQrCodeUrl(dataUrl);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.download = `menu-qr-code-${restaurantId}.png`;
      link.href = qrCodeUrl;
      link.click();
      toast.success("QR Code downloaded!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <canvas ref={canvasRef} className="border rounded-lg shadow-lg" />
        
        <div className="flex items-center gap-3">
          <label htmlFor="qr-color" className="text-sm font-medium">
            QR Code Color:
          </label>
          <input
            id="qr-color"
            type="color"
            value={qrColor}
            onChange={(e) => setQrColor(e.target.value)}
            className="h-10 w-20 rounded border cursor-pointer"
          />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Scan this QR code to view your menu</p>
          <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
            {menuUrl}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            onClick={() => window.open(menuUrl, '_blank')} 
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Menu
          </Button>
          
          <Button onClick={handleDownload} size="lg" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
