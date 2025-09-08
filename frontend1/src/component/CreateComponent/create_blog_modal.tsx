// MyModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";

// import { X } from "lucide-react";

export function MyModal() {
  return (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-black text-white rounded">Open Modal</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Modal Title</DialogTitle>
        </DialogHeader>
        <p>This is the modal content.</p>
      </DialogContent>
    </Dialog>
  );
}
