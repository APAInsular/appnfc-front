import { useState } from 'preact/hooks';
import RegisterUserModal from './RegisterUserModal';

export default function AddUserTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#2eb0b0] hover:bg-[#269393] text-white text-[10px] font-bold py-3 rounded-xl mb-8 transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
      >
        <span>+ Añadir Usuario</span>
      </button>

      <RegisterUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}