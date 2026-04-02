"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusSquare, X, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

const FILTERS = [
  { name: "Normal", class: "filter-none" },
  { name: "Vivid", class: "brightness-110 contrast-125 saturate-150" },
  { name: "Warm", class: "sepia-[.2] hue-rotate-[-10deg] saturate-120" },
  { name: "Cold", class: "contrast-110 saturate-110 hue-rotate-[10deg] brightness-105" },
  { name: "Mono", class: "grayscale brightness-110 contrast-125" },
  { name: "Soft", class: "opacity-90 contrast-90 brightness-110 blur-[0.3px]" },
];

export function UploadPlaceModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "filter" | "info">("upload");
  const [images, setImages] = useState<{file: File, preview: string, filter: string}[]>([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoading(true);
      const newFiles = Array.from(e.target.files);
      
      const compressedImages = await Promise.all(newFiles.map(async (file) => {
        // 🚀 용량 압축 (최대 2MB)
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1200, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        return {
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          filter: "filter-none"
        };
      }));

      setImages(prev => [...prev, ...compressedImages]);
      setStep("filter");
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setImages(updated);
    if (updated.length === 0) setStep("upload");
    else if (currentImgIndex >= updated.length) setCurrentImgIndex(updated.length - 1);
  };

  const applyFilter = (filterClass: string) => {
    const updated = [...images];
    updated[currentImgIndex].filter = filterClass;
    setImages(updated);
  };

  const reset = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setStep("upload");
    setCurrentImgIndex(0);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) reset(); setOpen(val); }}>
      <DialogTrigger>
          <div className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <PlusSquare className="h-8 w-8 text-gray-900 cursor-pointer mb-1" />
          </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-4 border-b text-center sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            {step !== "upload" && (
              <button onClick={() => setStep(step === "info" ? "filter" : "upload")} className="text-sm font-bold text-gray-400">戻る</button>
            )}
            <DialogTitle className="text-center flex-1 text-base font-bold">
              {step === "upload" ? "新規投稿" : step === "filter" ? "編集" : "詳細入力"}
            </DialogTitle>
            {step !== "upload" && (
              <button 
                onClick={() => setStep(step === "filter" ? "info" : "upload" /* 실제로는 제출 로직 */)} 
                className="text-sm font-bold text-primary"
              >
                {step === "info" ? "シェア" : "次へ"}
              </button>
            )}
            {step === "upload" && <div className="w-10"></div>}
          </div>
        </DialogHeader>

        <div className="min-h-[400px] flex flex-col bg-white">
          {step === "upload" && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
              {isLoading ? (
                <Loader2 className="h-12 w-12 text-gray-200 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-16 w-16 text-gray-200" />
                  <p className="text-lg font-medium text-gray-500">写真を選択してください</p>
                  <Button onClick={() => fileInputRef.current?.click()} className="rounded-full px-6 font-bold">PCから選択</Button>
                </>
              )}
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" />
            </div>
          )}

          {step === "filter" && images.length > 0 && (
            <div className="flex-1 flex flex-col">
              <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                <img 
                  src={images[currentImgIndex].preview} 
                  className={`max-w-full max-h-full object-contain transition-all duration-300 ${images[currentImgIndex].filter}`}
                  alt="preview"
                />
                <button onClick={() => removeImage(currentImgIndex)} className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 overflow-x-auto no-scrollbar flex gap-3 bg-white">
                {FILTERS.map((f) => (
                  <button 
                    key={f.name}
                    onClick={() => applyFilter(f.class)}
                    className="flex flex-col items-center gap-2 shrink-0 group"
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 border-2 transition-all border-transparent group-hover:border-primary">
                      <img src={images[currentImgIndex].preview} className={`w-full h-full object-cover ${f.class}`} alt={f.name} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "info" && (
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                   <img src={images[0].preview} className={`w-full h-full object-cover ${images[0].filter}`} alt="thumb" />
                </div>
                <Textarea placeholder="キャプションを書く..." className="flex-1 border-none focus-visible:ring-0 resize-none h-20 text-sm" />
              </div>
              <div className="border-y py-3">
                <Input placeholder="場所を追加..." className="border-none focus-visible:ring-0 h-10 text-sm" />
              </div>
              <div className="py-2">
                 <p className="text-xs text-gray-400">投稿ボタンを押すと、OneCoinMapに公開されます。</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
