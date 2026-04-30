import { logout } from "../utils/auth";

export default function LogoutButton() {

  const handleLogout = () => {
    const confirmLogout = confirm("¿Seguro que quieres cerrar sesión?");
    
    if (confirmLogout) {
      logout();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
    >
      Cerrar sesión
    </button>
  );
}